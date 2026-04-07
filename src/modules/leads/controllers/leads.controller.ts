import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { LeadsService } from '../services/leads.service';
import { GetLeadsQueryDto } from '../dtos/get-leads-query.dto';
import { RegisterDto } from '../dtos/register.dto';
import { UpdateUserDto } from '../dtos/update.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  create(@Body() data: RegisterDto) {
    return this.leadsService.create(data);
  }

  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('ai/summary')
  async getSummary(@Query() query: GetLeadsQueryDto) {
    const summary = await this.leadsService.getAiSummary(query);
    return { summary };
  }

  @Get()
  async getAll(@Query() query: GetLeadsQueryDto) {
    return this.leadsService.getAll(query);
  }

  @Get('stats')
  async getStats() {
    return this.leadsService.getStats();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.leadsService.getOneById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateUserDto) {
    return this.leadsService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.leadsService.delete(id);
  }
}
