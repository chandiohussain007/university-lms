import { SetMetadata } from '@nestjs/common';
import { ProfileType } from '../../profiles/entities/profile.entity';

export const ROLES_KEY = 'roles';

// Restricts a route to the given profile types.
// Super Admins bypass this check (see RolesGuard).
export const Roles = (...roles: ProfileType[]) => SetMetadata(ROLES_KEY, roles);