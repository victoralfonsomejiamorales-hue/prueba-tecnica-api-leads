import { Body, Controller, Patch, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { Public } from 'src/common/decorators/public.decorator';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Patch('create-password')
  async createPassword(
    @Body() createPasswordDto: { email: string; password: string },
  ) {
    return this.authService.createPassword(
      createPasswordDto.email,
      createPasswordDto.password,
    );
  }
}
