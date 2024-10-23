import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Profile } from 'src/entities/profile.entity';
import { Skill } from 'src/entities/skill.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { Organization } from '../entities/organization.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Profile)
    private userProfileRepository: Repository<Profile>,
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  // Create a new user associated with an organization
  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['organization'], // Ensure organization is loaded
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  // Find the organization by its ID
  async findOrganizationById(id: string): Promise<Organization | undefined> {
    return this.organizationRepository.findOne({ where: { id } });
  }

  // Fetch a user by ID and organization
  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  // Find users by their organization
  findAllByOrganization(organizationId: string) {
    return this.userRepository.find({
      where: { organization: { id: organizationId } },
      select: ['id', 'name', 'email', 'avatar'],
    });
  }

  // Fetch the user's profile by their UUID
  async getProfile(userId: string): Promise<Profile | null> {
    const profile = await this.userProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['skills'],
    });
    if (!profile) {
      return null; // Return null if profile doesn't exist
    }
    return profile;
  }

  // Update the user profile, including bio, skills, name, and email, and optionally the password
  async updateProfile(
    userId: string,
    profileData: { bio: string; name: string; email: string; avatar?: string },
    skillsData: Skill[],
    password?: string,
  ): Promise<Profile> {
    // Fetch the user by ID
    const user = await this.findOne(userId);

    // Update the password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    if (profileData.avatar) {
      user.avatar = profileData.avatar; // Save Base64 avatar
    }

    // Update the user's name and email
    if (profileData.name) {
      user.name = profileData.name;
    }
    if (profileData.email) {
      user.email = profileData.email;
    }

    await this.userRepository.save(user);

    // Get or create the profile
    let profile = await this.userProfileRepository.findOne({
      where: { user },
      relations: ['skills'],
    });

    if (!profile) {
      profile = this.userProfileRepository.create({
        user,
        bio: profileData.bio, // Use bio from profileData
      });
      await this.userProfileRepository.save(profile);
    } else {
      // Update the existing profile bio
      profile.bio = profileData.bio;
      await this.userProfileRepository.save(profile);
    }

    // Update skills
    await this.skillRepository.delete({ profile: { id: profile.id } });
    const newSkills = skillsData.map((skill) =>
      this.skillRepository.create({ ...skill, profile }),
    );
    await this.skillRepository.save(newSkills);

    // Return updated profile with skills
    return this.userProfileRepository.findOne({
      where: { id: profile.id },
      relations: ['skills'],
    });
  }
}
