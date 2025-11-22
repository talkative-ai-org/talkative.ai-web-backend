/**
 * Vault Locker Controller
 *
 * Handles HTTP requests for vault locker management.
 * Calls service layer and formats responses.
 */

import type { Request, Response } from 'express'
import { VaultLockerService } from '../services/vault-locker.service.js'
import type {
  CreateVaultLockerRequest,
  UpdateVaultLockerRequest,
} from '../request/vault-locker.request.js'
import { ApiResponse } from '../response/api.response.js'
import { VaultCredentialErrorCode } from '../enums/vault-credential.enum.js'

export class VaultLockerController {
  private readonly vaultLockerService = new VaultLockerService()

  /**
   * Create a new vault locker
   * POST /api/v1/vault-lockers
   */
  async createVaultLocker(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.vaultLockerService.createVaultLocker(
        req.body as CreateVaultLockerRequest
      )

      if (!result.success) {
        const statusCode = this.getStatusCodeFromError(result.error!.code)
        res.status(statusCode).json(
          ApiResponse.error(
            result.error!.code,
            result.error!.message,
            result.error!.details
          )
        )
        return
      }

      res.status(201).json(ApiResponse.success(result.data))
    } catch (error) {
      this.handleUnexpectedError(res, error)
    }
  }

  /**
   * Get a vault locker by ID
   * GET /api/v1/vault-lockers/:id
   */
  async getVaultLockerById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { includeVaults } = req.query

      const result = await this.vaultLockerService.getVaultLockerById(
        id,
        includeVaults === 'true'
      )

      if (!result.success) {
        const statusCode = this.getStatusCodeFromError(result.error!.code)
        res.status(statusCode).json(
          ApiResponse.error(
            result.error!.code,
            result.error!.message,
            result.error!.details
          )
        )
        return
      }

      res.status(200).json(ApiResponse.success(result.data))
    } catch (error) {
      this.handleUnexpectedError(res, error)
    }
  }

  /**
   * Get a vault locker by name
   * GET /api/v1/vault-lockers/by-name/:name
   */
  async getVaultLockerByName(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.params
      const { includeVaults } = req.query

      const result = await this.vaultLockerService.getVaultLockerByName(
        name,
        includeVaults === 'true'
      )

      if (!result.success) {
        const statusCode = this.getStatusCodeFromError(result.error!.code)
        res.status(statusCode).json(
          ApiResponse.error(
            result.error!.code,
            result.error!.message,
            result.error!.details
          )
        )
        return
      }

      res.status(200).json(ApiResponse.success(result.data))
    } catch (error) {
      this.handleUnexpectedError(res, error)
    }
  }

  /**
   * List all vault lockers with optional filtering
   * GET /api/v1/vault-lockers
   */
  async listVaultLockers(req: Request, res: Response): Promise<void> {
    try {
      const { search, limit, offset, includeCount } = req.query as Record<
        string,
        string | undefined
      >

      const result = await this.vaultLockerService.listVaultLockers({
        search,
        limit: limit ? parseInt(limit, 10) : undefined,
        offset: offset ? parseInt(offset, 10) : undefined,
        includeCount: includeCount === 'true',
      })

      if (!result.success) {
        const statusCode = this.getStatusCodeFromError(result.error!.code)
        res.status(statusCode).json(
          ApiResponse.error(
            result.error!.code,
            result.error!.message,
            result.error!.details
          )
        )
        return
      }

      res.status(200).json(ApiResponse.success(result.data))
    } catch (error) {
      this.handleUnexpectedError(res, error)
    }
  }

  /**
   * Get all vaults within a specific locker
   * GET /api/v1/vault-lockers/:id/vaults
   */
  async getVaultsInLocker(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { limit, offset } = req.query as Record<string, string | undefined>

      const result = await this.vaultLockerService.getVaultsInLocker(
        id,
        limit ? parseInt(limit, 10) : undefined,
        offset ? parseInt(offset, 10) : undefined
      )

      if (!result.success) {
        const statusCode = this.getStatusCodeFromError(result.error!.code)
        res.status(statusCode).json(
          ApiResponse.error(
            result.error!.code,
            result.error!.message,
            result.error!.details
          )
        )
        return
      }

      res.status(200).json(ApiResponse.success(result.data))
    } catch (error) {
      this.handleUnexpectedError(res, error)
    }
  }

  /**
   * Update a vault locker
   * PATCH /api/v1/vault-lockers/:id
   */
  async updateVaultLocker(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      const result = await this.vaultLockerService.updateVaultLocker(
        id,
        req.body as UpdateVaultLockerRequest
      )

      if (!result.success) {
        const statusCode = this.getStatusCodeFromError(result.error!.code)
        res.status(statusCode).json(
          ApiResponse.error(
            result.error!.code,
            result.error!.message,
            result.error!.details
          )
        )
        return
      }

      res.status(200).json(ApiResponse.success(result.data))
    } catch (error) {
      this.handleUnexpectedError(res, error)
    }
  }

  /**
   * Delete a vault locker
   * DELETE /api/v1/vault-lockers/:id
   */
  async deleteVaultLocker(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { force } = req.query

      const result = await this.vaultLockerService.deleteVaultLocker(
        id,
        force === 'true'
      )

      if (!result.success) {
        const statusCode = this.getStatusCodeFromError(result.error!.code)
        res.status(statusCode).json(
          ApiResponse.error(
            result.error!.code,
            result.error!.message,
            result.error!.details
          )
        )
        return
      }

      res.status(204).send()
    } catch (error) {
      this.handleUnexpectedError(res, error)
    }
  }

  /**
   * Maps error codes to HTTP status codes
   */
  private getStatusCodeFromError(errorCode: string): number {
    switch (errorCode) {
      case VaultCredentialErrorCode.NOT_FOUND:
        return 404
      case VaultCredentialErrorCode.ALREADY_EXISTS:
        return 409
      case VaultCredentialErrorCode.VALIDATION_ERROR:
      case VaultCredentialErrorCode.INVALID_INPUT:
        return 400
      case VaultCredentialErrorCode.VAULT_OPERATION_FAILED:
      case VaultCredentialErrorCode.DATABASE_ERROR:
        return 500
      default:
        return 500
    }
  }

  /**
   * Handles unexpected errors
   */
  private handleUnexpectedError(res: Response, error: unknown): void {
    res.status(500).json(
      ApiResponse.error(
        'INTERNAL_SERVER_ERROR',
        'An unexpected error occurred',
        error instanceof Error ? error.message : String(error)
      )
    )
  }
}
