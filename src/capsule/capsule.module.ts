import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Capsule } from '../entities/capsule.entity';
import { Task } from '../entities/task.entity';
import { CapsuleService } from './capsule.service';
import { CapsuleController } from './capsule.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Capsule, Task])],
  providers: [CapsuleService],
  controllers: [CapsuleController],
})
export class CapsuleModule {}
