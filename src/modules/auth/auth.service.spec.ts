import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { Types } from 'mongoose';
import { BcryptService } from 'src/utils/bcrypt.service';
import { LeadsRepository } from '../leads/repositories/leads.repository';
import { CreatePasswordDto } from './dto/create-password.dto';

describe('AuthService', () => {
  let service: AuthService;
  let leadsRepository: LeadsRepository;
  let bcryptService: BcryptService;
  let jwtService: JwtService;

  // 1. Definición de Mocks
  const mockLeadsRepository = {
    getOne: jest.fn(),
    update: jest.fn(),
  };

  const mockBcryptService = {
    comparePassword: jest.fn(),
    hashPassword: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: LeadsRepository, useValue: mockLeadsRepository },
        { provide: BcryptService, useValue: mockBcryptService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    leadsRepository = module.get<LeadsRepository>(LeadsRepository);
    bcryptService = module.get<BcryptService>(BcryptService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(leadsRepository).toBeDefined();
    expect(bcryptService).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  describe('login', () => {
    const loginDto = { email: 'victor@test.com', password: 'password123' };
    const mockUser = {
      _id: new Types.ObjectId(),
      email: 'victor@test.com',
      password: 'hashed_password',
      role: 'admin',
    };

    it('should throw UnauthorizedException if user does not exist', async () => {
      mockLeadsRepository.getOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      mockLeadsRepository.getOne.mockResolvedValue(mockUser);
      mockBcryptService.comparePassword.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return a token and user data on successful login', async () => {
      mockLeadsRepository.getOne.mockResolvedValue(mockUser);
      mockBcryptService.comparePassword.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('mock_jwt_token');

      const result = await service.login(loginDto);

      expect(result).toEqual({
        success: true,
        token: 'mock_jwt_token',
        user: mockUser,
      });
      expect(mockJwtService.sign).toHaveBeenCalled();
    });
  });

  describe('createPassword', () => {
    const email = 'victor@test.com';
    const pass = 'newPassword';
    const mockUser = { _id: new Types.ObjectId(), email };

    it('should hash the password and update the user', async () => {
      mockLeadsRepository.getOne.mockResolvedValue(mockUser);
      mockBcryptService.hashPassword.mockResolvedValue('new_hashed_password');
      mockLeadsRepository.update.mockResolvedValue({});

      const result = await service.createPassword({
        email,
        password: pass,
      } as CreatePasswordDto);

      expect(result.success).toBe(true);
      expect(mockBcryptService.hashPassword).toHaveBeenCalledWith(pass);
      expect(mockLeadsRepository.update).toHaveBeenCalledWith(
        mockUser._id.toString(),
        { password: 'new_hashed_password' },
      );
    });

    it('should throw UnauthorizedException if user to update is not found', async () => {
      mockLeadsRepository.getOne.mockResolvedValue(null);

      await expect(
        service.createPassword({ email, password: pass } as CreatePasswordDto),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
