import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { Deal } from './Deal';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => User, user => user.createdClients, { onDelete: 'CASCADE' })
  createdBy: User;

  @OneToMany(() => Deal, deal => deal.client)
  deals: Deal[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: true })
  isActive: boolean;
}
