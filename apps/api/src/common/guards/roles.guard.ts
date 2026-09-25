import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ProfileType } from '../../profiles/entities/profile.entity';

interface AuthUser {
    userId: string;
    email: string;
    role: string;
    roles?: string[];
    isSuperAdmin?: boolean;
}

// Global authorization guard. Routes decorated with @Roles(...) require the
// authenticated user to hold at least one of the given profile types.
// Routes without @Roles(...) only require authentication. Super Admins bypass.
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<ProfileType[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();
        const authUser = user as AuthUser | undefined;
        if (!authUser) {
            throw new ForbiddenException('Authentication required');
        }
        if (authUser.isSuperAdmin) {
            return true;
        }

        const userRoles = authUser.roles ?? (authUser.role ? [authUser.role] : []);
        const hasRequiredRole = requiredRoles.some((r) => userRoles.includes(r));
        if (!hasRequiredRole) {
            throw new ForbiddenException(
                `Requires one of the following roles: ${requiredRoles.join(', ')}`,
            );
        }
        return true;
    }
}