// src/common/interceptors/transform.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  data: T;
}

/**
 * Wraps all successful responses in a { data: ... } envelope.
 * Paginated responses from services already include { data, total, page, limit }
 * and are passed through as-is since they are already structured objects.
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T> | T>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T> | T> {
    return next.handle().pipe(
      map((value: T) => {
        // Paginated or already-structured responses pass through as-is
        if (
          value !== null &&
          typeof value === 'object' &&
          'data' in (value as object) &&
          'total' in (value as object)
        ) {
          return value;
        }
        return { data: value };
      }),
    );
  }
}
