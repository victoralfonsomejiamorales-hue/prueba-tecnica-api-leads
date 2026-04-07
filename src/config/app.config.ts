interface Configuration {
  port: number;
  nodeEnv: string;
  mongodbUri: string;
  groqApiKey: string;
  groqBaseUrl: string;
  groqModel: string;
}

export default (): Configuration => {
  const {
    PORT,
    NODE_ENV,
    MONGODB_URI,
    GROQ_API_KEY,
    GROQ_BASE_URL,
    GROQ_MODEL,
  } = process.env;

  if (
    !PORT ||
    !NODE_ENV ||
    !MONGODB_URI ||
    !GROQ_API_KEY ||
    !GROQ_BASE_URL ||
    !GROQ_MODEL
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
  };
};
