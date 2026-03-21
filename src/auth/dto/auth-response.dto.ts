import { Field, ObjectType } from '@nestjs/graphql';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

@ObjectType()
export class AuthResponseDto {
  @ApiProperty({ type: () => User })
  @Field(() => User)
  user: User;

  @ApiPropertyOptional()
  @Field({ nullable: true })
  accessToken: string | null;

  @ApiPropertyOptional()
  @Field({ nullable: true })
  refreshToken: string | null;

  constructor(partial: Partial<AuthResponseDto>) {
    Object.assign(this, partial);
  }
}
