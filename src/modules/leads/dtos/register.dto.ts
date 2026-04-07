import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { UserRole, UserSource } from 'src/common/models/user.model';

export class RegisterDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  name: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(UserSource)
  source: UserSource;

  @IsOptional()
  @IsString()
  interestProduct: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budget: number;

  @IsBoolean()
  @IsNotEmpty()
  isLead: boolean;
}
