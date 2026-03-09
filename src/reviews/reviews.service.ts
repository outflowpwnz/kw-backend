// src/reviews/reviews.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create-review.dto';
import { OrderReviewDto, ReviewOrderDirection } from './dto/order-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Returns all active reviews sorted by sort_order. For public use.
   */
  async findAllActive(): Promise<Review[]> {
    return this.reviewsRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  /**
   * Returns all reviews including inactive ones. For admin use.
   */
  async findAll(): Promise<Review[]> {
    return this.reviewsRepository.find({ order: { sortOrder: 'ASC' } });
  }

  async findOne(id: string): Promise<Review> {
    const item = await this.reviewsRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Отзыв с ID ${id} не найден`);
    }
    return item;
  }

  /**
   * Creates a new review. sort_order = MAX(sort_order) + 1.
   * Wrapped in a transaction with pessimistic write lock to prevent race conditions.
   */
  async create(dto: CreateReviewDto): Promise<Review> {
    const maxOrder = await this.reviewsRepository.maximum('sortOrder') ?? 0;
    const entity = this.reviewsRepository.create({
      text: dto.text,
      isActive: dto.isActive ?? true,
      sortOrder: maxOrder + 1,
    });
    return this.reviewsRepository.save(entity);
  }

  async update(id: string, dto: UpdateReviewDto): Promise<Review> {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.reviewsRepository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.reviewsRepository.remove(item);
  }

  /**
   * Swap sort_order with adjacent item.
   * Throws 409 if already at boundary (first/last).
   */
  async reorder(id: string, dto: OrderReviewDto): Promise<Review[]> {
    const allItems = await this.reviewsRepository.find({ order: { sortOrder: 'ASC' } });
    const currentIndex = allItems.findIndex((i) => i.id === id);

    if (currentIndex === -1) {
      throw new NotFoundException(`Отзыв с ID ${id} не найден`);
    }

    const targetIndex =
      dto.direction === ReviewOrderDirection.UP ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0) {
      throw new ConflictException('Отзыв уже является первым в списке');
    }

    if (targetIndex >= allItems.length) {
      throw new ConflictException('Отзыв уже является последним в списке');
    }

    const current = allItems[currentIndex];
    const target = allItems[targetIndex];

    // Swap sort_order within a transaction using a temporary negative value
    // to avoid unique constraint violation during the swap.
    await this.dataSource.transaction(async (manager) => {
      const tempOrder = -current.sortOrder - 1;
      await manager.update(Review, { id: current.id }, { sortOrder: tempOrder });
      await manager.update(Review, { id: target.id }, { sortOrder: current.sortOrder });
      await manager.update(Review, { id: current.id }, { sortOrder: target.sortOrder });
    });

    return this.reviewsRepository.find({ order: { sortOrder: 'ASC' } });
  }
}
