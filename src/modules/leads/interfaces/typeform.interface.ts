export interface TypeformAnswer {
  type: 'email' | 'text' | 'number' | 'phone_number' | 'choice';
  email?: string;
  text?: string;
  number?: number;
  phone_number?: string;
  field: {
    id: string;
    type: string;
    ref?: string;
  };
}

export interface TypeformWebhookPayload {
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
