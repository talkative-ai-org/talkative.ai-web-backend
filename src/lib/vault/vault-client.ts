/**
 * HashiCorp Vault Client
 *
 * Provides secure interaction with HashiCorp Vault for API key storage and retrieval.
 * This client handles authentication, error handling, and maintains connection pooling.
 */

import { Config } from '../../config/config.js'

export interface VaultSecretData {
  apiKey: string
  [key: string]: unknown
}

export interface VaultWriteOptions {
  path: string
  data: VaultSecretData
}

export interface VaultReadOptions {
  path: string
}

/**
 * Custom error class for Vault operations
 */
export class VaultError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'VaultError'
    Object.setPrototypeOf(this, VaultError.prototype)
  }
}

/**
 * HashiCorp Vault Client Implementation
 */
export class VaultClient {
  private readonly baseUrl: string
  private readonly token: string
  private readonly mountPath: string

  constructor() {
    this.baseUrl = Config.vault.address
    this.token = Config.vault.token
    this.mountPath = Config.vault.mountPath

    this.validateConfiguration()
  }

  /**
   * Validates that all required Vault configuration is present
   */
  private validateConfiguration(): void {
    if (!this.baseUrl) {
      throw new VaultError('Vault address is not configured')
    }
    if (!this.token) {
      throw new VaultError('Vault token is not configured')
    }
    if (!this.mountPath) {
      throw new VaultError('Vault mount path is not configured')
    }
  }

  /**
   * Constructs the full secret path for KV v2 engine
   */
  private getSecretPath(name: string): string {
    return `${this.mountPath}/data/${name}`
  }

  /**
   * Makes an authenticated request to Vault
   */
  private async makeRequest<T>(
    path: string,
    method: string = 'GET',
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}/v1/${path}`

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'X-Vault-Token': this.token,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new VaultError(
          `Vault request failed: ${errorText}`,
          response.status
        )
      }

      // DELETE requests may not return content
      if (method === 'DELETE' && response.status === 204) {
        return {} as T
      }

      return await response.json()
    } catch (error) {
      if (error instanceof VaultError) {
        throw error
      }

      throw new VaultError(
        'Failed to communicate with Vault',
        undefined,
        error instanceof Error ? error : new Error(String(error))
      )
    }
  }

  /**
   * Writes a secret to Vault
   */
  async writeSecret(name: string, data: VaultSecretData): Promise<void> {
    const path = this.getSecretPath(name)

    try {
      await this.makeRequest(path, 'POST', {
        data,
        options: {
          cas: 0, // Create if not exists, update otherwise
        },
      })
    } catch (error) {
      throw new VaultError(
        `Failed to write secret '${name}' to Vault`,
        error instanceof VaultError ? error.statusCode : undefined,
        error instanceof Error ? error : new Error(String(error))
      )
    }
  }

  /**
   * Reads a secret from Vault
   */
  async readSecret(name: string): Promise<VaultSecretData | null> {
    const path = this.getSecretPath(name)

    try {
      const response = await this.makeRequest<{
        data: { data: VaultSecretData; metadata: unknown }
      }>(path, 'GET')

      return response.data.data
    } catch (error) {
      // Return null for 404 errors (secret not found)
      if (error instanceof VaultError && error.statusCode === 404) {
        return null
      }

      throw new VaultError(
        `Failed to read secret '${name}' from Vault`,
        error instanceof VaultError ? error.statusCode : undefined,
        error instanceof Error ? error : new Error(String(error))
      )
    }
  }

  /**
   * Deletes a secret from Vault (soft delete - can be recovered)
   */
  async deleteSecret(name: string): Promise<void> {
    const path = this.getSecretPath(name)

    try {
      await this.makeRequest(path, 'DELETE')
    } catch (error) {
      throw new VaultError(
        `Failed to delete secret '${name}' from Vault`,
        error instanceof VaultError ? error.statusCode : undefined,
        error instanceof Error ? error : new Error(String(error))
      )
    }
  }

  /**
   * Checks if a secret exists in Vault
   */
  async secretExists(name: string): Promise<boolean> {
    const secret = await this.readSecret(name)
    return secret !== null
  }

  /**
   * Health check for Vault connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.makeRequest<{ initialized: boolean; sealed: boolean }>(
        'sys/health',
        'GET'
      )
      return true
    } catch {
      return false
    }
  }
}

// Singleton instance
let vaultClientInstance: VaultClient | null = null

/**
 * Gets or creates the Vault client singleton instance
 */
export function getVaultClient(): VaultClient {
  if (!vaultClientInstance) {
    vaultClientInstance = new VaultClient()
  }
  return vaultClientInstance
}
