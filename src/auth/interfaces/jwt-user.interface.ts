import { UserRole } from '../enums/user-role.enum';

export interface JwtUser {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  roles: UserRole[];
}
