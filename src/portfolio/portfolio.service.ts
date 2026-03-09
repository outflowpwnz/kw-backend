// src/portfolio/portfolio.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { OrderDirection, OrderPortfolioDto } from './dto/order-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { PortfolioCase } from './entities/portfolio-case.entity';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(PortfolioCase)
    private readonly portfolioRepository: Repository<PortfolioCase>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<PortfolioCase[]> {
    return this.portfolioRepository.find({ order: { sortOrder: 'ASC' } });
  }

  async findOne(id: string): Promise<PortfolioCase> {
    const item = await this.portfolioRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Кейс портфолио с ID ${id} не найден`);
    }
    return item;
  }

  async create(dto: CreatePortfolioDto): Promise<PortfolioCase> {
    const maxOrder = await this.portfolioRepository.maximum('sortOrder') ?? 0;
    const entity = this.portfolioRepository.create({ ...dto, sortOrder: maxOrder + 1 });
    return this.portfolioRepository.save(entity);
  }

  async update(id: string, dto: UpdatePortfolioDto): Promise<PortfolioCase> {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.portfolioRepository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.portfolioRepository.remove(item);
  }

  /**
   * Swap sort_order with adjacent item.
   * Throws 409 if already at boundary (first/last).
   */
  async reorder(id: string, dto: OrderPortfolioDto): Promise<PortfolioCase[]> {
    const allItems = await this.portfolioRepository.find({ order: { sortOrder: 'ASC' } });
    const currentIndex = allItems.findIndex((i) => i.id === id);

    if (currentIndex === -1) {
      throw new NotFoundException(`Кейс портфолио с ID ${id} не найден`);
    }

    const targetIndex =
      dto.direction === OrderDirection.UP ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0) {
      throw new ConflictException('Кейс уже является первым в списке');
    }

    if (targetIndex >= allItems.length) {
      throw new ConflictException('Кейс уже является последним в списке');
    }

    const current = allItems[currentIndex];
    const target = allItems[targetIndex];

    // Swap sort_order within a transaction
    await this.dataSource.transaction(async (manager) => {
      const tempOrder = -current.sortOrder - 1; // Use negative to avoid unique constraint violation
      await manager.update(PortfolioCase, { id: current.id }, { sortOrder: tempOrder });
      await manager.update(PortfolioCase, { id: target.id }, { sortOrder: current.sortOrder });
      await manager.update(PortfolioCase, { id: current.id }, { sortOrder: target.sortOrder });
    });

    return this.portfolioRepository.find({ order: { sortOrder: 'ASC' } });
  }
}
