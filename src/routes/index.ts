/**
 * Main Router
 *
 * Aggregates all route modules with API versioning.
 */

import { Router } from 'express'
import vaultCredentialRouter from './vault-credential.routes.js'
import vaultLockerRouter from './vault-locker.routes.js'

// Create API router with versioning
const apiRouter = Router()

/**
 * API Version 1 Routes
 */
const v1Router = Router()

// Register module routes
v1Router.use('/vault-lockers', vaultLockerRouter)
v1Router.use('/vault-credentials', vaultCredentialRouter)

// Mount versioned routes
apiRouter.use('/v1', v1Router)

/**
 * Health check endpoint (unversioned)
 */
apiRouter.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  })
})

export default apiRouter
