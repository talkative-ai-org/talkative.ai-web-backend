/**
 * Vault Locker Service
 *
 * Business logic layer for managing vault lockers.
 * Lockers are logical groupings for organizing API keys (vaults).
 * Note: Actual API keys are still stored in HashiCorp Vault, not separated by locker.
 */

import { getPrismaClient } from '../lib/database/prisma-client.js'
import { VaultCredentialErrorCode } from '../enums/vault-credential.enum.js'
import type { ServiceResponse } from '../errors/service.error.js'
import {
  VaultLockerResponse,
  VaultLockerWithCountResponse,
  VaultLockerDetailResponse,
} from '../response/vault-locker.response.js'
import { VaultCredentialResponse } from '../response/vault-credential.response.js'
import type {
  CreateVaultLockerRequest,
  UpdateVaultLockerRequest,
} from '../request/vault-locker.request.js'

/**
 * Query options for listing lockers
 */
export interface ListVaultLockersOptions {
  limit?: number
  offset?: number
  search?: string
  includeCount?: boolean
}

export class VaultLockerService {
  private readonly prisma = getPrismaClient()

  /**
   * Creates a new vault locker
   * Stores locker metadata in PostgreSQL
   */
  async createVaultLocker(
    dto: CreateVaultLockerRequest
  ): Promise<ServiceResponse<VaultLockerResponse>> {
    try {
      // Check if locker with same name already exists
      const existing = await this.prisma.vaultLocker.findUnique({
        where: { name: dto.name },
      })

      if (existing) {
        return {
          success: false,
          error: {
            code: VaultCredentialErrorCode.ALREADY_EXISTS,
            message: `Vault locker with name '${dto.name}' already exists`,
          },
        }
      }

      // Create locker in PostgreSQL
      const locker = await this.prisma.vaultLocker.create({
        data: {
          name: dto.name,
          description: dto.description || null,
        },
      })

      return {
        success: true,
        data: this.mapToResponse(locker),
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: VaultCredentialErrorCode.DATABASE_ERROR,
          message: 'Failed to create vault locker',
          details: error instanceof Error ? error.message : String(error),
        },
      }
    }
  }

  /**
   * Retrieves a vault locker by ID
   * Optionally includes nested vault credentials
   */
  async getVaultLockerById(
    id: string,
    includeVaults: boolean = false
  ): Promise<ServiceResponse<VaultLockerResponse | VaultLockerDetailResponse>> {
    try {
      const locker = await this.prisma.vaultLocker.findUnique({
        where: { id },
        include: {
          vaults: includeVaults,
        },
      })

      if (!locker) {
        return {
          success: false,
          error: {
            code: VaultCredentialErrorCode.NOT_FOUND,
            message: `Vault locker with ID '${id}' not found`,
          },
        }
      }

      if (includeVaults) {
        return {
          success: true,
          data: this.mapToDetailResponse(locker),
        }
      }

      return {
        success: true,
        data: this.mapToResponse(locker),
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: VaultCredentialErrorCode.DATABASE_ERROR,
          message: 'Failed to retrieve vault locker',
          details: error instanceof Error ? error.message : String(error),
        },
      }
    }
  }

  /**
   * Retrieves a vault locker by name
   * Optionally includes nested vault credentials
   */
  async getVaultLockerByName(
    name: string,
    includeVaults: boolean = false
  ): Promise<ServiceResponse<VaultLockerResponse | VaultLockerDetailResponse>> {
    try {
      const locker = await this.prisma.vaultLocker.findUnique({
        where: { name },
        include: {
          vaults: includeVaults,
        },
      })

      if (!locker) {
        return {
          success: false,
          error: {
            code: VaultCredentialErrorCode.NOT_FOUND,
            message: `Vault locker with name '${name}' not found`,
          },
        }
      }

      if (includeVaults) {
        return {
          success: true,
          data: this.mapToDetailResponse(locker),
        }
      }

      return {
        success: true,
        data: this.mapToResponse(locker),
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: VaultCredentialErrorCode.DATABASE_ERROR,
          message: 'Failed to retrieve vault locker',
          details: error instanceof Error ? error.message : String(error),
        },
      }
    }
  }

  /**
   * Lists all vault lockers with optional filtering
   * Can include vault count per locker
   */
  async listVaultLockers(
    options: ListVaultLockersOptions = {}
  ): Promise<
    ServiceResponse<VaultLockerResponse[] | VaultLockerWithCountResponse[]>
  > {
    try {
      const { limit = 50, offset = 0, search, includeCount = false } = options

      const lockers = await this.prisma.vaultLocker.findMany({
        where: search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
              ],
            }
          : undefined,
        include: {
          _count: includeCount
            ? {
                select: { vaults: true },
              }
            : undefined,
        },
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: 'desc',
        },
      })

      if (includeCount) {
        return {
          success: true,
          data: lockers.map((locker) =>
            this.mapToResponseWithCount(locker, locker._count?.vaults || 0)
          ),
        }
      }

      return {
        success: true,
        data: lockers.map((locker) => this.mapToResponse(locker)),
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: VaultCredentialErrorCode.DATABASE_ERROR,
          message: 'Failed to list vault lockers',
          details: error instanceof Error ? error.message : String(error),
        },
      }
    }
  }

  /**
   * Gets all vaults within a specific locker
   */
  async getVaultsInLocker(
    lockerId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ServiceResponse<VaultCredentialResponse[]>> {
    try {
      // Verify locker exists
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

      // Get vaults in this locker
      const vaults = await this.prisma.vault.findMany({
        where: { lockerId },
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: 'desc',
        },
      })

      return {
        success: true,
        data: vaults.map((vault) => this.mapVaultToResponse(vault)),
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: VaultCredentialErrorCode.DATABASE_ERROR,
          message: 'Failed to retrieve vaults in locker',
          details: error instanceof Error ? error.message : String(error),
        },
      }
    }
  }

  /**
   * Updates a vault locker
   */
  async updateVaultLocker(
    id: string,
    dto: UpdateVaultLockerRequest
  ): Promise<ServiceResponse<VaultLockerResponse>> {
    try {
      // Check if locker exists
      const existing = await this.prisma.vaultLocker.findUnique({
        where: { id },
      })

      if (!existing) {
        return {
          success: false,
          error: {
            code: VaultCredentialErrorCode.NOT_FOUND,
            message: `Vault locker with ID '${id}' not found`,
          },
        }
      }

      // If name is being changed, check for conflicts
      if (dto.name && dto.name !== existing.name) {
        const nameConflict = await this.prisma.vaultLocker.findUnique({
          where: { name: dto.name },
        })

        if (nameConflict) {
          return {
            success: false,
            error: {
              code: VaultCredentialErrorCode.ALREADY_EXISTS,
              message: `Vault locker with name '${dto.name}' already exists`,
            },
          }
        }
      }

      // Update locker
      const locker = await this.prisma.vaultLocker.update({
        where: { id },
        data: {
          ...(dto.name && { name: dto.name }),
          ...(dto.description !== undefined && { description: dto.description }),
        },
      })

      return {
        success: true,
        data: this.mapToResponse(locker),
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: VaultCredentialErrorCode.DATABASE_ERROR,
          message: 'Failed to update vault locker',
          details: error instanceof Error ? error.message : String(error),
        },
      }
    }
  }

  /**
   * Deletes a vault locker
   * Prevents deletion if locker contains vaults
   */
  async deleteVaultLocker(
    id: string,
    force: boolean = false
  ): Promise<ServiceResponse<void>> {
    try {
      // Get locker with vault count
      const locker = await this.prisma.vaultLocker.findUnique({
        where: { id },
        include: {
          _count: {
            select: { vaults: true },
          },
        },
      })

      if (!locker) {
        return {
          success: false,
          error: {
            code: VaultCredentialErrorCode.NOT_FOUND,
            message: `Vault locker with ID '${id}' not found`,
          },
        }
      }

      // Prevent deletion if locker has vaults (unless force is true)
      if (locker._count.vaults > 0 && !force) {
        return {
          success: false,
          error: {
            code: VaultCredentialErrorCode.INVALID_INPUT,
            message: `Cannot delete vault locker '${locker.name}' because it contains ${locker._count.vaults} vault(s). Use force parameter to delete anyway.`,
            details: { vaultCount: locker._count.vaults },
          },
        }
      }

      // If force delete, first delete all vaults in this locker
      if (force && locker._count.vaults > 0) {
        // Note: This will also delete the API keys from HashiCorp Vault
        // This is handled by the Vault service's delete method
        await this.prisma.vault.deleteMany({
          where: { lockerId: id },
        })
      }

      // Delete the locker
      await this.prisma.vaultLocker.delete({
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
          message: 'Failed to delete vault locker',
          details: error instanceof Error ? error.message : String(error),
        },
      }
    }
  }

  /**
   * Maps Prisma model to response DTO
   */
  private mapToResponse(locker: {
    id: string
    name: string
    description: string | null
    createdAt: Date
    updatedAt: Date
  }): VaultLockerResponse {
    return new VaultLockerResponse({
      id: locker.id,
      name: locker.name,
      description: locker.description,
      createdAt: locker.createdAt,
      updatedAt: locker.updatedAt,
    })
  }

  /**
   * Maps Prisma model to response with count
   */
  private mapToResponseWithCount(
    locker: {
      id: string
      name: string
      description: string | null
      createdAt: Date
      updatedAt: Date
    },
    vaultCount: number
  ): VaultLockerWithCountResponse {
    return new VaultLockerWithCountResponse({
      id: locker.id,
      name: locker.name,
      description: locker.description,
      createdAt: locker.createdAt,
      updatedAt: locker.updatedAt,
      vaultCount,
    })
  }

  /**
   * Maps Prisma model to detail response with vaults
   */
  private mapToDetailResponse(locker: {
    id: string
    name: string
    description: string | null
    createdAt: Date
    updatedAt: Date
    vaults: {
      id: string
      name: string
      description: string | null
      version: number
      createdAt: Date
      updatedAt: Date
    }[]
  }): VaultLockerDetailResponse {
    return new VaultLockerDetailResponse({
      id: locker.id,
      name: locker.name,
      description: locker.description,
      createdAt: locker.createdAt,
      updatedAt: locker.updatedAt,
      vaults: locker.vaults.map((vault) => this.mapVaultToResponse(vault)),
    })
  }

  /**
   * Maps Vault model to VaultCredentialResponse
   */
  private mapVaultToResponse(vault: {
    id: string
    name: string
    description: string | null
    version: number
    createdAt: Date
    updatedAt: Date
  }): VaultCredentialResponse {
    return new VaultCredentialResponse({
      id: vault.id,
      name: vault.name,
      description: vault.description,
      version: vault.version,
      createdAt: vault.createdAt,
      updatedAt: vault.updatedAt,
    })
  }
}
