import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentRefreshToken = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    if (context.getType<'http' | 'graphql'>() === 'http') {
      const request = context.switchToHttp().getRequest();
      if (!request.refreshToken) {
        throw new InternalServerErrorException(
          'Refresh token was not found in request',
        );
      }

      return request.refreshToken;
    }

    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req;

    if (!request.refreshToken) {
      throw new InternalServerErrorException(
        'Refresh token was not found in request',
      );
    }

    return request.refreshToken;
  },
);
