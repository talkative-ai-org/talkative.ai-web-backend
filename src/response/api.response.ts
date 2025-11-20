/**
 * Generic API Response Wrapper
 */

/**
 * Standard API response structure
 */
export class ApiResponse<T> {
  success!: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  timestamp!: string

  constructor(
    success: boolean,
    data?: T,
    error?: { code: string; message: string; details?: unknown }
  ) {
    this.success = success
    this.data = data
    this.error = error
    this.timestamp = new Date().toISOString()
  }

  /**
   * Creates a successful response
   */
  static success<T>(data: T): ApiResponse<T> {
    return new ApiResponse(true, data)
  }

  /**
   * Creates an error response
   */
  static error(
    code: string,
    message: string,
    details?: unknown
  ): ApiResponse<never> {
    return new ApiResponse(false, undefined, { code, message, details })
  }
}
