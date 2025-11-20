/**
 * Service Layer Error Classes
 */

/**
 * Base service error interface
 */
export interface IServiceError {
  code: string
  message: string
  details?: unknown
}

/**
 * Generic service response wrapper
 */
export interface ServiceResponse<T> {
  success: boolean
  data?: T
  error?: IServiceError
}

/**
 * Service error class for handling application-level errors
 */
export class ServiceError extends Error implements IServiceError {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message)
    this.name = 'ServiceError'
    Object.setPrototypeOf(this, ServiceError.prototype)
  }

  /**
   * Converts to plain object for API responses
   */
  toJSON(): IServiceError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    }
  }
}
