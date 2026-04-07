import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  MONGODB_URI: Joi.string().required(),
  GROQ_API_KEY: Joi.string().required(),
  GROQ_BASE_URL: Joi.string().required(),
  GROQ_MODEL: Joi.string().required(),
});
