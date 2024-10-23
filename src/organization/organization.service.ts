import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { randomBytes } from 'crypto';
import { Setting } from '../entities/setting.entity';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,

    @InjectRepository(Setting)
    private settingRepository: Repository<Setting>,
  ) {}

  // Create an organization and generate a secret token
  async createOrganization(
    name: string,
    emailDomain: string,
  ): Promise<Organization> {
    const secretToken = randomBytes(32).toString('hex');

    // Create the organization with the generated secret token
    const organization = this.organizationRepository.create({
      name,
      emailDomain,
      secretToken, // Store the generated secret token
    });

    const savedOrganization =
      await this.organizationRepository.save(organization);

    // Create default settings for the new organization
    const defaultSettings = this.settingRepository.create({
      subtasksEnabled: true, // Default setting
      blockersEnabled: true, // Default setting
      organization: savedOrganization, // Link to the created organization
    });

    await this.settingRepository.save(defaultSettings);

    return savedOrganization;
  }

  // Validate the secret token when registering a user
  async validateSecretToken(
    organizationId: string,
    secretToken: string,
  ): Promise<boolean> {
    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId, secretToken },
    });

    return !!organization; // Return true if the secret token is valid
  }

  // Find organization by ID
  async findById(id: string): Promise<Organization | undefined> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
      relations: ['settings'], // Fetch organization settings as well
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return organization;
  }

  // Find organization by email domain
  async findByEmailDomain(
    emailDomain: string,
  ): Promise<Organization | undefined> {
    return this.organizationRepository.findOne({ where: { emailDomain } });
  }

  // Update the organization's settings
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
        throw new NotFoundException('Organization not found');
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
