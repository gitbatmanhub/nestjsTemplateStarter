import { applyDecorators, UseGuards } from '@nestjs/common';
import { UserRole } from '../enums/user-role.enum';
import { AccessTokenGuard } from '../guards/access-token.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';

export function Auth(...roles: UserRole[]) {
  return applyDecorators(
    Roles(...roles),
    UseGuards(AccessTokenGuard, RolesGuard),
  );
}
