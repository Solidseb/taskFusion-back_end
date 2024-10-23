import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { randomBytes } from 'crypto';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  // Create an organization and generate a secret token
  async createOrganization(
    name: string,
    emailDomain: string,
  ): Promise<Organization> {
    const secretToken = randomBytes(32).toString('hex');

    const organization = this.organizationRepository.create({
      name,
      emailDomain,
      secretToken, // Store the generated secret token
    });

    return this.organizationRepository.save(organization);
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

  async findById(id: string): Promise<Organization | undefined> {
    return this.organizationRepository.findOne({
      where: { id },
    });
  }

  async findByEmailDomain(
    emailDomain: string,
  ): Promise<Organization | undefined> {
    return this.organizationRepository.findOne({ where: { emailDomain } });
  }
}
