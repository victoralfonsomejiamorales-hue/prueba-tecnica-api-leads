import { TypeformAnswer } from '../interfaces/typeform.interface';

export class TypeformWebhookDto {
  event_id: string;
  event_type: string;
  form_response: {
    form_id: string;
    submitted_at: string;
    definition: {
      id: string;
      title: string;
    };
    answers: TypeformAnswer[];
  };
}
