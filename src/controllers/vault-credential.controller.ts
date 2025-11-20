/**
 * Vault Credential Controller
 *
 * Handles HTTP requests for vault credential management.
 * Calls service layer and formats responses.
 */

import type { Request, Response } from 'express'
import { VaultCredentialService } from '../services/vault-credential.service.js'
import type {
  CreateVaultCredentialRequest,
  UpdateVaultCredentialRequest,
} from '../request/vault-credential.request.js'
import { ApiResponse } from '../response/api.response.js'
import { ApiKeyResponse } from '../response/vault-credential.response.js'
import { VaultCredentialErrorCode } from '../enums/vault-credential.enum.js'

export class VaultCredentialController {
  private readonly vaultCredentialService = new VaultCredentialService()

  /**
   * Create a new vault credential
   * POST /api/v1/vault-credentials
   */
  async createVaultCredential(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.vaultCredentialService.createVaultCredential(
        req.body as CreateVaultCredentialRequest
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
   * Get a vault credential by ID
   * GET /api/v1/vault-credentials/:id
   */
  async getVaultCredentialById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      const result = await this.vaultCredentialService.getVaultCredentialById(id)

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
   * Get a vault credential by name
   * GET /api/v1/vault-credentials/by-name/:name
   */
  async getVaultCredentialByName(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.params

      const result = await this.vaultCredentialService.getVaultCredentialByName(
        name
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
   * Get API key by credential name
   * GET /api/v1/vault-credentials/:name/api-key
   */
  async getApiKeyByName(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.params

      const result = await this.vaultCredentialService.getApiKeyByName(name)

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

      res.status(200).json(
        ApiResponse.success(
          new ApiKeyResponse(result.data!.apiKey, result.data!.version)
        )
      )
    } catch (error) {
      this.handleUnexpectedError(res, error)
    }
  }

  /**
   * List all vault credentials with optional filtering
   * GET /api/v1/vault-credentials
   */
  async listVaultCredentials(req: Request, res: Response): Promise<void> {
    try {
      const { search, limit, offset } = req.query as Record<
        string,
        string | undefined
      >

      const result = await this.vaultCredentialService.listVaultCredentials({
        search,
        limit: limit ? parseInt(limit, 10) : undefined,
        offset: offset ? parseInt(offset, 10) : undefined,
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
   * Update a vault credential
   * PATCH /api/v1/vault-credentials/:id
   */
  async updateVaultCredential(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      const result = await this.vaultCredentialService.updateVaultCredential(
        id,
        req.body as UpdateVaultCredentialRequest
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
   * Delete a vault credential
   * DELETE /api/v1/vault-credentials/:id
   */
  async deleteVaultCredential(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      const result = await this.vaultCredentialService.deleteVaultCredential(id)

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
    console.error('Unexpected error:', error)
    res.status(500).json(
      ApiResponse.error(
        'INTERNAL_SERVER_ERROR',
        'An unexpected error occurred',
        error instanceof Error ? error.message : String(error)
      )
    )
  }
}
