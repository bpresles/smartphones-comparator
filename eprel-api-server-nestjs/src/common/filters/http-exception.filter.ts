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

    let status: number;
    let message: string;
    let details: any;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const response = exceptionResponse as any;
        message = response.message || response.error || 'An error occurred';
        details = response.details;
      } else {
        message = 'An error occurred';
      }
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = process.env.NODE_ENV === 'development'
        ? exception.message
        : 'Internal server error';

      this.logger.error(
        `Unhandled error: ${exception.message}`,
        exception.stack,
        'HttpExceptionFilter',
      );
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';

      this.logger.error(
        'Unknown exception type',
        JSON.stringify(exception),
        'HttpExceptionFilter',
      );
    }

    // Log the error for debugging (except for client errors)
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - ${status} ${message}`,
        exception instanceof Error ? exception.stack : JSON.stringify(exception),
      );
    } else if (status >= 400) {
      this.logger.warn(
        `${request.method} ${request.url} - ${status} ${message}`,
      );
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      ...(details && { details }),
      ...(process.env.NODE_ENV === 'development' && exception instanceof Error && {
        stack: exception.stack,
      }),
    };

    response.status(status).json(errorResponse);
  }
}
