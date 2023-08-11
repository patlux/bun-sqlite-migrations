import { test, expect } from 'bun:test'
import { parseSqlContent } from './migrator'

test('Should parse sql file', () => {
  const sqlFileContent = `
-- Erstelle eine temporäre Tabelle mit der neuen Spalte
CREATE TABLE "Log_temp" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%S.%sZ', 'now')),
    "message" TEXT NOT NULL
);

-- Kopiere die Daten aus der alten Tabelle in die temporäre Tabelle
INSERT INTO "Log_temp" ("createdAt", "message")
SELECT "createdAt", "message"
FROM "Log";



-- Lösche die alte Tabelle
DROP TABLE "Log";

-- Benenne die temporäre Tabelle in den ursprünglichen Tabellennamen um
ALTER TABLE "Log_temp" RENAME TO "Log";
`

  const sqls = parseSqlContent(sqlFileContent)
  expect(sqls).toHaveLength(4)

  expect(sqls[0]).toBe(`-- Erstelle eine temporäre Tabelle mit der neuen Spalte
CREATE TABLE "Log_temp" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%S.%sZ', 'now')),
    "message" TEXT NOT NULL
);`)

  expect(sqls[1])
    .toBe(`-- Kopiere die Daten aus der alten Tabelle in die temporäre Tabelle
INSERT INTO "Log_temp" ("createdAt", "message")
SELECT "createdAt", "message"
FROM "Log";`)

  expect(sqls[2]).toBe(`-- Lösche die alte Tabelle
DROP TABLE "Log";`)

  expect(sqls[3])
    .toBe(`-- Benenne die temporäre Tabelle in den ursprünglichen Tabellennamen um
ALTER TABLE "Log_temp" RENAME TO "Log";`)
})
