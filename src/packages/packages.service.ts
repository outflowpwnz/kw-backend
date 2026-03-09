// src/packages/packages.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreatePackageDto } from './dto/create-package.dto';
import { OrderPackageDto } from './dto/order-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { Package } from './entities/package.entity';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package)
    private readonly repo: Repository<Package>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<Package[]> {
    return this.repo.find({ order: { sortOrder: 'ASC' } });
  }

  async findById(id: string): Promise<Package> {
    const pkg = await this.repo.findOne({ where: { id } });
    if (!pkg) throw new NotFoundException(`Пакет с ID ${id} не найден`);
    return pkg;
  }

  async create(dto: CreatePackageDto): Promise<Package> {
    const maxOrder = await this.repo.maximum('sortOrder') ?? 0;
    const pkg = this.repo.create({
      ...dto,
      price: dto.price ?? null,
      sortOrder: maxOrder + 1,
    });
    return this.repo.save(pkg);
  }

  async update(id: string, dto: UpdatePackageDto): Promise<Package> {
    const pkg = await this.findById(id);
    Object.assign(pkg, dto);
    return this.repo.save(pkg);
  }

  async reorder(id: string, dto: OrderPackageDto): Promise<Package[]> {
    return this.dataSource.transaction(async (em) => {
      const all = await em.find(Package, { order: { sortOrder: 'ASC' }, lock: { mode: 'pessimistic_write' } });
      const idx = all.findIndex((p) => p.id === id);
      if (idx === -1) throw new NotFoundException(`Пакет с ID ${id} не найден`);

      const swapIdx = dto.direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= all.length) {
        throw new ConflictException('Пакет уже на границе списка');
      }

      const tempOrder = -all[idx].sortOrder - 1;
      all[idx].sortOrder = tempOrder;
      await em.save(Package, all[idx]);

      all[idx].sortOrder = all[swapIdx].sortOrder;
      all[swapIdx].sortOrder = tempOrder * -1 - 1;

      await em.save(Package, [all[idx], all[swapIdx]]);
      return em.find(Package, { order: { sortOrder: 'ASC' } });
    });
  }

  async remove(id: string): Promise<void> {
    const pkg = await this.findById(id);
    await this.repo.remove(pkg);
  }
}
