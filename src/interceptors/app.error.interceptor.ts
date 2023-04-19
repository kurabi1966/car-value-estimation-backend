import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TypeORMError } from 'typeorm';

@Injectable()
export class AppInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Error Handler');
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    return next.handle().pipe(
      catchError((err) => {
        const request: Request = context.switchToHttp().getRequest();
        const error = {
          type: 'Unknown Error',
          message: err?.message || err?.detail || 'Something went wrong',
          timestamp: new Date().toISOString(),
          route: request.path,
          method: request.method,
          status:
            err.statusCode || err.status || err.response?.statusCode || 500,
        };
        if (err instanceof TypeORMError) {
          error.type = 'TypeORM Error';
        } else if (err instanceof HttpException) {
          error.type = 'Application Error';
        }
        this.logger.error(
          `${error.type} | ${error.message} | ${error.timestamp} | ${error.route} | ${error.method} | ${error.status}`,
        );
        return throwError(
          () =>
            new HttpException(
              { ...error },
              err.statusCode || err.status || err.response?.statusCode || 500,
            ),
        );
      }),
    );
  }
}
