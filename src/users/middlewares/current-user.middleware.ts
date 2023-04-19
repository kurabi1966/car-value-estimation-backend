import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UsersService } from '../users.service';
import { User } from '../user.entity';

declare global {
  namespace Express {
    interface Request {
      currentUser?: User;
    }
  }
}

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CurrentUserMiddleware.name);
  constructor(private readonly usersService: UsersService) {}

  async use(request: Request, response: Response, next: NextFunction) {
    const { userId } = request.session || {};

    process.env.NODE_ENV === 'development' &&
      this.logger.debug(`${request.path}, User Id: ${userId}`);

    if (userId) {
      const user = await this.usersService.findOne(userId);
      request.currentUser = user;
    }
    next();
  }
}
