import { CanActivate, ExecutionContext, Logger } from '@nestjs/common';

export class AdminGuard implements CanActivate {
  private readonly logger = new Logger(AdminGuard.name);
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    process.env.NODE_ENV === 'development' &&
      this.logger.debug(`${request.path}, User Id: ${request.session.userId}`);

    // if (request.session.userId) {
    //   console.log(request.session);
    // }
    return request.currentUser?.isAdmin;
  }
}
