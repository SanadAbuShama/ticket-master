export const ErrorCode = {
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  EMAIL_TAKEN: 'EMAIL_TAKEN',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS'
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export const statusByCode: Record<ErrorCode, number> = {
  VALIDATION_FAILED: 400,
  BAD_REQUEST: 400,
  UNAUTHENTICATED: 401,
  INVALID_CREDENTIALS: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  EMAIL_TAKEN: 409,
  SERVICE_UNAVAILABLE: 503,
  INTERNAL_ERROR: 500,
  TOO_MANY_REQUESTS: 429
};

export const codeByStatus: Partial<Record<number, ErrorCode>> = {
  400: ErrorCode.BAD_REQUEST,
  401: ErrorCode.UNAUTHENTICATED,
  403: ErrorCode.FORBIDDEN,
  404: ErrorCode.NOT_FOUND,
  429: ErrorCode.TOO_MANY_REQUESTS,
  503: ErrorCode.SERVICE_UNAVAILABLE,
};

export const messageByCode: Record<ErrorCode, string> = {
  VALIDATION_FAILED: 'Some fields are invalid.',
  BAD_REQUEST: 'The request could not be understood.',
  UNAUTHENTICATED: 'You need to sign in to continue.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  FORBIDDEN: 'You do not have permission to do this.',
  NOT_FOUND: 'The requested resource was not found.',
  EMAIL_TAKEN: 'This email is already registered.',
  TOO_MANY_REQUESTS: 'Too many requests. Please try again later.',
  SERVICE_UNAVAILABLE: 'The service is temporarily unavailable. Please try again shortly.',
  INTERNAL_ERROR: 'Something went wrong. Please try again.',
};