// src/users/users.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findByLogin(login: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { login } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<Omit<User, 'passwordHash'>[]> {
    return this.usersRepository.find({
      select: ['id', 'login', 'name', 'role', 'createdAt', 'updatedAt'],
      order: { createdAt: 'ASC' },
    });
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  async createUser(dto: CreateUserDto): Promise<Omit<User, 'passwordHash'>> {
    const existing = await this.findByLogin(dto.login);
    if (existing) {
      throw new ConflictException(`Пользователь с логином "${dto.login}" уже существует`);
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepository.create({
      login: dto.login,
      name: dto.name,
      passwordHash,
    });
    const saved = await this.usersRepository.save(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...rest } = saved;
    return rest;
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Пользователь с ID ${id} не найден`);

    if (dto.name) user.name = dto.name;
    if (dto.password) user.passwordHash = await bcrypt.hash(dto.password, 10);

    const saved = await this.usersRepository.save(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...rest } = saved;
    return rest;
  }

  async removeUser(id: string, requestingUserId: string): Promise<void> {
    if (id === requestingUserId) {
      throw new BadRequestException('Нельзя удалить самого себя');
    }
    const count = await this.usersRepository.count();
    if (count <= 1) {
      throw new BadRequestException('Нельзя удалить последнего администратора');
    }
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Пользователь с ID ${id} не найден`);
    await this.usersRepository.remove(user);
  }
}
