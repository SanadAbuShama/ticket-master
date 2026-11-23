import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { AppError } from '../errors/app.error.js';
import { ErrorCode } from '../errors/error.codes.js';
import type { ErrorDetail } from '../errors/error.types.js';

@Injectable()
export class SchemaValidationPipe implements PipeTransform {
  async transform(value: unknown, metadata: ArgumentMetadata) {
    const schema = metadata.schema;
    if (!schema) {
      return value;
    }

    const result = await schema['~standard'].validate(value);

    if (result.issues) {
      const details: ErrorDetail[] = result.issues.map((issue) => ({
        field: issue.path?.length
          ? issue.path
              .map((segment) => (typeof segment === 'object' ? String(segment.key) : String(segment)))
              .join('.')
          : metadata.type,
        message: issue.message,
      }));

      throw new AppError(ErrorCode.VALIDATION_FAILED, undefined, details);
    }

    return result.value;
  }
}