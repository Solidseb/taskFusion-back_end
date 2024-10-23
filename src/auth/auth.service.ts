import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { SettingService } from '../settings/settings.service'; // Import SettingsService
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private settingsService: SettingService, // Inject SettingsService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      // Return user data without password
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null; // User not found or password mismatch
  }

  async login(user: any) {
    // Include organizationId in the payload
    const payload = {
      email: user.email,
      sub: user.id,
      organizationId: user.organizationId, // Include the organizationId
    };

    // Fetch organization settings based on organizationId
    const settings = await this.settingsService.getSettingsByOrganization(
      user.organizationId,
    );

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        organizationId: user.organizationId, // Return organization info
      },
      settings, // Include settings in the response
    };
  }
}
