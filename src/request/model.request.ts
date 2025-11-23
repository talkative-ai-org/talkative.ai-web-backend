/**
 * Model Request DTOs
 * 
 * Data Transfer Objects for model-related API requests.
 */

import { ModelType } from '../enums/model.enum.js';

/**
 * Create Model Request
 * 
 * Required fields for creating a new model configuration.
 */
export interface CreateModelRequest {
    /**
     * Provider identifier (e.g., "openai", "anthropic", "elevenlabs")
     */
    provider: string;

    /**
     * Model name/identifier (e.g., "gpt-4o", "claude-3-5-sonnet-20241022")
     */
    modelName: string;

    /**
     * Type of model: llm, stt, or tts
     */
    modelType: ModelType;

    /**
     * Optional reference to a vault key for API authentication
     */
    vaultKeyId?: string;

    /**
     * Custom configuration as JSON object
     * Can include: api_url, custom_params, temperature, max_tokens, etc.
     */
    configuration: Record<string, unknown>;
}

/**
 * Update Model Request
 * 
 * Partial update for existing model configuration.
 * All fields are optional.
 */
export interface UpdateModelRequest {
    /**
     * Update provider identifier
     */
    provider?: string;

    /**
     * Update model name
     */
    modelName?: string;

    /**
     * Update vault key reference
     */
    vaultKeyId?: string | null;

    /**
     * Update configuration
     */
    configuration?: Record<string, unknown>;
}

/**
 * List Models Query Parameters
 * 
 * Query parameters for filtering and paginating model listings.
 */
export interface ListModelsQuery {
    /**
     * Filter by model type
     */
    modelType?: ModelType;

    /**
     * Filter by provider
     */
    provider?: string;

    /**
     * Search in model name or provider
     */
    search?: string;

    /**
     * Maximum number of results
     * @default 50
     */
    limit?: number;

    /**
     * Number of results to skip (for pagination)
     * @default 0
     */
    offset?: number;
}
