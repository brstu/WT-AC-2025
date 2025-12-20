import { DataSource } from 'typeorm';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'mini_crm',
  synchronize: false, // Не использовать в продакшене
  logging: process.env.NODE_ENV === 'development',
  entities: [path.join(__dirname, '../entities/*.ts')],
  migrations: [path.join(__dirname, '../../migrations/*.ts')],
  subscribers: [],
});
