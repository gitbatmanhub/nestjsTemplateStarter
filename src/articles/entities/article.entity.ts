import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../auth/entities/user.entity';

@Entity({ name: 'articles' })
@ObjectType()
export class Article {
  @ApiProperty()
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Field()
  @Column('text')
  title: string;

  @ApiProperty()
  @Field()
  @Column('text', { unique: true })
  slug: string;

  @ApiProperty()
  @Field()
  @Column('text')
  summary: string;

  @ApiProperty()
  @Field()
  @Column('text')
  content: string;

  @ApiProperty({ required: false })
  @Field({ nullable: true })
  @Column('text', { nullable: true })
  coverImageUrl?: string | null;

  @ApiProperty({ type: [String] })
  @Field(() => [String])
  @Column('text', { array: true, default: [] })
  tags: string[];

  @ApiProperty()
  @Field()
  @Column('bool', { default: false })
  published: boolean;

  @ApiProperty()
  @Field(() => User)
  @ManyToOne(() => User, { eager: true, nullable: false })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column('uuid')
  authorId: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  normalizeFields() {
    this.slug = this.slugify(this.slug || this.title);
    this.tags = [
      ...new Set((this.tags ?? []).map((tag) => tag.toLowerCase().trim())),
    ];
  }

  private slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}
