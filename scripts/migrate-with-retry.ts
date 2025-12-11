#!/usr/bin/env tsx
import { spawn } from 'child_process'

const MAX_RETRIES = 5
const INITIAL_DELAY = 1000 // 1 second

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function runMigration(attempt: number): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`\nAttempt ${attempt}/${MAX_RETRIES}: Running migrations...`)

    const child = spawn('npm', ['run', 'db:migrate:deploy'], {
      stdio: 'inherit',
      shell: true,
    })

    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Migration failed with exit code ${code}`))
      }
    })

    child.on('error', (error) => {
      reject(error)
    })
  })
}

async function main() {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await runMigration(attempt)
      console.log('\n✓ Migrations completed successfully')
      process.exit(0)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)

      if (attempt < MAX_RETRIES) {
        const delay = INITIAL_DELAY * Math.pow(2, attempt - 1)
        console.log(`\n✗ Migration failed: ${errorMessage}`)
        console.log(`Retrying in ${delay}ms...`)
        await sleep(delay)
      } else {
        console.error(`\n✗ Migration failed after ${MAX_RETRIES} attempts`)
        console.error(errorMessage)
        process.exit(1)
      }
    }
  }
}

void main()
