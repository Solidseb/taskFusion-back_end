import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CapsuleModule } from './capsule/capsule.module';
import { TaskModule } from './task/task.module';
import { UserModule } from './user/user.module';
import { typeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { Comment } from './entities/comment.entity';
import { Task } from './entities/task.entity'; // Ensure Task entity is also imported

@Module({
  imports: [
    // Import the ConfigModule globally to access environment variables
    ConfigModule.forRoot({ isGlobal: true }),

    // Initialize TypeOrmModule asynchronously using the configuration function
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: typeOrmConfig, // Use the separate configuration function
    }),

    // Register the entities with TypeORM
    TypeOrmModule.forFeature([Comment, Task]), // Register Comment and Task entities

    // Import all other modules required in the application
    AuthModule,
    CapsuleModule,
    TaskModule,
    UserModule,
  ],
})
export class AppModule {}
