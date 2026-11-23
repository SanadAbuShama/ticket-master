import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCookieAuth, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { errorResponseFor } from '../errors/error.response.dto.js';
import { ErrorCode, messageByCode, statusByCode } from '../errors/error.codes.js';

export const ApiErrorResponse = (code: ErrorCode) =>
    ApiResponse({
        status: statusByCode[code],
        description: `${code}: ${messageByCode[code]}`,
        standardSchema: errorResponseFor(code),
    });

export const ApiSessionRequired = () =>
    applyDecorators(
        ApiCookieAuth(),
        ApiErrorResponse(ErrorCode.UNAUTHENTICATED),
    );
