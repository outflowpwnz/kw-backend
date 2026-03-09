// src/faq/faq.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FaqItem } from './entities/faq-item.entity';
import { FaqController } from './faq.controller';
import { FaqService } from './faq.service';

@Module({
  imports: [TypeOrmModule.forFeature([FaqItem])],
  controllers: [FaqController],
  providers: [FaqService],
  exports: [FaqService],
})
export class FaqModule {}
