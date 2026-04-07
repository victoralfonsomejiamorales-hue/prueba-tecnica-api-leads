import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? (exception.getResponse() as
            | string
            | {
                message: string | string[];
                error?: string;
                statusCode?: number;
              })
        : null;

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : exceptionResponse?.message || 'Internal server error';

    const errorDetails = {
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      ip: request.ip,
      userAgent: request.get('user-agent'),
      statusCode: status,
      message: Array.isArray(message) ? message : [message],
      stack: exception instanceof Error ? exception.stack : undefined,
    };

    if (status >= 500) {
      this.logger.error(
        `Critical Error [${status}]: ${request.method} ${request.url}`,
        JSON.stringify(errorDetails, null, 2),
      );
    } else {
      this.logger.warn(
        `Client Error [${status}]: ${request.method} ${request.url}`,
        JSON.stringify({ ...errorDetails, stack: undefined }, null, 2),
      );
    }

    const clientResponse = {
      statusCode: status,
      timestamp: errorDetails.timestamp,
      path: errorDetails.path,
      message: Array.isArray(message) ? message : [message],
      ...(process.env.NODE_ENV !== 'production' && {
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    };

    if (status === (HttpStatus.INTERNAL_SERVER_ERROR as number)) {
      clientResponse.message = [
        'An unexpected error occurred. Please try again later.',
      ];
    }

    response.status(status).json(clientResponse);
  }
}
