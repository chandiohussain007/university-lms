import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByEmailWithRelations(email);
        if (user && user.passwordHash) {
            const isMatch = await bcrypt.compare(pass, user.passwordHash);
            if (isMatch) {
                const { passwordHash, ...result } = user;
                return result;
            }
        }
        return null;
    }

    async login(user: any) {
        const profiles = user.profiles ?? [];

        // Primary role = first profile (kept for backwards compatibility)
        const primaryProfile = profiles.length > 0 ? profiles[0] : null;
        const role = primaryProfile ? primaryProfile.type : 'GUEST';
        const facultyId = primaryProfile ? primaryProfile.facultyId : null;

        // Full claims for the Roles/Tenant guards
        const roles = profiles.map((p: any) => p.type);
        const facultyIds = [...new Set(profiles.map((p: any) => p.facultyId).filter(Boolean))];

        const payload = {
            email: user.email,
            sub: user.id,
            role: role,
            facultyId: facultyId,
            roles: roles,
            facultyIds: facultyIds,
            isSuperAdmin: !!user.isSuperAdmin,
        };

        return {
            access_token: this.jwtService.sign(payload),
            role: role,
            roles: roles,
            facultyId: facultyId,
            facultyIds: facultyIds,
            isSuperAdmin: !!user.isSuperAdmin,
        };
    }
}
