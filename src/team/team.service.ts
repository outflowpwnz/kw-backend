// src/team/team.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { TeamMember } from './entities/team-member.entity';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(TeamMember)
    private readonly teamRepository: Repository<TeamMember>,
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

  async update(id: string, dto: UpdateTeamMemberDto): Promise<TeamMember> {
    const member = await this.findOne(id);
    Object.assign(member, dto);
    return this.teamRepository.save(member);
  }
}
