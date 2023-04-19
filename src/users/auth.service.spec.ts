import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
const scrypt = promisify(_scrypt);
async function encrypt(password: string) {
  const salt = randomBytes(8).toString('hex');
  const hash = (await scrypt(password, salt, 32)) as Buffer;
  return `${salt}.${hash.toString('hex')}`;
}

describe('Authintication Service', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;
  let users: User[];
  beforeEach(async () => {
    users = [];
    fakeUsersService = {
      find: (email) =>
        Promise.resolve(users.filter((user) => user.email === email)),
      create: (email: string, password: string) => {
        users.push({ id: users.length + 1, email, password } as User);
        return Promise.resolve(users[users.length - 1] as User);
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('Can create an instance of auth service', () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a solted and hashed password', async () => {
    const user = await service.signup('asdf@asdf.com', 'asdf');
    console.log(user);
    expect(user.id).toEqual(1);
    expect(user.email).toEqual('asdf@asdf.com');
    expect(user.password).not.toEqual('asdf');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email that is in use', async () => {
    await service.signup('asdf@asdf.com', 'asdf');
    await expect(service.signup('asdf@asdf.com', 'asdf')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('sign in with correct email and password', async () => {
    await service.signup('asdf@asdf.com', 'asdf');
    const user = await service.signin('asdf@asdf.com', 'asdf');
    expect(user).toBeDefined();
  });

  it('trhow NotFound Exception if signin is called with an unused email', async () => {
    await expect(
      service.signin('anyemail@anydomain.net', 'anypassword'),
    ).rejects.toThrow(NotFoundException);
  });

  it('trhow Forbedin Exception if signin is called with an incorrect password', async () => {
    await service.signup('asdf@asdf.com', 'asdf');
    await expect(
      service.signin('asdf@asdf.com', 'incorrectpassword'),
    ).rejects.toThrow(ForbiddenException);
  });
});
