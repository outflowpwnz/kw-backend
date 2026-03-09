// src/team/team.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { OrderTeamMemberDto, TeamMemberOrderDirection } from './dto/order-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { TeamMember } from './entities/team-member.entity';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(TeamMember)
    private readonly teamRepository: Repository<TeamMember>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<TeamMember[]> {
    return this.teamRepository.find({ order: { sortOrder: 'ASC' } });
  }

  async findOne(id: string): Promise<TeamMember> {
    const member = await this.teamRepository.findOne({ where: { id } });
    if (!member) {
      throw new NotFoundException(`Участник команды с ID ${id} не найден`);
    }
    return member;
  }

  async create(dto: CreateTeamMemberDto): Promise<TeamMember> {
    const maxOrder = await this.teamRepository.maximum('sortOrder') ?? 0;
    const entity = this.teamRepository.create({
      ...dto,
      sortOrder: maxOrder + 1,
    });
    return this.teamRepository.save(entity);
  }

  async update(id: string, dto: UpdateTeamMemberDto): Promise<TeamMember> {
    const member = await this.findOne(id);
    Object.assign(member, dto);
    return this.teamRepository.save(member);
  }

  async remove(id: string): Promise<void> {
    const member = await this.findOne(id);
    await this.teamRepository.remove(member);
  }

  /**
   * Swap sort_order with adjacent item.
   * Throws 409 if already at boundary (first/last).
   */
  async reorder(id: string, dto: OrderTeamMemberDto): Promise<TeamMember[]> {
    const allItems = await this.teamRepository.find({ order: { sortOrder: 'ASC' } });
    const currentIndex = allItems.findIndex((i) => i.id === id);

    if (currentIndex === -1) {
      throw new NotFoundException(`Участник команды с ID ${id} не найден`);
    }

    const targetIndex =
      dto.direction === TeamMemberOrderDirection.UP ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0) {
      throw new ConflictException('Участник уже является первым в списке');
    }

    if (targetIndex >= allItems.length) {
      throw new ConflictException('Участник уже является последним в списке');
    }

    const current = allItems[currentIndex];
    const target = allItems[targetIndex];

    // Swap sort_order within a transaction using a temporary negative value
    // to avoid unique constraint violation during the swap.
    await this.dataSource.transaction(async (manager) => {
      const tempOrder = -current.sortOrder - 1;
      await manager.update(TeamMember, { id: current.id }, { sortOrder: tempOrder });
      await manager.update(TeamMember, { id: target.id }, { sortOrder: current.sortOrder });
      await manager.update(TeamMember, { id: current.id }, { sortOrder: target.sortOrder });
    });

    return this.teamRepository.find({ order: { sortOrder: 'ASC' } });
  }
}
