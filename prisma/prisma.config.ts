/**
 * Prisma Configuration
 *
 * Configuration for Prisma 7.x+ with connection management.
 */

import 'dotenv/config'

export default {
  adapter: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL,
  },
}
