import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Types } from 'mongoose';
import { LeadsRepository } from 'src/modules/leads/repositories/leads.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly leadsRepository: LeadsRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwtSecret')!,
    });
  }

  async validate(payload: {
    sub: Types.ObjectId;
    email: string;
    role: string;
  }) {
    const user = await this.leadsRepository.getOne(payload.email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
