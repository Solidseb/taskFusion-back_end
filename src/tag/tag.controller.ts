import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  Get,
  Put,
  NotFoundException,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { OrganizationService } from '../organization/organization.service';

@Controller('tags')
export class TagController {
  constructor(
    private tagService: TagService,
    private organizationService: OrganizationService,
  ) {}

  @Post()
  async createTag(@Body() body: { name: string; organizationId: string }) {
    const organization = await this.organizationService.findById(
      body.organizationId,
    );

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return this.tagService.createTag(body.name, organization);
  }

  @Get('/:organizationId')
  async findAllByOrganization(@Param('organizationId') organizationId: string) {
    return this.tagService.findAllByOrganization(organizationId);
  }

  @Put('/:id')
  async updateTag(@Param('id') id: string, @Body() body: { name: string }) {
    const tag = await this.tagService.updateTag(id, body.name);

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return tag;
  }

  @Delete('/:id')
  async deleteTag(@Param('id') id: string) {
    await this.tagService.deleteTag(id);
  }
}
