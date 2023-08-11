# bun-sqlite-migrations

Simple function for migration management for [bun:sqlite](https://bun.sh/docs/api/sqlite)

## Getting started

```sh
bun add bun-sqlite-migrations
```

### Example

Add your `.sql` files into `./migrations`, e.g.:

- `0001_init.sql`
- `0002_add_users_table.sql`
- `0003_add_column_gender_to_users_table.sql`

> Only the sorting matters. The index of the last executed migration will be stored into the database.

```ts
import { migrate, getMigrations } from 'bun-sqlite-migrations'

const db = new Database(`data.db`)
migrate(db, getMigrations('./migrations'))
```

**Verify**:

```sh
sqlite3 data.db "PRAGMA user_version;"
# should return the number of migrations which were executed
3
```
