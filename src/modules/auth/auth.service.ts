import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  // Simple admin authentication
  // In production, use JWT tokens and password hashing
  private readonly adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  async validateAdmin(password: string): Promise<boolean> {
    return password === this.adminPassword;
  }

  async login(password: string): Promise<{ success: boolean; token?: string }> {
    const isValid = await this.validateAdmin(password);
    if (isValid) {
      // In production, generate JWT token here
      return { success: true, token: 'admin-token' };
    }
    return { success: false };
  }
}
