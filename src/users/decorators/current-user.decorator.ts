import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    if (request.currentUser) {
      return request.currentUser;
    }
    console.log('No Current user');
    return null;
  },
);
