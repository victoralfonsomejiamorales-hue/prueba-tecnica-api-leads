import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export enum UserRole {
  User = 'user',
  Admin = 'admin',
}

export enum UserSource {
  Instagram = 'instagram',
  Facebook = 'facebook',
  LandingPage = 'landing_page',
  Referral = 'referral',
  Other = 'other',
}

@Schema({
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
})
export class User {
  @Prop({
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true,
    unique: true,
  })
  email: string;

  @Prop({
    type: String,
    trim: true,
    select: false,
  })
  password: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    min: 2,
  })
  name: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    enum: Object.values(UserRole),
  })
  role: UserRole;

  @Prop({
    type: String,
    trim: true,
  })
  phone: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    enum: Object.values(UserSource),
  })
  source: UserSource;

  @Prop({
    type: String,
    trim: true,
  })
  interestProduct: string;

  @Prop({
    type: Number,
    trim: true,
    min: 0,
  })
  budget: number;

  @Prop({
    type: Boolean,
    default: true,
    index: true,
  })
  isLead: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.plugin(mongoosePaginate);

UserSchema.index({ source: 1, isLead: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ createdAt: -1, source: 1 });
UserSchema.index({ createdAt: -1, isLead: 1 });
UserSchema.index({ createdAt: -1, source: 1, isLead: 1 });
