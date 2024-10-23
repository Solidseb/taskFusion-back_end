import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from '../entities/setting.entity';
import { Organization } from '../entities/organization.entity';

@Injectable()
export class SettingService {
  constructor(
    @InjectRepository(Setting)
    private settingRepository: Repository<Setting>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  async getSettingsByOrganization(organizationId: string): Promise<Setting> {
    return this.settingRepository.findOne({ where: { organizationId } });
  }

  async updateSettings(
    organizationId: string,
    settingsData: { subtasksEnabled: boolean; blockersEnabled: boolean },
  ): Promise<Setting> {
    let settings = await this.settingRepository.findOne({
      where: { organizationId },
    });

    if (!settings) {
      const organization = await this.organizationRepository.findOne({
        where: { id: organizationId },
      });
      if (!organization) {
        throw new Error('Organization not found');
      }
      settings = this.settingRepository.create({
        ...settingsData,
        organization,
      });
    } else {
      settings.subtasksEnabled = settingsData.subtasksEnabled;
      settings.blockersEnabled = settingsData.blockersEnabled;
    }

    return this.settingRepository.save(settings);
  }
}
