import type { Database } from 'bun:sqlite'

export type Migration = {
  version: number
  up: string[]
  down: string
}

export const migrate = (
  db: Database,
  migrations: Migration[],
  targetVersion: number = getMaximumVersion(migrations),
): void => {
  const maxVersion = getMaximumVersion(migrations)

  const migrate = db.transaction(
    (targetVersion: number, maxVersion: number) => {
      const currentVersion = getDatabaseVersion(db)
      if (maxVersion < currentVersion) {
        return true
      } else {
        if (currentVersion === targetVersion) {
          return true
        } else if (currentVersion < targetVersion) {
          upgrade()
          return false
        } else {
          downgrade()
          return false
        }
      }
    },
  )

  while (true) {
    // @ts-expect-error
    const done: boolean = migrate.immediate(targetVersion, maxVersion)
    if (done) break
  }

  function upgrade() {
    const currentVersion = getDatabaseVersion(db)
    const targetVersion = currentVersion + 1

    const migration = migrations.find((x) => x.version === targetVersion)
    if (!migration) {
      throw new Error(`Cannot find migration for version ${targetVersion}`)
    }

    try {
      for (const up of migration.up) {
        db.run(up)
      }
    } catch (error: unknown) {
      console.error(
        `Upgrade from version ${currentVersion} to version ${targetVersion} failed.`,
      )
      throw error
    }
    setDatabaseVersion(db, targetVersion)
  }

  function downgrade() {
    const currentVersion = getDatabaseVersion(db)
    const targetVersion = currentVersion - 1

    const migration = migrations.find((x) => x.version === currentVersion)
    if (!migration) {
      throw new Error(`Cannot find migration for version ${targetVersion}`)
    }

    try {
      db.exec(migration.down)
    } catch (e) {
      console.error(
        `Downgrade from version ${currentVersion} to version ${targetVersion} failed.`,
      )
      throw e
    }
    setDatabaseVersion(db, targetVersion)
  }
}

export const getMaximumVersion = (migrations: Migration[]): number => {
  return migrations.reduce((max, cur) => Math.max(cur.version, max), 0)
}

export const getDatabaseVersion = (db: Database): number => {
  const result = db.prepare('PRAGMA user_version;').get()
  if (typeof (result as any)?.user_version === 'number') {
    return (result as any)?.user_version as number
  }
  throw new Error(`Unexpected result when getting user_version: "${result}".`)
}

export const setDatabaseVersion = (db: Database, version: number): void => {
  db.exec(`PRAGMA user_version = ${version}`)
}
