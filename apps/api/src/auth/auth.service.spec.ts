import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: { findOneByEmailWithRelations: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn(() => 'test-token') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a signed token and role on login', async () => {
    const result = await service.login({
      email: 'test@university.edu',
      id: 'user-1',
      profiles: [
        { type: 'STUDENT', facultyId: 'faculty-1' },
      ],
    });

    expect(result.access_token).toBe('test-token');
    expect(result.role).toBe('STUDENT');
    expect(result.facultyId).toBe('faculty-1');
  });
});
