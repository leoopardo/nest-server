import { MongoServerError } from 'mongodb';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    if (!['TokenExpiredError', 'DeleteError'].includes(exception['name']))
      console.error(
        new Date(),
        exception,
        JSON.stringify(exception['response']),
      );

    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    let httpStatus;
    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
    } else if (exception instanceof MongoServerError) {
      httpStatus = HttpStatus.BAD_REQUEST;
    } else if (exception instanceof jwt.TokenExpiredError) {
      httpStatus = HttpStatus.FORBIDDEN;
    } else {
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    const message = exception['response']
      ? exception['response']['message']
      : exception['message'];

    // especifico pro mongo
    const field = exception['keyValue'] ? exception['keyValue'] : undefined;

    const responseBody = {
      class: exception['name'],
      code: exception['code'],
      message,
      field,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
