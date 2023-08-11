import { readFileSync, readdirSync } from 'fs'
import type { Migration } from './migration'

export const readMigrationFiles = (path: string): string[] => {
  const sqlFiles = readdirSync(path, { withFileTypes: true })
    .filter((file) => file.isFile() && file.name.endsWith('.sql'))
    .map((sqlFile) => `${path}/${sqlFile.name}`)
    .sort()

  return sqlFiles
}

export const getMigrations = (path: string): Migration[] => {
  const migrationFilesPaths = readMigrationFiles(path)

  const migrations: Migration[] = []

  for (let i = 0; i < migrationFilesPaths.length; i++) {
    const filePath = migrationFilesPaths[i]
    const fileContent = readFileSync(filePath, { encoding: 'utf8' })

    const up = parseSqlContent(fileContent)

    const migration: Migration = {
      up,
      down: '',
      version: i + 1,
    }
    migrations.push(migration)
  }

  return migrations
}

/**
 * A single .sql file can contain multiple sql statements
 * splitted by an empty line
 */
export const parseSqlContent = (content: string): string[] => {
  const parts = content
    .split(/\n\n/gm)
    .map((v) => v.trim())
    .filter((v) => v.length > 0)
  return parts
}
