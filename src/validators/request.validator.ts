/**
 * Request Validation Utilities
 */

import { validate, ValidationError } from 'class-validator'
import { plainToClass } from 'class-transformer'

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean
  errors?: string[]
}

/**
 * Validates a request DTO using class-validator
 */
export async function validateRequest<T extends object>(
  dtoClass: new () => T,
  data: unknown
): Promise<ValidationResult> {
  // Transform plain object to class instance
  const dtoInstance = plainToClass(dtoClass, data)

  // Validate
  const errors: ValidationError[] = await validate(dtoInstance as object)

  if (errors.length > 0) {
    return {
      isValid: false,
      errors: errors.flatMap((error) =>
        error.constraints ? Object.values(error.constraints) : []
      ),
    }
  }

  return {
    isValid: true,
  }
}

/**
 * Formats validation errors into a readable string
 */
export function formatValidationErrors(errors: string[]): string {
  return errors.join('; ')
}
