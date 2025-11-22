/**
 * Vault Locker Request DTOs
 */

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator'

/**
 * Create vault locker request
 */
export class CreateVaultLockerRequest {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name!: string

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string
}

/**
 * Update vault locker request
 */
export class UpdateVaultLockerRequest {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(100)
  name?: string

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string
}

/**
 * Query parameters for listing vault lockers
 */
export class ListVaultLockersQuery {
  @IsOptional()
  @IsString()
  limit?: string

  @IsOptional()
  @IsString()
  offset?: string

  @IsOptional()
  @IsString()
  search?: string
}
