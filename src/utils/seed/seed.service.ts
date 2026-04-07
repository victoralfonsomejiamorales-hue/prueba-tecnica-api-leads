import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User, UserRole, UserSource } from 'src/common/models/user.model';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: mongoose.PaginateModel<User>,
  ) {}

  sampleLeads = [
    {
      email: 'maria.garcia@example.com',
      name: 'María García',
      role: UserRole.User,
      phone: '+5215512345678',
      source: UserSource.Instagram,
      interestProduct: 'Curso de Marketing Digital',
      budget: 5000,
      isLead: true,
    },
    {
      email: 'carlos.rodriguez@empresa.com',
      name: 'Carlos Rodríguez',
      role: UserRole.User,
      phone: '+5255987654321',
      source: UserSource.Facebook,
      interestProduct: 'Consultoría SEO',
      budget: 15000,
      isLead: true,
    },
    {
      email: 'ana.martinez@email.com',
      name: 'Ana Martínez',
      role: UserRole.User,
      phone: '+523312345678',
      source: UserSource.LandingPage,
      interestProduct: 'Diseño Web',
      budget: 8000,
      isLead: true,
    },
    {
      email: 'luis.hernandez@startup.mx',
      name: 'Luis Hernández',
      role: UserRole.User,
      phone: '+5281444332211',
      source: UserSource.Referral,
      interestProduct: 'Desarrollo de Apps',
      budget: 25000,
      isLead: true,
    },
    {
      email: 'sofia.lopez@creative.com',
      name: 'Sofía López',
      role: UserRole.User,
      phone: '+525566778899',
      source: UserSource.Instagram,
      interestProduct: 'Brand Strategy',
      budget: 12000,
      isLead: true,
    },
    {
      email: 'diego.gonzalez@tech.mx',
      name: 'Diego González',
      role: UserRole.User,
      phone: '+523312223344',
      source: UserSource.Facebook,
      interestProduct: 'Cloud Services',
      budget: 18000,
      isLead: true,
    },
    {
      email: 'valeria.torres@design.co',
      name: 'Valeria Torres',
      role: UserRole.User,
      phone: '+525511223344',
      source: UserSource.Other,
      interestProduct: 'UI/UX Design',
      budget: 7000,
      isLead: true,
    },
    {
      email: 'ricardo.diaz@consulting.com',
      name: 'Ricardo Díaz',
      role: UserRole.User,
      phone: '+528177889900',
      source: UserSource.LandingPage,
      interestProduct: 'Business Intelligence',
      budget: 30000,
      isLead: true,
    },
    {
      email: 'patricia.reyes@marketing.mx',
      name: 'Patricia Reyes',
      role: UserRole.User,
      phone: '+525599887766',
      source: UserSource.Instagram,
      interestProduct: 'Social Media Management',
      budget: 6000,
      isLead: true,
    },
    {
      email: 'jorge.cruz@startup.tech',
      name: 'Jorge Cruz',
      role: UserRole.User,
      phone: '+523344556677',
      source: UserSource.Referral,
      interestProduct: 'E-commerce Platform',
      budget: 22000,
      isLead: true,
    },
  ];

  async runSeed() {
    await this.userModel.deleteMany({});

    await this.userModel.insertMany(this.sampleLeads);

    return 'Seed ejecutado con éxito';
  }
}
