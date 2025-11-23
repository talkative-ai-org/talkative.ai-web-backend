/**
 * Model Response DTOs
 * 
 * Data Transfer Objects for model-related API responses.
 */

import { ModelType } from '../enums/model.enum.js';

/**
 * Model Response
 * 
 * Complete model configuration data returned from API.
 */
export class ModelResponse {
    /**
     * Unique model configuration identifier
     */
    id: string;

    /**
     * Provider identifier
     */
    provider: string;

    /**
     * Model name/identifier
     */
    modelName: string;

    /**
     * Type of model: llm, stt, or tts
     */
    modelType: ModelType;

    /**
     * Optional vault key reference
     */
    vaultKeyId: string | null;

    /**
     * Custom configuration object
     * Sensitive data (like api_key) should be filtered out
     */
    configuration: Record<string, unknown>;

    /**
     * Configuration version number
     */
    version: number;

    /**
     * Creation timestamp
     */
    createdAt: Date;

    /**
     * Last update timestamp
     */
    updatedAt: Date;

    constructor(data: {
        id: string;
        provider: string;
        modelName: string;
        modelType: ModelType;
        vaultKeyId: string | null;
        configuration: Record<string, unknown>;
        version: number;
        createdAt: Date;
        updatedAt: Date;
    }) {
        this.id = data.id;
        this.provider = data.provider;
        this.modelName = data.modelName;
        this.modelType = data.modelType;
        this.vaultKeyId = data.vaultKeyId;
        this.configuration = this.sanitizeConfiguration(data.configuration);
        this.version = data.version;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }

    /**
     * Sanitize configuration to remove sensitive data
     * 
     * @param config - Raw configuration object
     * @returns Sanitized configuration safe for client
     */
    private sanitizeConfiguration(config: Record<string, unknown>): Record<string, unknown> {
        const sanitized = { ...config };

        // Remove sensitive fields
        const sensitiveFields = ['api_key', 'apiKey', 'secret', 'password', 'token'];
        sensitiveFields.forEach(field => {
            if (field in sanitized) {
                delete sanitized[field];
            }
        });

        return sanitized;
    }
}
