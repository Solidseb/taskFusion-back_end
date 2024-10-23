import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../entities/tag.entity';
import { Organization } from '../entities/organization.entity';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  async createTag(name: string, organization: Organization): Promise<Tag> {
    const tag = this.tagRepository.create({ name, organization });
    return this.tagRepository.save(tag);
  }

  async findAllByOrganization(organizationId: string): Promise<Tag[]> {
    return this.tagRepository.find({
      where: { organization: { id: organizationId } },
    });
  }

  async updateTag(id: string, name: string): Promise<Tag | null> {
    const tag = await this.tagRepository.findOne({ where: { id } });
    if (!tag) {
      return null;
    }

    tag.name = name;
    return this.tagRepository.save(tag);
  }

  async deleteTag(id: string): Promise<void> {
    await this.tagRepository.delete(id);
  }
}
