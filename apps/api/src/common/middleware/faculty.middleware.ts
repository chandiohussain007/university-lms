import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class FacultyGuardMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const facultyId = req.headers['x-faculty-id'] as string;

        // In a real scenario, we would validate this against the user's token claims.
        // For now, we just ensure it exists if the route requires it.

        // Logic: If the user is authenticated, we attach the facultyId to the request context
        // This allows Controllers to filter data by this ID.

        if (facultyId) {
            (req as any)['facultyId'] = facultyId;
        }

        // Note: Actual blocking logic should be in a Guard, but for global context injection,
        // Middleware is great.

        next();
    }
}
