import { ApiPropertyOptional } from '@nestjs/swagger';
import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

@InputType()
export class ArticleFilterDto {
  @ApiPropertyOptional({ default: 10 })
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ default: 0 })
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @ApiPropertyOptional()
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @Field({ nullable: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  published?: boolean;
}
