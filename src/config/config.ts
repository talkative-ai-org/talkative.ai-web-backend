/**
 * Application Configuration
 *
 * Centralized configuration management using environment variables.
 */

/**
 * Environment variable validation
 */
function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`)
  }
  return value
}

function getOptionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue
}

/**
 * Application configuration object
 */
export const Config = {
  /**
   * Server configuration
   */
  port: parseInt(getOptionalEnv('PORT', '8080'), 10),
  nodeEnv: getOptionalEnv('NODE_ENV', 'development'),

  /**
   * Database configuration
   */
  database: {
    url: getOptionalEnv('DATABASE_URL', ''),
  },

  /**
   * HashiCorp Vault configuration
   */
  vault: {
    address: getRequiredEnv('VAULT_ADDRESS'),
    token: getRequiredEnv('VAULT_TOKEN'),
    mountPath: getOptionalEnv('VAULT_MOUNT_PATH', 'secret'),
  },

  /**
   * CORS configuration
   */
  cors: {
    origin: getOptionalEnv('CORS_ORIGIN', '*'),
    credentials: getOptionalEnv('CORS_CREDENTIALS', 'true') === 'true',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },

  /**
   * API configuration
   */
  api: {
    version: '1.0.0',
    prefix: '/api',
  },
} as const
