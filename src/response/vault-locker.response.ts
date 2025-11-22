/**
 * Vault Locker Response DTOs
 */

import { VaultCredentialResponse } from './vault-credential.response.js'

/**
 * Standard vault locker response
 */
export class VaultLockerResponse {
  id!: string
  name!: string
  description!: string | null
  createdAt!: Date
  updatedAt!: Date

  constructor(data: {
    id: string
    name: string
    description: string | null
    createdAt: Date
    updatedAt: Date
  }) {
    this.id = data.id
    this.name = data.name
    this.description = data.description
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }
}

/**
 * Vault locker with vault credentials count
 */
export class VaultLockerWithCountResponse extends VaultLockerResponse {
  vaultCount!: number

  constructor(data: {
    id: string
    name: string
    description: string | null
    createdAt: Date
    updatedAt: Date
    vaultCount: number
  }) {
    super(data)
    this.vaultCount = data.vaultCount
  }
}

/**
 * Vault locker with nested vault credentials
 */
export class VaultLockerDetailResponse extends VaultLockerResponse {
  vaults!: VaultCredentialResponse[]

  constructor(data: {
    id: string
    name: string
    description: string | null
    createdAt: Date
    updatedAt: Date
    vaults: VaultCredentialResponse[]
  }) {
    super(data)
    this.vaults = data.vaults
  }
}
