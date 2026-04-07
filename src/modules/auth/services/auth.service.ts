import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LeadsRepository } from '../../leads/repositories/leads.repository';
import { BcryptService } from '../../../utils/bcrypt.service';
import { LoginDto } from '../dto/login.dto';
import { Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly leadsRepository: LeadsRepository,
    private readonly bcryptService: BcryptService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const userExists = await this.leadsRepository.getOne(loginDto.email);
    if (!userExists || !userExists.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.bcryptService.comparePassword(
      loginDto.password,
      userExists.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: { sub: Types.ObjectId; email: string; role: string } = {
      sub: userExists._id,
      email: userExists.email,
      role: userExists.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      success: true,
      token,
      user: userExists,
    };
  }

  async createPassword(email: string, password: string) {
    const userExists = await this.leadsRepository.getOne(email);
    if (!userExists) {
      throw new UnauthorizedException('User not found');
    }

    const hashedPassword = await this.bcryptService.hashPassword(password);
    await this.leadsRepository.update(userExists._id.toString(), {
      password: hashedPassword,
    });

    return {
      success: true,
      message: 'Password created successfully',
    };
  }
}
