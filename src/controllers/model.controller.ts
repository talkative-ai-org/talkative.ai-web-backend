/**
 * Model Controller
 * 
 * HTTP request handlers for model configuration endpoints.
 */

import { Request, Response } from 'express';
import { ModelService } from '../services/model.service.js';
import { CreateModelRequest, UpdateModelRequest, ListModelsQuery } from '../request/model.request.js';
import { ModelType } from '../enums/model.enum.js';
import { ApiResponse } from '../response/api.response.js';

export class ModelController {
    private modelService: ModelService;

    constructor() {
        this.modelService = new ModelService();
    }

    /**
     * Create a new model configuration
     * 
     * @route POST /api/v1/models
     */
    async createModel(req: Request, res: Response): Promise<void> {
        try {
            const dto: CreateModelRequest = req.body;
            const model = await this.modelService.createModel(dto);

            res.status(201).json(ApiResponse.success(model));
        } catch (error: any) {
            res.status(error.status || 500).json(
                ApiResponse.error(error.code || 'INTERNAL_ERROR', error.message, error.details)
            );
        }
    }

    /**
     * Get model by ID
     * 
     * @route GET /api/v1/models/:id
     */
    async getModelById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const model = await this.modelService.getModelById(id);

            res.status(200).json(ApiResponse.success(model));
        } catch (error: any) {
            res.status(error.status || 500).json(
                ApiResponse.error(error.code || 'INTERNAL_ERROR', error.message, error.details)
            );
        }
    }

    /**
     * List models with optional filtering
     * 
     * @route GET /api/v1/models
     */
    async listModels(req: Request, res: Response): Promise<void> {
        try {
            const query: ListModelsQuery = {
                modelType: req.query.modelType as ModelType | undefined,
                provider: req.query.provider as string | undefined,
                search: req.query.search as string | undefined,
                limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
                offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
            };

            const models = await this.modelService.listModels(query);

            res.status(200).json(ApiResponse.success(models));
        } catch (error: any) {
            res.status(error.status || 500).json(
                ApiResponse.error(error.code || 'INTERNAL_ERROR', error.message, error.details)
            );
        }
    }

    /**
     * Get models by type
     * 
     * @route GET /api/v1/models/type/:type
     */
    async getModelsByType(req: Request, res: Response): Promise<void> {
        try {
            const { type } = req.params;

            if (!Object.values(ModelType).includes(type as ModelType)) {
                res.status(400).json(
                    ApiResponse.error('VALIDATION_ERROR', `Invalid model type: ${type}`)
                );
                return;
            }

            const models = await this.modelService.getModelsByType(type as ModelType);

            res.status(200).json(ApiResponse.success(models));
        } catch (error: any) {
            res.status(error.status || 500).json(
                ApiResponse.error(error.code || 'INTERNAL_ERROR', error.message, error.details)
            );
        }
    }

    /**
     * Update model configuration
     * 
     * @route PATCH /api/v1/models/:id
     */
    async updateModel(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const dto: UpdateModelRequest = req.body;

            const model = await this.modelService.updateModel(id, dto);

            res.status(200).json(ApiResponse.success(model));
        } catch (error: any) {
            res.status(error.status || 500).json(
                ApiResponse.error(error.code || 'INTERNAL_ERROR', error.message, error.details)
            );
        }
    }

    /**
     * Delete model configuration
     * 
     * @route DELETE /api/v1/models/:id
     */
    async deleteModel(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            await this.modelService.deleteModel(id);

            res.status(204).send();
        } catch (error: any) {
            res.status(error.status || 500).json(
                ApiResponse.error(error.code || 'INTERNAL_ERROR', error.message, error.details)
            );
        }
    }
}
