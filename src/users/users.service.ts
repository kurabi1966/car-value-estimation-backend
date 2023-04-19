import {
  // BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';

// import { randomBytes, scrypt as _scrypt } from 'crypto';
// import { promisify } from 'util';
// const scrypt = promisify(_scrypt);

@Injectable()
export class UsersService {
  private logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(email: string, password: string, isAdmin: boolean) {
    process.env.NODE_ENV === 'development' &&
      this.logger.debug(`create ${email}`);
    const user = this.userRepository.create({
      email,
      password,
      isAdmin,
    });

    return await this.userRepository.save(user);
  }

  async findOne(id: number) {
    process.env.NODE_ENV === 'development' &&
      this.logger.debug(`findOne ${id}`);
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async find(email: string) {
    process.env.NODE_ENV === 'development' &&
      this.logger.debug(`find ${email}`);
    const query = email ? { email } : {};
    return await this.userRepository.find({ where: query });
  }

  // async update(id: number, attrs: Partial<User>) {
  //   const { email, password } = attrs;
  //   if (!email && !password) {
  //     throw new BadRequestException();
  //   }
  //   // 1. find the user
  //   const user = await this.userRepository.findOne({
  //     where: { id },
  //   });

  //   if (!user) {
  //     throw new BadRequestException(`Use with id ${id} does not exist.`);
  //   }

  //   if (attrs['password']) {
  //     attrs['password'] = await this.encrypt(password);
  //   }
  //   Object.assign(user, attrs);
  //   return this.userRepository.save(user);
  // }

  // async remove(id: number) {
  //   const user = await this.userRepository.findOne({ where: { id } });
  //   if (!user) {
  //     throw new NotFoundException();
  //   }
  //   return await this.userRepository.remove(user);
  // }

  // private async encrypt(password: string) {
  //   const salt = randomBytes(8).toString('hex');
  //   const hash = (await scrypt(password, salt, 32)) as Buffer;
  //   return `${salt}.${hash.toString('hex')}`;
  // }
}
