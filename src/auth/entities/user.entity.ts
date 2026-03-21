import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { UserRole } from '../enums/user-role.enum';

@Entity({ name: 'users' })
@ObjectType()
export class User {
  @ApiProperty()
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Field()
  @Column('text', { unique: true })
  email: string;

  @Exclude()
  @Column('text', { select: false })
  password: string;

  @ApiProperty()
  @Field()
  @Column('text')
  fullName: string;

  @ApiProperty()
  @Field()
  @Column('bool', { default: true })
  isActive: boolean;

  @ApiProperty({ enum: UserRole, isArray: true })
  @Field(() => [UserRole])
  @Column('text', { array: true, default: [UserRole.USER] })
  roles: UserRole[];

  @Exclude()
  @Column('text', { nullable: true, select: false })
  currentHashedRefreshToken?: string | null;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  normalizeEmail() {
    this.email = this.email.toLowerCase().trim();
  }
}
