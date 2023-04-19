import {
  CallHandler,
  ExecutionContext,
  Logger,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { Observable, map } from 'rxjs';
// import { UserDto } from 'src/users/dtos/user.dto';

/**
 * Returns UseIntercepter Decorator.
 *
 * @remarks
 * This method should recive a Dto class
 */
export function Serialize(dto: any) {
  return UseInterceptors(new SerializeIntercepter(dto));
}

export class SerializeIntercepter implements NestInterceptor {
  private logger = new Logger(SerializeIntercepter.name);
  constructor(private dto: any) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    // console.log('Before');
    // const start = Date.now();
    process.env.NODE_ENV === 'development' && this.logger.debug(`intercept`);
    return next.handle().pipe(
      map((data) => {
        return plainToClass(this.dto, data, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
