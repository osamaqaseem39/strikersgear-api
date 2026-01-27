import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Admin, AdminDocument } from '../../schemas/admin.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async hasAdmin(): Promise<boolean> {
    const count = await this.adminModel.countDocuments().exec();
    return count > 0;
  }

  async register(
    password: string,
  ): Promise<{ success: boolean; token?: string }> {
    const exists = await this.hasAdmin();
    if (exists) {
      throw new ConflictException('Admin already registered');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    await this.adminModel.create({ passwordHash });

    const payload = { sub: 'admin' };
    const token = this.jwtService.sign(payload);
    return { success: true, token };
  }

  async login(
    password: string,
  ): Promise<{ success: boolean; token?: string }> {
    const admin = await this.adminModel.findOne().exec();
    if (!admin) return { success: false };

    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) return { success: false };

    const payload = { sub: 'admin' };
    const token = this.jwtService.sign(payload);
    return { success: true, token };
  }
}
