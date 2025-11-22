/**
 * Vault Locker Routes Module
 *
 * Defines API endpoints for vault locker management.
 */

import { Router } from 'express'
import { VaultLockerController } from '../controllers/vault-locker.controller.js'
import { VaultCredentialController } from '../controllers/vault-credential.controller.js'
import { validateBody, validateQuery } from '../middleware/validation.middleware.js'
import {
  CreateVaultLockerRequest,
  UpdateVaultLockerRequest,
  ListVaultLockersQuery,
} from '../request/vault-locker.request.js'

const vaultLockerRouter = Router()
const vaultLockerController = new VaultLockerController()
const vaultCredentialController = new VaultCredentialController()

/**
 * @route   POST /vault-lockers
 * @desc    Create a new vault locker
 * @access  Private
 */
vaultLockerRouter.post(
  '/',
  validateBody(CreateVaultLockerRequest),
  (req, res) => vaultLockerController.createVaultLocker(req, res)
)

/**
 * @route   GET /vault-lockers
 * @desc    List all vault lockers with optional filtering
 * @access  Private
 */
vaultLockerRouter.get(
  '/',
  validateQuery(ListVaultLockersQuery),
  (req, res) => vaultLockerController.listVaultLockers(req, res)
)

/**
 * @route   GET /vault-lockers/:id
 * @desc    Get a vault locker by ID
 * @query   includeVaults - Include nested vault credentials (true/false)
 * @access  Private
 */
vaultLockerRouter.get('/:id', (req, res) =>
  vaultLockerController.getVaultLockerById(req, res)
)

/**
 * @route   GET /vault-lockers/by-name/:name
 * @desc    Get a vault locker by name
 * @query   includeVaults - Include nested vault credentials (true/false)
 * @access  Private
 */
vaultLockerRouter.get('/by-name/:name', (req, res) =>
  vaultLockerController.getVaultLockerByName(req, res)
)

/**
 * @route   GET /vault-lockers/:id/vaults
 * @desc    Get all vaults within a specific locker
 * @access  Private
 */
vaultLockerRouter.get('/:id/vaults', (req, res) =>
  vaultLockerController.getVaultsInLocker(req, res)
)

/**
 * @route   GET /vault-lockers/:lockerId/credentials
 * @desc    Get all credentials within a specific locker
 * @access  Private
 */
vaultLockerRouter.get('/:lockerId/credentials', (req, res) =>
  vaultCredentialController.getVaultCredentialsByLockerId(req, res)
)

/**
 * @route   PATCH /vault-lockers/:id
 * @desc    Update a vault locker
 * @access  Private
 */
vaultLockerRouter.patch(
  '/:id',
  validateBody(UpdateVaultLockerRequest),
  (req, res) => vaultLockerController.updateVaultLocker(req, res)
)

/**
 * @route   DELETE /vault-lockers/:id
 * @desc    Delete a vault locker
 * @query   force - Force delete even if locker contains vaults (true/false)
 * @access  Private
 */
vaultLockerRouter.delete('/:id', (req, res) =>
  vaultLockerController.deleteVaultLocker(req, res)
)

export default vaultLockerRouter
