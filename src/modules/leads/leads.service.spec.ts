import { Test, TestingModule } from '@nestjs/testing';
import { LeadsService } from './services/leads.service';
import { LeadsRepository } from './repositories/leads.repository';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { UserRole, UserSource } from 'src/common/models/user.model';
import { AiService } from 'src/ai/ai.service';

describe('LeadsService', () => {
  let service: LeadsService;
  let repository: LeadsRepository;
  let aiService: AiService;

  const mockLeadsRepository = {
    getOne: jest.fn(),
    getOneById: jest.fn(),
    create: jest.fn(),
    getAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getStats: jest.fn(),
    getAiSummary: jest.fn(),
  };

  const mockAiService = {
    generateSummary: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        {
          provide: LeadsRepository,
          useValue: mockLeadsRepository,
        },
        {
          provide: AiService,
          useValue: mockAiService,
        },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
    repository = module.get<LeadsRepository>(LeadsRepository);
    aiService = module.get<AiService>(AiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
    expect(aiService).toBeDefined();
  });

  describe('create', () => {
    it('should throw ConflictException if lead already exists', async () => {
      const dto: RegisterDto = {
        email: 'test@test.com',
        name: 'Test User',
        role: UserRole.User,
        phone: '123456789',
        source: UserSource.LandingPage,
        interestProduct: 'product',
        budget: 1000,
        isLead: true,
      };
      mockLeadsRepository.getOne.mockResolvedValue({ id: '123' });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it('should create a lead if it does not exist', async () => {
      const dto: RegisterDto = {
        email: 'new@test.com',
        name: 'New User',
        role: UserRole.User,
        phone: '987654321',
        source: UserSource.LandingPage,
        interestProduct: 'product',
        budget: 1000,
        isLead: true,
      };
      mockLeadsRepository.getOne.mockResolvedValue(null);
      mockLeadsRepository.create.mockResolvedValue({ id: '123', ...dto });

      const result = await service.create(dto);
      expect(result).toHaveProperty('id');
      expect(mockLeadsRepository.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException if lead does not exist', async () => {
      mockLeadsRepository.getOneById.mockResolvedValue(null);
      await expect(service.update('invalid-id', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAll', () => {
    it('should call repository with correct pagination and filters', async () => {
      const query = { page: 2, limit: 5, source: UserSource.Facebook };
      mockLeadsRepository.getAll.mockResolvedValue({ docs: [], totalDocs: 0 });

      await service.getAll(query);

      expect(mockLeadsRepository.getAll).toHaveBeenCalledWith(2, 5, {
        isLead: true,
        source: UserSource.Facebook,
      });
    });

    it('should apply date range filters correctly', async () => {
      const query = {
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      };
      mockLeadsRepository.getAll.mockResolvedValue({ docs: [] });

      await service.getAll(query);

      const filterCalled = mockLeadsRepository.getAll.mock.calls[0][2];
      expect(filterCalled.createdAt.$gte).toBeInstanceOf(Date);
      expect(filterCalled.createdAt.$lte).toBeInstanceOf(Date);
    });
  });

  describe('getStats', () => {
    it('should format stats correctly and handle empty results', async () => {
      const mockRawStats = {
        totalLeads: [{ count: 10 }],
        leadsBySource: [{ source: 'Facebook', count: 5 }],
        avgBudget: [{ avg: 1500.5555 }],
        lastSevenDays: [{ count: 2 }],
      };
      mockLeadsRepository.getStats.mockResolvedValue(mockRawStats);

      const stats = await service.getStats();

      expect(stats.totalLeads).toBe(10);
      expect(stats.averageBudget).toBe(1500.56); // Verifica el redondeo .toFixed(2)
      expect(stats.leadsLastSevenDays).toBe(2);
    });

    it('should return default values (0) when repository returns empty arrays', async () => {
      const mockEmptyStats = {
        totalLeads: [],
        leadsBySource: [],
        avgBudget: [],
        lastSevenDays: [],
      };
      mockLeadsRepository.getStats.mockResolvedValue(mockEmptyStats);

      const stats = await service.getStats();

      expect(stats.totalLeads).toBe(0);
      expect(stats.averageBudget).toBe(0);
      expect(stats.leadsBySource).toEqual([]);
    });
  });

  describe('delete', () => {
    it('should throw NotFoundException if lead to delete is not found', async () => {
      mockLeadsRepository.getOneById.mockResolvedValue(null);

      await expect(service.delete('any-id')).rejects.toThrow(NotFoundException);
    });

    it('should call delete on repository if lead exists', async () => {
      mockLeadsRepository.getOneById.mockResolvedValue({ id: '123' });
      mockLeadsRepository.delete.mockResolvedValue({ id: '123' });

      await service.delete('123');
      expect(mockLeadsRepository.delete).toHaveBeenCalledWith('123');
    });
  });

  describe('getAiSummary', () => {
    it('should return a message if no leads are found', async () => {
      mockLeadsRepository.getAll.mockResolvedValue({ docs: [] });

      const result = await service.getAiSummary({});

      expect(result).toBe('No hay leads suficientes para generar un resumen.');
      expect(mockAiService.generateSummary).not.toHaveBeenCalled();
    });

    it('should call AiService and return the summary when leads exist', async () => {
      const mockLeads = [
        { email: 'test@test.com', source: UserSource.Instagram, budget: 1000 },
      ];
      const expectedSummary = 'Análisis General: Buenos leads...';

      mockLeadsRepository.getAll.mockResolvedValue({ docs: mockLeads });
      mockAiService.generateSummary.mockResolvedValue(expectedSummary);

      const result = await service.getAiSummary({
        source: UserSource.Instagram,
      });

      expect(mockLeadsRepository.getAll).toHaveBeenCalledWith(1, 10, {
        isLead: true,
        source: UserSource.Instagram,
      });

      expect(mockAiService.generateSummary).toHaveBeenCalledWith(mockLeads);
      expect(result).toBe(expectedSummary);
    });

    it('should propagate errors from AiService', async () => {
      mockLeadsRepository.getAll.mockResolvedValue({ docs: [{ id: '1' }] });
      mockAiService.generateSummary.mockRejectedValue(new Error('Groq Error'));

      await expect(service.getAiSummary({})).rejects.toThrow('Groq Error');
    });
  });
});
