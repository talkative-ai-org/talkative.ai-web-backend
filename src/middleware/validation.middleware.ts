/**
 * Validation Middleware
 *
 * Express middleware for request validation using class-validator.
 */

import type { Request, Response, NextFunction } from 'express'
import { validateRequest } from '../validators/request.validator.js'
import { ApiResponse } from '../response/api.response.js'
import { VaultCredentialErrorCode } from '../enums/vault-credential.enum.js'

/**
 * Creates a validation middleware for request body
 */
export function validateBody<T extends object>(dtoClass: new () => T) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const validation = await validateRequest(dtoClass, req.body)

    if (!validation.isValid) {
      res.status(400).json(
        ApiResponse.error(
          VaultCredentialErrorCode.VALIDATION_ERROR,
          'Request validation failed',
          validation.errors
        )
      )
      return
    }

    next()
  }
}

/**
 * Creates a validation middleware for query parameters
 */
export function validateQuery<T extends object>(dtoClass: new () => T) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const validation = await validateRequest(dtoClass, req.query)

    if (!validation.isValid) {
      res.status(400).json(
        ApiResponse.error(
          VaultCredentialErrorCode.VALIDATION_ERROR,
          'Query validation failed',
          validation.errors
        )
      )
      return
    }

    next()
  }
}

/**
 * Creates a validation middleware for route parameters
 */
export function validateParams<T extends object>(dtoClass: new () => T) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const validation = await validateRequest(dtoClass, req.params)

    if (!validation.isValid) {
      res.status(400).json(
        ApiResponse.error(
          VaultCredentialErrorCode.VALIDATION_ERROR,
          'Parameter validation failed',
          validation.errors
        )
      )
      return
    }

    next()
  }
}
