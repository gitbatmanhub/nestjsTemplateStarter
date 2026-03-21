import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    if (context.getType<'http' | 'graphql'>() === 'http') {
      const request = context.switchToHttp().getRequest();
      if (!request.user) {
        throw new InternalServerErrorException('User was not found in request');
      }

      return request.user;
    }

    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req;

    if (!request.user) {
      throw new InternalServerErrorException('User was not found in request');
    }

    return request.user;
  },
);
