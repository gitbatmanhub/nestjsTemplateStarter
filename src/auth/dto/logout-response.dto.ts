import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class LogoutResponseDto {
  @Field()
  message: string;
}
