import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Field, InputType } from '@nestjs/graphql';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

@InputType()
export class CreateArticleDto {
  @ApiProperty()
  @Field()
  @IsString()
  @MinLength(3)
  title: string;

  @ApiPropertyOptional()
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty()
  @Field()
  @IsString()
  @MinLength(10)
  @MaxLength(280)
  summary: string;

  @ApiProperty()
  @Field()
  @IsString()
  @MinLength(20)
  content: string;

  @ApiPropertyOptional()
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @ApiPropertyOptional({ type: [String] })
  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ default: false })
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
