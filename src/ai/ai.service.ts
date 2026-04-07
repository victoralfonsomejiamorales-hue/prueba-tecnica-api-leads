import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private openai: OpenAI;
  private readonly logger = new Logger(AiService.name);

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('groqApiKey')!,
      baseURL: this.configService.get<string>('groqBaseUrl')!,
    });
  }

  async generateSummary(
    leads: Partial<{
      source: string;
      budget: number;
      interestProduct: string;
      createdAt: Date;
    }>[],
  ): Promise<string> {
    try {
      const context = leads.map(
        (l: {
          source: string;
          budget: number;
          interestProduct: string;
          createdAt: Date;
        }) => ({
          source: l.source,
          budget: l.budget,
          product: l.interestProduct,
          date: l.createdAt,
        }),
      );

      const response = await this.openai.chat.completions.create({
        model: this.configService.get<string>('groqModel')!,
        messages: [
          {
            role: 'system',
            content: `Eres un analista de negocios senior. Tu objetivo es procesar datos de leads y generar un informe ejecutivo conciso en español. 
            Debes estructurar la respuesta con:
            1. ANALISIS GENERAL (Tendencias observadas).
            2. FUENTE PRINCIPAL (Cuál canal convierte mejor).
            3. RECOMENDACIONES (3 puntos accionables).`,
          },
          {
            role: 'user',
            content: `Analiza los siguientes datos de leads: ${JSON.stringify(context)}`,
          },
        ],
        temperature: 0.5,
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      this.logger.error(`Error en Groq AI: ${error.message}`);
      throw new InternalServerErrorException(
        'No se pudo generar el resumen de IA',
      );
    }
  }
}
