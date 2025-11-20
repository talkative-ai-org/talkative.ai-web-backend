/**
 * Vault Credential Request DTOs
 */

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator'

/**
 * Create vault credential request
 */
export class CreateVaultCredentialRequest {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name!: string

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  apiKey!: string
}

/**
 * Update vault credential request
 */
export class UpdateVaultCredentialRequest {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(100)
  name?: string

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string

  @IsString()
  @IsOptional()
  @MinLength(10)
  apiKey?: string
}

/**
 * Query parameters for listing vault credentials
 */
export class ListVaultCredentialsQuery {
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
