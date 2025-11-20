#!/usr/bin/env node

/**
 * Main Application Entry Point
 *
 * Initializes Express server with middleware and routes.
 */

import 'dotenv/config'
import express, { type Application } from 'express'
import cors from 'cors'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { Config } from './config/config.js'
import apiRouter from './routes/index.js'
import { disconnectPrisma } from './lib/database/prisma-client.js'

const nodePath = resolve(process.argv[1])
const modulePath = resolve(fileURLToPath(import.meta.url))
const isCLI = nodePath === modulePath

/**
 * Creates and configures the Express application
 */
function createApp(): Application {
  const app = express()

  // Middleware
  app.use(cors(Config.cors))
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))

  // Request logging middleware
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
    next()
  })

  // Register API routes
  app.use('/api', apiRouter)

  // Root endpoint
  app.get('/', (_req, res) => {
    res.json({
      message: 'Talkative.AI Backend API',
      version: '1.0.0',
      status: 'running',
    })
  })

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'The requested resource was not found',
      },
    })
  })

  // Error handler
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled error:', err)
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      },
    })
  })

  return app
}

/**
 * Starts the HTTP server
 */
export default function main(port: number = Config.port) {
  const app = createApp()

  if (isCLI) {
    const server = app.listen(port, () => {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║         Talkative.AI Backend Server                   ║
║                                                       ║
║  Status:   Running                                    ║
║  Port:     ${port.toString().padEnd(42)}║
║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(38)}║
║                                                       ║
║  API Base: http://localhost:${port}/api               ${port.toString().length === 4 ? ' ' : '  '}║
║  Health:   http://localhost:${port}/api/health        ${port.toString().length === 4 ? ' ' : '  '}║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
      `)
    })

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`)

      server.close(async () => {
        console.log('HTTP server closed')

        // Disconnect Prisma
        await disconnectPrisma()
        console.log('Database connections closed')

        process.exit(0)
      })

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('Forced shutdown after timeout')
        process.exit(1)
      }, 10000)
    }

    process.on('SIGTERM', () => shutdown('SIGTERM'))
    process.on('SIGINT', () => shutdown('SIGINT'))

    return server
  }

  return app
}

if (isCLI) {
  main()
}
