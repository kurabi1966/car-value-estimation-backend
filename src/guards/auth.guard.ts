import { CanActivate, ExecutionContext, Logger } from '@nestjs/common';

export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    process.env.NODE_ENV === 'development' &&
      this.logger.debug(`${request.path}, User Id: ${request.session.userId}`);

    return request.session.userId;
  }
}
