import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { Client } from './Client';

export enum DealStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  WON = 'won',
  LOST = 'lost'
}

@Entity('deals')
export class Deal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: DealStatus,
    default: DealStatus.NEW
  })
  status: DealStatus;

  @Column({ type: 'date', nullable: true })
  expectedCloseDate: Date;

  @ManyToOne(() => Client, client => client.deals, { onDelete: 'CASCADE' })
  client: Client;

  @ManyToOne(() => User, user => user.createdDeals, { onDelete: 'CASCADE' })
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
