import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialSchema1691234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create roles table
    await queryRunner.query(`
      CREATE TABLE roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        "canCreateClients" BOOLEAN DEFAULT false,
        "canEditAllClients" BOOLEAN DEFAULT false,
        "canDeleteClients" BOOLEAN DEFAULT false,
        "canCreateDeals" BOOLEAN DEFAULT false,
        "canEditAllDeals" BOOLEAN DEFAULT false,
        "canDeleteDeals" BOOLEAN DEFAULT false
      )
    `);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        "firstName" VARCHAR(100) NOT NULL,
        "lastName" VARCHAR(100) NOT NULL,
        "roleId" INTEGER REFERENCES roles(id),
        "refreshToken" VARCHAR(500),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "isActive" BOOLEAN DEFAULT true
      )
    `);

    // Create clients table
    await queryRunner.query(`
      CREATE TABLE clients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        address TEXT,
        notes TEXT,
        "createdById" INTEGER REFERENCES users(id) ON DELETE CASCADE,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "isActive" BOOLEAN DEFAULT true
      )
    `);

    // Create deals table
    await queryRunner.query(`
      CREATE TABLE deals (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'new',
        "expectedCloseDate" DATE,
        "clientId" INTEGER REFERENCES clients(id) ON DELETE CASCADE,
        "createdById" INTEGER REFERENCES users(id) ON DELETE CASCADE,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE deals`);
    await queryRunner.query(`DROP TABLE clients`);
    await queryRunner.query(`DROP TABLE users`);
    await queryRunner.query(`DROP TABLE roles`);
  }
}
