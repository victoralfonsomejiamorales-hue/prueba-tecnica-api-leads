interface Configuration {
  port: number;
  nodeEnv: string;
  mongodbUri: string;
  groqApiKey: string;
  groqBaseUrl: string;
  groqModel: string;
  throttleTTL: number;
  throttleLimit: number;
  jwtSecret: string;
}

export default (): Configuration => {
  const {
    PORT,
    NODE_ENV,
    MONGODB_URI,
    GROQ_API_KEY,
    GROQ_BASE_URL,
    GROQ_MODEL,
    THROTTLE_TTL,
    THROTTLE_LIMIT,
    JWT_SECRET,
  } = process.env;

  if (
    !PORT ||
    !NODE_ENV ||
    !MONGODB_URI ||
    !GROQ_API_KEY ||
    !GROQ_BASE_URL ||
    !GROQ_MODEL ||
    !THROTTLE_TTL ||
    !THROTTLE_LIMIT ||
    !JWT_SECRET
  ) {
    throw new Error('Missing required environment variables');
  }

  return {
    port: Number(PORT),
    nodeEnv: NODE_ENV,
    mongodbUri: MONGODB_URI,
    groqApiKey: GROQ_API_KEY,
    groqBaseUrl: GROQ_BASE_URL,
    groqModel: GROQ_MODEL,
    throttleTTL: Number(THROTTLE_TTL),
    throttleLimit: Number(THROTTLE_LIMIT),
    jwtSecret: JWT_SECRET,
  };
};
