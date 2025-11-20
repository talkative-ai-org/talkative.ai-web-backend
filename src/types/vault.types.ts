/**
 * Vault Module Type Definitions
 */

/**
 * Valid vault credential types
 */
export type VaultCredentialType = 'tts' | 'stt' | 'llm' | 'external'

/**
 * Data Transfer Objects (DTOs)
 */

export interface CreateVaultCredentialDto {
  name: string
  description?: string
  provider: string
  type: VaultCredentialType
  apiKey: string
}

export interface UpdateVaultCredentialDto {
  name?: string
  description?: string
  provider?: string
  type?: VaultCredentialType
  apiKey?: string
}

export interface VaultCredentialResponseDto {
  id: string
  name: string
  description: string | null
  provider: string
  type: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Service layer response types
 */

export interface ServiceResponse<T> {
  success: boolean
  data?: T
  error?: ServiceError
}

export interface ServiceError {
  code: string
  message: string
  details?: unknown
}

/**
 * Query options for listing credentials
 */

export interface ListVaultCredentialsQuery {
  type?: VaultCredentialType
  provider?: string
  limit?: number
  offset?: number
}
