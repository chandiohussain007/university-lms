import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

interface AuthUser {
    userId: string;
    role: string;
    facultyId?: string | null;
    facultyIds?: string[];
    isSuperAdmin?: boolean;
}

// Multi-tenant guard: when a request carries an x-faculty-id header, validate
// it against the faculty claims in the user's JWT. Super Admins bypass.
// Requests without the header pass through (endpoints filter by tenant later).
@Injectable()
export class TenantGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const headerFacultyId = request.headers['x-faculty-id'] as string | undefined;
        if (!headerFacultyId) {
            return true;
        }

        const user = request.user as AuthUser | undefined;
        // Public routes have no user claims to check
        if (!user) {
            return true;
        }
        if (user.isSuperAdmin) {
            return true;
        }

        const allowedFacultyIds = user.facultyIds ?? (user.facultyId ? [user.facultyId] : []);
        if (allowedFacultyIds.length === 0 || !allowedFacultyIds.includes(headerFacultyId)) {
            throw new ForbiddenException(
                'You do not have access to this faculty',
            );
        }
        return true;
    }
}