/**
 * Vault Credential Routes Module
 *
 * Defines API endpoints for vault credential management.
 */

import { Router } from 'express'
import { VaultCredentialController } from '../controllers/vault-credential.controller.js'
import { validateBody, validateQuery } from '../middleware/validation.middleware.js'
import {
  CreateVaultCredentialRequest,
  UpdateVaultCredentialRequest,
  ListVaultCredentialsQuery,
} from '../request/vault-credential.request.js'

const vaultCredentialRouter = Router()
const vaultCredentialController = new VaultCredentialController()

/**
 * @route   POST /vault-credentials
 * @desc    Create a new vault credential
 * @access  Private
 */
vaultCredentialRouter.post(
  '/',
  validateBody(CreateVaultCredentialRequest),
  (req, res) => vaultCredentialController.createVaultCredential(req, res)
)

/**
 * @route   GET /vault-credentials
 * @desc    List all vault credentials with optional filtering
 * @access  Private
 */
vaultCredentialRouter.get(
  '/',
  validateQuery(ListVaultCredentialsQuery),
  (req, res) => vaultCredentialController.listVaultCredentials(req, res)
)

/**
 * @route   GET /vault-credentials/:id
 * @desc    Get a vault credential by ID
 * @access  Private
 */
vaultCredentialRouter.get('/:id', (req, res) =>
  vaultCredentialController.getVaultCredentialById(req, res)
)

/**
 * @route   GET /vault-credentials/by-name/:name
 * @desc    Get a vault credential by name
 * @access  Private
 */
vaultCredentialRouter.get('/by-name/:name', (req, res) =>
  vaultCredentialController.getVaultCredentialByName(req, res)
)

/**
 * @route   GET /vault-credentials/:name/api-key
 * @desc    Get API key by credential name
 * @access  Private
 */
vaultCredentialRouter.get('/:name/api-key', (req, res) =>
  vaultCredentialController.getApiKeyByName(req, res)
)

/**
 * @route   PATCH /vault-credentials/:id
 * @desc    Update a vault credential
 * @access  Private
 */
vaultCredentialRouter.patch(
  '/:id',
  validateBody(UpdateVaultCredentialRequest),
  (req, res) => vaultCredentialController.updateVaultCredential(req, res)
)

/**
 * @route   DELETE /vault-credentials/:id
 * @desc    Delete a vault credential
 * @access  Private
 */
vaultCredentialRouter.delete('/:id', (req, res) =>
  vaultCredentialController.deleteVaultCredential(req, res)
)

export default vaultCredentialRouter
