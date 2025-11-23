/**
 * Model Routes
 * 
 * API routes for model configuration management.
 */

import { Router } from 'express';
import { ModelController } from '../controllers/model.controller.js';

const modelRouter = Router();
const modelController = new ModelController();

/**
 * @route   POST /api/v1/models
 * @desc    Create a new model configuration
 * @access  Private
 */
modelRouter.post(
    '/',
    (req, res) => modelController.createModel(req, res)
);

/**
 * @route   GET /api/v1/models
 * @desc    List all models with optional filtering
 * @access  Private
 */
modelRouter.get(
    '/',
    (req, res) => modelController.listModels(req, res)
);

/**
 * @route   GET /api/v1/models/type/:type
 * @desc    Get models by type (llm, stt, tts)
 * @access  Private
 */
modelRouter.get(
    '/type/:type',
    (req, res) => modelController.getModelsByType(req, res)
);

/**
 * @route   GET /api/v1/models/:id
 * @desc    Get model by ID
 * @access  Private
 */
modelRouter.get(
    '/:id',
    (req, res) => modelController.getModelById(req, res)
);

/**
 * @route   PATCH /api/v1/models/:id
 * @desc    Update model configuration
 * @access  Private
 */
modelRouter.patch(
    '/:id',
    (req, res) => modelController.updateModel(req, res)
);

/**
 * @route   DELETE /api/v1/models/:id
 * @desc    Delete model configuration
 * @access  Private
 */
modelRouter.delete(
    '/:id',
    (req, res) => modelController.deleteModel(req, res)
);

export default modelRouter;
