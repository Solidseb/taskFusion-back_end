import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationService } from './organization.service';
import { Organization } from '../entities/organization.entity';
import { OrganizationController } from './organization.controller';
import { Setting } from 'src/entities/setting.entity';
import { SettingController } from 'src/settings/setgings.controller';
import { SettingService } from 'src/settings/settings.service';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, Setting])],
  providers: [OrganizationService, SettingService],
  controllers: [OrganizationController, SettingController],
  exports: [OrganizationService, SettingService], // Export OrganizationService for other modules
})
export class OrganizationModule {}
