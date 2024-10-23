import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@Controller('organizations')
export class OrganizationController {
  constructor(private organizationService: OrganizationService) {}

  @Post()
  async createOrganization(
    @Body() createOrganizationDto: CreateOrganizationDto,
  ) {
    const existingOrganization =
      await this.organizationService.findByEmailDomain(
        createOrganizationDto.emailDomain,
      );

    if (existingOrganization) {
      throw new BadRequestException(
        'Organization with this email domain already exists.',
      );
    }

    return this.organizationService.createOrganization(
      createOrganizationDto.name,
      createOrganizationDto.emailDomain,
    );
  }
}
