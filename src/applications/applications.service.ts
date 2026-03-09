// src/applications/applications.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { FilterApplicationDto } from './dto/filter-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { Application, ApplicationStatus } from './entities/application.entity';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationsRepository: Repository<Application>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(dto: CreateApplicationDto): Promise<Application> {
    const application = this.applicationsRepository.create({
      ...dto,
      status: ApplicationStatus.NEW,
    });
    return this.applicationsRepository.save(application);
  }

  async findAll(filter: FilterApplicationDto): Promise<PaginatedResult<Application>> {
    const { status, page = 1, limit = 20, dateFrom, dateTo } = filter;

    const where: FindOptionsWhere<Application> = {};

    if (status) {
      where.status = status;
    }

    if (dateFrom && dateTo) {
      where.createdAt = Between(new Date(dateFrom), new Date(dateTo + 'T23:59:59.999Z'));
    } else if (dateFrom) {
      where.createdAt = Between(new Date(dateFrom), new Date('9999-12-31'));
    } else if (dateTo) {
      where.createdAt = Between(new Date('2000-01-01'), new Date(dateTo + 'T23:59:59.999Z'));
    }

    const [data, total] = await this.applicationsRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['assignedTo'],
    });

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Application> {
    const application = await this.applicationsRepository.findOne({
      where: { id },
      relations: ['assignedTo'],
    });

    if (!application) {
      throw new NotFoundException(`Заявка с ID ${id} не найдена`);
    }

    return application;
  }

  async update(id: string, dto: UpdateApplicationDto): Promise<Application> {
    const application = await this.findOne(id);

    if (dto.assignedToId) {
      const userExists = await this.usersRepository.existsBy({ id: dto.assignedToId });
      if (!userExists) {
        throw new NotFoundException(`Пользователь с id ${dto.assignedToId} не найден`);
      }
    }

    Object.assign(application, dto);
    return this.applicationsRepository.save(application);
  }

  async takeApplication(id: string, userId: string): Promise<Application> {
    const application = await this.applicationsRepository.findOne({ where: { id } });

    if (!application) {
      throw new NotFoundException(`Заявка с ID ${id} не найдена`);
    }

    if (application.status === ApplicationStatus.CLOSED) {
      throw new BadRequestException('Анкета уже закрыта');
    }

    application.assignedTo = { id: userId } as User;
    application.assignedToId = userId;
    application.status = ApplicationStatus.IN_PROGRESS;

    return this.applicationsRepository.save(application);
  }

  async closeApplication(id: string): Promise<Application> {
    const application = await this.applicationsRepository.findOne({ where: { id } });

    if (!application) {
      throw new NotFoundException(`Заявка с ID ${id} не найдена`);
    }

    if (application.status === ApplicationStatus.CLOSED) {
      throw new BadRequestException('Анкета уже закрыта');
    }

    application.status = ApplicationStatus.CLOSED;
    application.completedAt = new Date();

    return this.applicationsRepository.save(application);
  }

  async remove(id: string): Promise<void> {
    const application = await this.findOne(id);
    await this.applicationsRepository.remove(application);
  }

  async exportToCsv(filter?: FilterApplicationDto): Promise<string> {
    const where: FindOptionsWhere<Application> = {};

    if (filter?.status) {
      where.status = filter.status;
    }

    if (filter?.dateFrom && filter?.dateTo) {
      where.createdAt = Between(new Date(filter.dateFrom), new Date(filter.dateTo + 'T23:59:59.999Z'));
    } else if (filter?.dateFrom) {
      where.createdAt = Between(new Date(filter.dateFrom), new Date('9999-12-31'));
    } else if (filter?.dateTo) {
      where.createdAt = Between(new Date('2000-01-01'), new Date(filter.dateTo + 'T23:59:59.999Z'));
    }

    // Hard cap at 10 000 rows to prevent memory exhaustion on large datasets.
    const applications = await this.applicationsRepository.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['assignedTo'],
      take: 10_000,
    });

    const headers = [
      'ID',
      'Статус',
      'Пара',
      'Instagram',
      'Контакт',
      'Дата свадьбы',
      'Кол-во гостей',
      'Бюджет',
      'Источник',
      'Ответственный',
      'Дата создания',
    ];

    const escapeCsv = (value: unknown): string => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = applications.map((app) => [
      app.id,
      app.status,
      app.coupleName ?? '',
      app.instagram,
      app.contact,
      app.weddingDate ?? '',
      app.guestsCount !== null ? String(app.guestsCount) : '',
      app.budget ?? '',
      app.source ?? '',
      app.assignedTo?.name ?? '',
      app.createdAt.toISOString(),
    ]);

    const lines = [headers, ...rows].map((row) => row.map(escapeCsv).join(','));
    return '\uFEFF' + lines.join('\r\n'); // BOM for Excel
  }
}
