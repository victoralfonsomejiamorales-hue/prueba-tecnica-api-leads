import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LeadsRepository } from '../repositories/leads.repository';
import { RegisterDto } from '../dtos/register.dto';
import { filterType, getLeadsQueryType } from '../types/types';
import { AiService } from 'src/utils/ai/ai.service';
import { UserRole, UserSource } from 'src/common/models/user.model';
import { TypeformWebhookPayload } from '../interfaces/typeform.interface';

@Injectable()
export class LeadsService {
  constructor(
    private readonly leadsRepository: LeadsRepository,
    private readonly aiService: AiService,
  ) {}

  async create(data: RegisterDto) {
    const existingLead = await this.leadsRepository.getOne(data.email);
    if (existingLead) {
      throw new ConflictException('Lead already exists');
    }
    return this.leadsRepository.create(data);
  }

  async getOneById(id: string) {
    return this.leadsRepository.getOneById(id);
  }

  async getAll(query: getLeadsQueryType) {
    const { page = 1, limit = 10, source, startDate, endDate } = query;

    const filter: filterType = { isLead: true };

    if (source) {
      filter.source = source;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    return this.leadsRepository.getAll(page, limit, filter);
  }

  async update(id: string, data: Partial<RegisterDto>) {
    const existingLead = await this.leadsRepository.getOneById(id);
    if (!existingLead) {
      throw new NotFoundException('Lead not found');
    }
    return this.leadsRepository.update(id, data);
  }

  async delete(id: string) {
    const existingLead = await this.leadsRepository.getOneById(id);
    if (!existingLead) {
      throw new NotFoundException('Lead not found');
    }
    return this.leadsRepository.delete(id);
  }

  async getStats() {
    const raw = await this.leadsRepository.getStats();

    return {
      totalLeads: raw.totalLeads[0]?.count ?? 0,
      leadsBySource: raw.leadsBySource ?? [],
      averageBudget: Number((raw.avgBudget[0]?.avg ?? 0).toFixed(2)),
      leadsLastSevenDays: raw.lastSevenDays[0]?.count ?? 0,
    };
  }

  async getAiSummary(query: getLeadsQueryType) {
    const { docs: leads } = await this.getAll(query);

    if (leads.length === 0) {
      return 'No hay leads suficientes para generar un resumen.';
    }

    return this.aiService.generateSummary(leads);
  }

  async handleWebhook(data: TypeformWebhookPayload) {
    const { form_response } = data;

    const emailAnswer = form_response.answers.find(
      (ans) => ans.type === 'email',
    );
    const nameAnswer = form_response.answers.find((ans) => ans.type === 'text');
    const phoneAnswer = form_response.answers.find(
      (ans) => ans.type === 'phone_number',
    );

    const email = emailAnswer?.email;
    if (!email) {
      throw new BadRequestException('Email not found in webhook payload');
    }

    const existingLead = await this.leadsRepository.getOne(email);
    if (existingLead) {
      return {
        success: true,
        message: 'Lead already exists, skipping creation',
      };
    }

    const leadData: RegisterDto = {
      email,
      name: nameAnswer?.text || 'User de Typeform',
      role: UserRole.User,
      source: UserSource.Typeform,
      isLead: true,
      phone: phoneAnswer?.phone_number || '',
      interestProduct: form_response.definition.title,
      budget: 0,
    };

    const newLead = await this.leadsRepository.create(leadData);

    return {
      success: true,
      leadId: newLead._id,
      message: 'Lead created from Typeform',
    };
  }
}
