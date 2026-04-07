import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../../common/models/user.model';
import mongoose from 'mongoose';
import { RegisterDto } from '../dtos/register.dto';
import { filterType, StatsResult } from '../types/types';

@Injectable()
export class LeadsRepository {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: mongoose.PaginateModel<User>,
  ) {}

  async create(data: RegisterDto) {
    return this.userModel.create(data);
  }

  async getOne(email: string) {
    return this.userModel.findOne({ email }).select('+password').exec();
  }

  async getOneById(id: string) {
    return this.userModel.findById(id);
  }

  async getAll(page: number, limit: number, filter: filterType) {
    return this.userModel.paginate(filter, {
      page,
      limit,
      sort: { createdAt: -1 },
    });
  }

  async update(id: string, data: Partial<User>) {
    return this.userModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string) {
    return this.userModel.findByIdAndDelete(id);
  }

  async getStats() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [stats]: StatsResult[] = await this.userModel.aggregate([
      {
        $match: {
          isLead: true,
        },
      },
      {
        $facet: {
          totalLeads: [{ $count: 'count' }],
          leadsBySource: [
            { $group: { _id: '$source', count: { $sum: 1 } } },
            { $project: { _id: 0, source: '$_id', count: 1 } },
          ],
          avgBudget: [
            { $group: { _id: null, avg: { $avg: '$budget' } } },
            { $project: { _id: 0, avg: 1 } },
          ],
          lastSevenDays: [
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            { $count: 'count' },
          ],
        },
      },
    ]);

    return stats;
  }
}
