import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Session,
  UseGuards,
} from '@nestjs/common';
import {
  CreateUserDto,
  SigninDto,
  UpdateUserDto,
  UserDto,
} from './dtos/user.dto';

import { UsersService } from './users.service';
import { Serialize } from '../interceptors/serialize.interceptor';
import { AuthService } from './auth.service';
// import cookieSession from 'cookie-session';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthGuard } from '../guards/auth.guard';

// @UseInterceptors(new SerializeIntercepter(UserDto))
@Serialize(UserDto)
@Controller('auth')
export class UsersController {
  private logger = new Logger(UsersController.name);
  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('/whoami')
  async whoAmI(@CurrentUser() user: any) {
    process.env.NODE_ENV === 'development' &&
      this.logger.debug(`whoami ${{ ...user }}`);
    return user;
  }

  @Post('/signup')
  async signup(@Body() body: CreateUserDto, @Session() session: any) {
    const { email, password, isAdmin } = body;
    process.env.NODE_ENV === 'development' &&
      this.logger.debug(`signup ${email}`);
    const user = await this.authService.signup(email, password, isAdmin);
    session.userId = user.id;
    return user;
  }

  @HttpCode(HttpStatus.OK)
  @Post('/signin')
  async signin(@Body() body: SigninDto, @Session() session: any) {
    const { email, password } = body;
    process.env.NODE_ENV === 'development' &&
      this.logger.debug(`signup ${email}`);
    const user = await this.authService.signin(email, password);
    session.userId = user.id;
    return user;
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/signout')
  signOut(@Session() session: any) {
    process.env.NODE_ENV === 'development' &&
      this.logger.debug(`signout ${session?.userId}`);
    delete session?.userId;
  }

  @Get('/:id')
  findUser(@Param('id') id: string) {
    process.env.NODE_ENV === 'development' &&
      this.logger.debug(`findUser ${id}`);
    return this.userService.findOne(parseInt(id));
  }

  @Get('/')
  findUsers(@Query('email') email: string) {
    process.env.NODE_ENV === 'development' &&
      this.logger.debug(`findUsers ${email}`);
    return this.userService.find(email);
  }

  // @Patch('/:id')
  // updateUser(@Body() body: UpdateUserDto, @Param('id') id: string) {
  //   process.env.NODE_ENV === 'development' && this.logger.debug(`updateUser ${id}`)
  //   return this.userService.update(parseInt(id), body);
  // }

  // @Delete('/:id')
  // removeUser(@Param('id') id: string) {
  //   process.env.NODE_ENV === 'development' && this.logger.debug(`deleteUser ${id}`)
  //   return this.userService.remove(parseInt(id));
  // }
}
