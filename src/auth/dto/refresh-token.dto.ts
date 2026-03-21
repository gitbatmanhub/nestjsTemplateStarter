import { ApiProperty } from '@nestjs/swagger';
import { Field, InputType } from '@nestjs/graphql';
import { IsJWT } from 'class-validator';

@InputType()
export class RefreshTokenDto {
  @ApiProperty()
  @Field()
  @IsJWT()
  refreshToken: string;
}
