import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  constructor(private readonly usersService: UsersService) {}

  async signup(email: string, password: string, isAdmin: boolean) {
    // 1. Find if the email in use
    process.env.NODE_ENV === 'development' &&
      this.logger.debug(`signup ${email}`);
    const [user] = await this.usersService.find(email);

    if (user) {
      throw new BadRequestException('email in use!');
    }

    // hash the password
    const hashedPassword = await this.encrypt(password);

    // Create new user
    return await this.usersService.create(email, hashedPassword, isAdmin);
  }

  async signin(email: string, password: string) {
    // 1. Find if the email in use
    const [user] = await this.usersService.find(email);
    process.env.NODE_ENV === 'development' &&
      this.logger.debug(`signin ${email}`);
    if (!user) {
      throw new NotFoundException('user not found');
    }

    // check if the password is correct
    const isCorrectPassword = await this.compare(password, user.password);

    if (!isCorrectPassword) {
      throw new ForbiddenException('Invalied credinetional');
    }
    return user;
  }

  private async encrypt(password: string) {
    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    return `${salt}.${hash.toString('hex')}`;
  }

  private async compare(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const [salt, storedHash] = hashedPassword.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    if (storedHash === hash.toString('hex')) {
      return true;
    } else {
      return false;
    }
  }
}
