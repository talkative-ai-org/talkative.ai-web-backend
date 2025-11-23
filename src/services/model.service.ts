/**
 * Model Service
 * 
 * Business logic layer for model configuration management.
 * Handles CRUD operations and validation for LLM, STT, and TTS models.
 */

import { PrismaClient, Model as PrismaModel } from '@prisma/client';
import { CreateModelRequest, UpdateModelRequest, ListModelsQuery } from '../request/model.request.js';
import { ModelResponse } from '../response/model.response.js';
import { ModelType, ModelErrorCode } from '../enums/model.enum.js';
import type { ServiceResponse } from '../errors/service.error.js';

const prisma = new PrismaClient();

export class ModelService {
    /**
     * Create a new model configuration
     */
    async createModel(dto: CreateModelRequest): Promise<ModelResponse> {
        // Validate model type
        if (!Object.values(ModelType).includes(dto.modelType)) {
            throw new Error(`Invalid model type: ${dto.modelType}`);
        }

        // Validate vault key exists if provided
        if (dto.vaultKeyId) {
            const vaultKey = await prisma.vault.findUnique({
                where: { id: dto.vaultKeyId },
            });

            if (!vaultKey) {
                throw new Error(`Vault key with ID ${dto.vaultKeyId} not found`);
            }
        }

        // Check for existing model with same provider, name, and type
        const existing = await prisma.model.findFirst({
            where: {
                provider: dto.provider,
                modelName: dto.modelName,
                modelType: dto.modelType,
            },
        });

        if (existing) {
            throw new Error(
                `Model configuration already exists for ${dto.provider}/${dto.modelName} (${dto.modelType})`
            );
        }

        const model = await prisma.model.create({
            data: {
                provider: dto.provider,
                modelName: dto.modelName,
                modelType: dto.modelType,
                vaultKeyId: dto.vaultKeyId,
                configuration: dto.configuration,
            },
        });

        return new ModelResponse(this.mapPrismaModel(model));
    }

    /**
     * Get model by ID
     */
    async getModelById(id: string): Promise<ModelResponse> {
        const model = await prisma.model.findUnique({
            where: { id },
        });

        if (!model) {
            throw new Error(`Model with ID ${id} not found`);
        }

        return new ModelResponse(this.mapPrismaModel(model));
    }

    /**
     * List models with optional filtering
     */
    async listModels(options: ListModelsQuery = {}): Promise<ModelResponse[]> {
        const {
            modelType,
            provider,
            search,
            limit = 50,
            offset = 0,
        } = options;

        const where: any = {};

        if (modelType) {
            where.modelType = modelType;
        }

        if (provider) {
            where.provider = provider;
        }

        if (search) {
            where.OR = [
                { modelName: { contains: search, mode: 'insensitive' } },
                { provider: { contains: search, mode: 'insensitive' } },
            ];
        }

        const models = await prisma.model.findMany({
            where,
            take: limit,
            skip: offset,
            orderBy: { createdAt: 'desc' },
        });

        return models.map(model => new ModelResponse(this.mapPrismaModel(model)));
    }

    /**
     * Get models by type
     */
    async getModelsByType(type: ModelType): Promise<ModelResponse[]> {
        return this.listModels({ modelType: type });
    }

    /**
     * Update model configuration
     */
    async updateModel(id: string, dto: UpdateModelRequest): Promise<ModelResponse> {
        // Check if model exists
        const existing = await prisma.model.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new Error(`Model with ID ${id} not found`);
        }

        // Validate vault key if being updated
        if (dto.vaultKeyId !== undefined && dto.vaultKeyId !== null) {
            const vaultKey = await prisma.vault.findUnique({
                where: { id: dto.vaultKeyId },
            });

            if (!vaultKey) {
                throw new Error(`Vault key with ID ${dto.vaultKeyId} not found`);
            }
        }

        const model = await prisma.model.update({
            where: { id },
            data: {
                ...(dto.provider && { provider: dto.provider }),
                ...(dto.modelName && { modelName: dto.modelName }),
                ...(dto.vaultKeyId !== undefined && { vaultKeyId: dto.vaultKeyId }),
                ...(dto.configuration && { configuration: dto.configuration }),
                version: { increment: 1 },
            },
        });

        return new ModelResponse(this.mapPrismaModel(model));
    }

    /**
     * Delete model configuration
     */
    async deleteModel(id: string): Promise<void> {
        const existing = await prisma.model.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new Error(`Model with ID ${id} not found`);
        }

        await prisma.model.delete({
            where: { id },
        });
    }

    /**
     * Map Prisma model to response format
     */
    private mapPrismaModel(model: PrismaModel): {
        id: string;
        provider: string;
        modelName: string;
        modelType: ModelType;
        vaultKeyId: string | null;
        configuration: Record<string, unknown>;
        version: number;
        createdAt: Date;
        updatedAt: Date;
    } {
        return {
            id: model.id,
            provider: model.provider,
            modelName: model.modelName,
            modelType: model.modelType as ModelType,
            vaultKeyId: model.vaultKeyId,
            configuration: model.configuration as Record<string, unknown>,
            version: model.version,
            createdAt: model.createdAt,
            updatedAt: model.updatedAt,
        };
    }
}
