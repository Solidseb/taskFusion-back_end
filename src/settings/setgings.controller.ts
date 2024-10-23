import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { SettingService } from './settings.service';

@Controller('settings')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get(':organizationId')
  async getSettings(@Param('organizationId') organizationId: string) {
    return this.settingService.getSettingsByOrganization(organizationId);
  }

  @Put(':organizationId')
  async updateSettings(
    @Param('organizationId') organizationId: string,
    @Body()
    settingsData: { subtasksEnabled: boolean; blockersEnabled: boolean },
  ) {
    return this.settingService.updateSettings(organizationId, settingsData);
  }
}
