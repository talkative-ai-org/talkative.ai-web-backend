/**
 * Vault Credential Response DTOs
 */

/**
 * Standard vault credential response
 */
export class VaultCredentialResponse {
  id!: string
  name!: string
  description!: string | null
  version!: number
  createdAt!: Date
  updatedAt!: Date

  constructor(data: {
    id: string
    name: string
    description: string | null
    version: number
    createdAt: Date
    updatedAt: Date
  }) {
    this.id = data.id
    this.name = data.name
    this.description = data.description
    this.version = data.version
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }
}

/**
 * API key response (returned only when explicitly requested)
 */
export class ApiKeyResponse {
  apiKey!: string
  version!: number

  constructor(apiKey: string, version: number) {
    this.apiKey = apiKey
    this.version = version
  }
}
