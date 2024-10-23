import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationService } from './organization.service';
import { Organization } from '../entities/organization.entity';
import { OrganizationController } from './organization.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Organization])],
  providers: [OrganizationService],
  controllers: [OrganizationController],
  exports: [OrganizationService], // Export OrganizationService for other modules
})
export class OrganizationModule {}
