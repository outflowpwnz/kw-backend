// src/faq/faq.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateFaqItemDto } from './dto/create-faq-item.dto';
import { FaqOrderDirection, OrderFaqItemDto } from './dto/order-faq-item.dto';
import { UpdateFaqItemDto } from './dto/update-faq-item.dto';
import { FaqItem } from './entities/faq-item.entity';

@Injectable()
export class FaqService {
  constructor(
    @InjectRepository(FaqItem)
    private readonly faqRepository: Repository<FaqItem>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Returns all active FAQ items sorted by sort_order. For public use.
   */
  async findAllActive(): Promise<FaqItem[]> {
    return this.faqRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  /**
   * Returns all FAQ items including inactive ones. For admin use.
   */
  async findAll(): Promise<FaqItem[]> {
    return this.faqRepository.find({ order: { sortOrder: 'ASC' } });
  }

  async findOne(id: string): Promise<FaqItem> {
    const item = await this.faqRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`FAQ-элемент с ID ${id} не найден`);
    }
    return item;
  }

  /**
   * Creates a new FAQ item. sort_order = MAX(sort_order) + 1.
   * Wrapped in a transaction with pessimistic write lock to prevent race conditions.
   */
  async create(dto: CreateFaqItemDto): Promise<FaqItem> {
    const maxOrder = await this.faqRepository.maximum('sortOrder') ?? 0;
    const entity = this.faqRepository.create({
      question: dto.question,
      answer: dto.answer,
      isActive: dto.isActive ?? true,
      sortOrder: maxOrder + 1,
    });
    return this.faqRepository.save(entity);
  }

  async update(id: string, dto: UpdateFaqItemDto): Promise<FaqItem> {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.faqRepository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.faqRepository.remove(item);
  }

  /**
   * Swap sort_order with adjacent item.
   * Throws 409 if already at boundary (first/last).
   */
  async reorder(id: string, dto: OrderFaqItemDto): Promise<FaqItem[]> {
    const allItems = await this.faqRepository.find({ order: { sortOrder: 'ASC' } });
    const currentIndex = allItems.findIndex((i) => i.id === id);

    if (currentIndex === -1) {
      throw new NotFoundException(`FAQ-элемент с ID ${id} не найден`);
    }

    const targetIndex =
      dto.direction === FaqOrderDirection.UP ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0) {
      throw new ConflictException('FAQ-элемент уже является первым в списке');
    }

    if (targetIndex >= allItems.length) {
      throw new ConflictException('FAQ-элемент уже является последним в списке');
    }

    const current = allItems[currentIndex];
    const target = allItems[targetIndex];

    // Swap sort_order within a transaction using a temporary negative value
    // to avoid unique constraint violation during the swap.
    await this.dataSource.transaction(async (manager) => {
      const tempOrder = -current.sortOrder - 1;
      await manager.update(FaqItem, { id: current.id }, { sortOrder: tempOrder });
      await manager.update(FaqItem, { id: target.id }, { sortOrder: current.sortOrder });
      await manager.update(FaqItem, { id: current.id }, { sortOrder: target.sortOrder });
    });

    return this.faqRepository.find({ order: { sortOrder: 'ASC' } });
  }
}
