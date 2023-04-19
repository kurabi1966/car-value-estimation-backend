import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  Injectable,
  Logger,
} from '@nestjs/common';
import { UsersService } from '../users.service';

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CurrentUserInterceptor.name);
  // private readonly logger = new Logger('Error Handler');
  constructor(private readonly usersService: UsersService) {}

  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    const request = context.switchToHttp().getRequest();
    const { userId } = request.session;
    process.env.NODE_ENV === 'development' &&
      this.logger.debug(`${request.path}, User Id: ${userId}`);
    if (userId) {
      const user = await this.usersService.findOne(userId);
      request.currentUser = user;
      return next.handle();
    }

    return next.handle();
  }
}
