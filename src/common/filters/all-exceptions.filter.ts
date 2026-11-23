import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { AppError } from "../errors/app.error.js";
import { codeByStatus, ErrorCode, messageByCode, statusByCode } from "../errors/error.codes.js";
import { ErrorBody } from "../errors/error.types.js";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    constructor(private readonly httpAdapterHost: HttpAdapterHost) { }


    catch(exception: unknown, host: ArgumentsHost): void {

        const { httpAdapter } = this.httpAdapterHost;
        const ctx = host.switchToHttp();


        let status = 500;

        let body: ErrorBody = { code: ErrorCode.INTERNAL_ERROR, message: messageByCode[ErrorCode.INTERNAL_ERROR] };

        if (exception instanceof AppError) {
            status = statusByCode[exception.code];
            body = { code: exception.code, message: exception.message, details: exception.details };
        } else if (exception instanceof HttpException) {

            status = exception.getStatus();
            const code = codeByStatus[status] ?? (status < 500 ? ErrorCode.BAD_REQUEST : ErrorCode.INTERNAL_ERROR);

            body = { code, message: messageByCode[code] }
        }

        if (status >= 500) {
            this.logger.error(exception instanceof Error ? exception.stack : String(exception));
        }

        httpAdapter.reply(ctx.getResponse(), { error: body }, status);
    }
}