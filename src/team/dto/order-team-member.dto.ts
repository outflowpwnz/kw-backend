// src/team/dto/order-team-member.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum TeamMemberOrderDirection {
  UP = 'up',
  DOWN = 'down',
}

export class OrderTeamMemberDto {
  @ApiProperty({ enum: TeamMemberOrderDirection, description: 'Направление перемещения', example: 'up' })
  @IsNotEmpty()
  @IsEnum(TeamMemberOrderDirection)
  direction: TeamMemberOrderDirection;
}
