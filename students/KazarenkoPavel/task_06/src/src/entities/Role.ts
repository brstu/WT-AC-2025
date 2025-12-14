import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './User';

export enum RoleName {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user'
}

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: RoleName,
    default: RoleName.USER
  })
  name: RoleName;

  @Column({ default: false })
  canCreateClients: boolean;

  @Column({ default: false })
  canEditAllClients: boolean;

  @Column({ default: false })
  canDeleteClients: boolean;

  @Column({ default: false })
  canCreateDeals: boolean;

  @Column({ default: false })
  canEditAllDeals: boolean;

  @Column({ default: false })
  canDeleteDeals: boolean;

  @OneToMany(() => User, user => user.role)
  users: User[];
}
