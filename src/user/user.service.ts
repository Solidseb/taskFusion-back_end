import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.userRepository.save(user);
  }

  findOne(id: number) {
    return this.userRepository.findOne({
      where: { id },
      relations: ['capsules'],
    });
  }

  findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  // New method to find all users
  findAll() {
    return this.userRepository.find({
      select: ['id', 'name', 'email'], // Select only necessary fields
    });
  }
}
