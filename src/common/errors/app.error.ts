import { ErrorCode, messageByCode } from "./error.codes.js";
import type { ErrorDetail } from "./error.types.js";

export class AppError extends Error {
    constructor(
        readonly code: ErrorCode,
        message: string = messageByCode[code],
        readonly details?: ErrorDetail[],
    ) {
        super(message);
    }
}