declare namespace NodeJS {
  interface ProcessEnv {
    // Server
    PORT: string;
    NODE_ENV: 'development' | 'production' | 'test';
    
    // Database
    DATABASE_URL: string;
    
    // JWT
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    
    // CORS
    CORS_ORIGIN?: string;
    
    // Rate limiting
    RATE_LIMIT_WINDOW_MS?: string;
    RATE_LIMIT_MAX_REQUESTS?: string;
  }
}