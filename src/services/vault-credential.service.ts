/**
 * Vault Credential Service
 *
 * Business logic layer for managing vault credentials.
 * Handles database operations via Prisma and secret management via HashiCorp Vault.
 * Implements version tracking - version increments by 1 when API key is updated.
 */

import { getPrismaClient } from '../lib/database/prisma-client.js'
import { getVaultClient, VaultError } from '../lib/vault/vault-client.js'
import { VaultCredentialErrorCode } from '../enums/vault-credential.enum.js'
import type { ServiceResponse } from '../errors/service.error.js'
import { VaultCredentialResponse } from '../response/vault-credential.response.js'
import type { CreateVaultCredentialRequest, UpdateVaultCredentialRequest } from '../request/vault-credential.request.js'

/**
 * Query options for listing credentials
 */
export interface ListVaultCredentialsOptions {
  limit?: number
  offset?: number
  search?: string
}

/**
 * Query options for listing credentials by locker
 */
export interface GetCredentialsByLockerOptions {
  limit?: number
  offset?: number
  search?: string
}

export class VaultCredentialService {
  private readonly prisma = getPrismaClient()
  private readonly vaultClient = getVaultClient()

  /**
   * Creates a new vault credential
   * Stores metadata in PostgreSQL and API key in HashiCorp Vault
   * Initial version is set to 1
   * Credential must be assigned to a vault locker
   */
  async createVaultCredential(
    dto: CreateVaultCredentialRequest
  ): Promise<ServiceResponse<VaultCredentialResponse>> {
    try {
      // Verify that the vault locker exists
      const locker = await this.prisma.vaultLocker.findUnique({
        where: { id: dto.lockerId },
      })

      if (!locker) {
        return {
          success: false,
          error: {
            code: VaultCredentialErrorCode.NOT_FOUND,
            message: `Vault locker with ID '${dto.lockerId}' not found`,
          },
        }
      }

      // Check if credential with same name already exists
      const existing = await this.prisma.vault.findUnique({
        where: { name: dto.name },
      })

      if (existing) {
        return {
          success: false,
          error: {
            code: VaultCredentialErrorCode.ALREADY_EXISTS,
            message: `Vault credential with name '${dto.name}' already exists`,
          },
        }
      }

      // Store API key in Vault first (single centralized storage)
      try {
        await this.vaultClient.writeSecret(dto.name, {
          apiKey: dto.apiKey,
          version: 1,
          lockerId: dto.lockerId,
          lockerName: locker.name,
        })
      } catch (error) {
        return {
          success: false,
          error: {
            code: VaultCredentialErrorCode.VAULT_OPERATION_FAILED,
            message: 'Failed to store API key in Vault',
            details: error instanceof VaultError ? error.message : String(error),
          },
        }
      }

      // Store metadata in PostgreSQL with locker relationship
      const credential = await this.prisma.vault.create({
        data: {
          name: dto.name,
          description: dto.description || null,
          version: 1,
          lockerId: dto.lockerId,
        },
      })

      return {
        success: true,
        data: this.mapToResponse(credential),
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: VaultCredentialErrorCode.DATABASE_ERROR,
          message: 'Failed to create vault credential',
          details: error instanceof Error ? error.message : String(error),
        },
      }
    }
  }

  /**
   * Retrieves a vault credential by ID
   * Returns metadata only (no API key)
   */
  async getVaultCredentialById(
    id: string
  ): Promise<ServiceResponse<VaultCredentialResponse>> {
    try {
      const credential = await this.prisma.vault.findUnique({
        where: { id },
      })

      if (!credential) {
        return {
          success: false,
          error: {
            code: VaultCredentialErrorCode.NOT_FOUND,
            message: `Vault credential with ID '${id}' not found`,
          },
        }
      }

      return {
        success: true,
        data: this.mapToResponse(credential),
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: VaultCredentialErrorCode.DATABASE_ERROR,
          message: 'Failed to retrieve vault credential',
          details: error instanceof Error ? error.message : String(error),
        },
      }
    }
  }

  /**
   * Retrieves a vault credential by name
   * Returns metadata only (no API key)
   */
  async getVaultCredentialByName(
    name: string
  ): Promise<ServiceResponse<VaultCredentialResponse>> {
    try {
      const credential = await this.prisma.vault.findUnique({
        where: { name },
      })

      if (!credential) {
        return {
          success: false,
          error: {
            code: VaultCredentialErrorCode.NOT_FOUND,
            message: `Vault credential with name '${name}' not found`,
          },
        }
      }

      return {
        success: true,
        data: this.mapToResponse(credential),
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: VaultCredentialErrorCode.DATABASE_ERROR,
          message: 'Failed to retrieve vault credential',
          details: error instanceof Error ? error.message : String(error),
        },
      }
    }
  }

  /**
   * Retrieves API key from Vault by credential name
   * This is the only method that returns the actual API key
   * Also returns the current version
   */
  async getApiKeyByName(
    name: string
  ): Promise<ServiceResponse<{ apiKey: string; version: number }>> {
    try {
      // First verify the credential exists in the database and get version
      const credential = await this.prisma.vault.findUnique({
        where: { name },
      })

      if (!credential) {
        return {
          success: false,
          error: {
            code: VaultCredentialErrorCode.NOT_FOUND,
            message: `Vault credential with name '${name}' not found`,
          },
        }
      }

      // Retrieve the API key from Vault
      try {
        const secret = await this.vaultClient.readSecret(name)

        if (!secret || !secret.apiKey) {
          return {
            success: false,
            error: {
              code: VaultCredentialErrorCode.VAULT_OPERATION_FAILED,
              message: `API key not found in Vault for credential '${name}'`,
            },
          }
        }

        return {
          success: true,
          data: {
            apiKey: secret.apiKey,
            version: credential.version,
          },
        }
      } catch (error) {
        return {
          success: false,
          error: {
            code: VaultCredentialErrorCode.VAULT_OPERATION_FAILED,
            message: 'Failed to retrieve API key from Vault',
            details: error instanceof VaultError ? error.message : String(error),
          },
        }
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: VaultCredentialErrorCode.DATABASE_ERROR,
          message: 'Failed to verify credential existence',
          details: error instanceof Error ? error.message : String(error),
        },
      }
    }
  }

  /**
   * Lists all vault credentials with optional filtering
   * For global credential listing across all lockers
   */
  async listVaultCredentials(
    options: ListVaultCredentialsOptions = {}
  ): Promise<ServiceResponse<VaultCredentialResponse[]>> {
    try {
      const { limit = 50, offset = 0, search } = options

      const credentials = await this.prisma.vault.findMany({
        where: search
          ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
          : undefined,
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: 'desc',
        },
      })

      return {
        success: true,
        data: credentials.map((c) => this.mapToResponse(c)),
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: VaultCredentialErrorCode.DATABASE_ERROR,
          message: 'Failed to list vault credentials',
          details: error instanceof Error ? error.message : String(error),
        },
      }
    }
  }

  /**
   * Retrieves all vault credentials for a specific vault locker
   * Dedicated method for locker-specific credential retrieval
   * 
   * @param lockerId - The ID of the vault locker
   * @param options - Optional filtering and pagination options
   * @returns Service response containing credentials for the specified locker
   */
  async getVaultCredentialsByLockerId(
    lockerId: string,
    options: GetCredentialsByLockerOptions = {}
  ): Promise<ServiceResponse<VaultCredentialResponse[]>> {
    try {
      // Verify that the vault locker exists
      const locker = await this.prisma.vaultLocker.findUnique({
        where: { id: lockerId },
      })

      if (!locker) {
        return {
          success: false,
          error: {
            code: VaultCredentialErrorCode.NOT_FOUND,
            message: `Vault locker with ID '${lockerId}' not found`,
          },
        }
      }

      const { limit = 50, offset = 0, search } = options

      // Build where clause for locker-specific credentials
      const where: any = { lockerId }

      // Add search filter if provided
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      }

      const credentials = await this.prisma.vault.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: 'desc',
        },
      })

      return {
        success: true,
        data: credentials.map((c) => this.mapToResponse(c)),
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: VaultCredentialErrorCode.DATABASE_ERROR,
          message: 'Failed to retrieve credentials for vault locker',
          details: error instanceof Error ? error.message : String(error),
        },
      }
    }
  }

  /**
   * Updates a vault credential
   * Can update metadata and/or API key
   * IMPORTANT: Version increments by 1 if API key is updated
   */
  async updateVaultCredential(
    id: string,
    dto: UpdateVaultCredentialRequest
  ): Promise<ServiceResponse<VaultCredentialResponse>> {
    try {
      // Check if credential exists
      const existing = await this.prisma.vault.findUnique({
        where: { id },
      })

      if (!existing) {
        return {
          success: false,
          error: {
            code: VaultCredentialErrorCode.NOT_FOUND,
            message: `Vault credential with ID '${id}' not found`,
          },
        }
      }

      // If name is being changed, check for conflicts
      if (dto.name && dto.name !== existing.name) {
        const nameConflict = await this.prisma.vault.findUnique({
          where: { name: dto.name },
        })

        if (nameConflict) {
          return {
            success: false,
            error: {
              code: VaultCredentialErrorCode.ALREADY_EXISTS,
              message: `Vault credential with name '${dto.name}' already exists`,
            },
          }
        }
      }

      // Determine if we need to increment version (only if API key is updated)
      const shouldIncrementVersion = !!dto.apiKey
      const newVersion = shouldIncrementVersion ? existing.version + 1 : existing.version

      // Update API key in Vault if provided
      if (dto.apiKey) {
        try {
          const currentName = dto.name || existing.name
          await this.vaultClient.writeSecret(currentName, {
            apiKey: dto.apiKey,
            version: newVersion,
          })

          // If name changed, delete old secret
          if (dto.name && dto.name !== existing.name) {
            await this.vaultClient.deleteSecret(existing.name)
          }
        } catch (error) {
          return {
            success: false,
            error: {
              code: VaultCredentialErrorCode.VAULT_OPERATION_FAILED,
              message: 'Failed to update API key in Vault',
              details: error instanceof VaultError ? error.message : String(error),
            },
          }
        }
      } else if (dto.name && dto.name !== existing.name) {
        // Name changed but no new API key - need to move the secret
        try {
          const secret = await this.vaultClient.readSecret(existing.name)
          if (secret) {
            await this.vaultClient.writeSecret(dto.name, secret)
            await this.vaultClient.deleteSecret(existing.name)
          }
        } catch (error) {
          return {
            success: false,
            error: {
              code: VaultCredentialErrorCode.VAULT_OPERATION_FAILED,
              message: 'Failed to move secret in Vault',
              details: error instanceof VaultError ? error.message : String(error),
            },
          }
        }
      }

      // Update metadata in PostgreSQL
      const credential = await this.prisma.vault.update({
        where: { id },
        data: {
          ...(dto.name && { name: dto.name }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(shouldIncrementVersion && { version: newVersion }),
        },
      })

      return {
        success: true,
        data: this.mapToResponse(credential),
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: VaultCredentialErrorCode.DATABASE_ERROR,
          message: 'Failed to update vault credential',
          details: error instanceof Error ? error.message : String(error),
        },
      }
    }
  }

  /**
   * Deletes a vault credential
   * Removes both database entry and Vault secret
   */
  async deleteVaultCredential(id: string): Promise<ServiceResponse<void>> {
    try {
      // Get credential to obtain name for Vault deletion
      const credential = await this.prisma.vault.findUnique({
        where: { id },
      })

      if (!credential) {
        return {
          success: false,
          error: {
            code: VaultCredentialErrorCode.NOT_FOUND,
            message: `Vault credential with ID '${id}' not found`,
          },
        }
      }

      // Delete from Vault first
      try {
        await this.vaultClient.deleteSecret(credential.name)
      } catch (error) {
        // Log but don't fail if Vault deletion fails - silent failure for vault cleanup
        // In production, consider using a proper logging service
      }

      // Delete from database
      await this.prisma.vault.delete({
        where: { id },
      })

      return {
        success: true,
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: VaultCredentialErrorCode.DATABASE_ERROR,
          message: 'Failed to delete vault credential',
          details: error instanceof Error ? error.message : String(error),
        },
      }
    }
  }

  /**
   * Maps Prisma model to response DTO
   */
  private mapToResponse(credential: {
    id: string
    name: string
    description: string | null
    version: number
    createdAt: Date
    updatedAt: Date
  }): VaultCredentialResponse {
    return new VaultCredentialResponse({
      id: credential.id,
      name: credential.name,
      description: credential.description,
      version: credential.version,
      createdAt: credential.createdAt,
      updatedAt: credential.updatedAt,
    })
  }
}
