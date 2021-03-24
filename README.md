```
      ##          ##
        ##      ##
      ##############
    ####  ######  ####
  ######################
  ##  ##############  ##
  ##  ##          ##  ##
        ####  ####
```

# fastify-pg 

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Fastify PostgreSQL plugin inspired by [fastify-postgres](https://github.com/fastify/fastify-postgres) and [typeorm](https://github.com/typeorm/typeorm).

Dependencies:
 - [fastify](https://github.com/fastify/fastify)
 - [fastify-plugin](https://github.com/fastify/fastify-plugin)
 - [pg](https://github.com/brianc/node-postgres)

# Install

```
npm i fastify fastify-plugin fastify-pg pg --save
```

# Usage

```js
const pg = require('fastify-pg')
```

or

```js
import pg from 'fastify-pg'
```

Register plugin

```js
fastify.register(pg, options)
```

This plugin will add the `pg` namespace in your Fastify instance, with the following properties:

```js
const {
  Client, // client constructor for a single query
  pool, // pool instance
  connect, // function to get a connection from the pool
  query, // utility to perform a query WITHOUT a transaction
  transaction, // utility to perform multiple queries WITH a transaction
  QueryBuilder // query builder
} = fastify.pg
```

For examples, please see the [fastify-postgres](https://github.com/fastify/fastify-postgres/blob/master/README.md) and [node-postgres](https://node-postgres.com/) documentation.

# QueryBuilder

```js
const { QueryBuilder, transaction } = fastify.pg
```

## .table(tableName)

```js
await QueryBuilder
  .of(fastify.pg)
  .table('users')
  .execute()
```

```
TABLE users;
```

## .insert()

```js
await QueryBuilder
  .of(fastify.pg)
  .insert()
  .into('users')
  .defaultValues()
  .returning(['*'])
  .execute()
```

```
INSERT INTO users DEFAULT VALUES RETURNING *;
```

## .select(elements)

```js
await QueryBuilder
  .of(fastify.pg)
  .select(['*'])
  .from('users')
  .where('users.id = :id', {id: 1})
  .andWhere('users.is_active = :is_active', {is_active: true})
  .orWhere('users.deleted = :deleted', {deleted: false})
  .getMany()
```

```
SELECT * FROM users WHERE users.id = 1 AND users.is_active = true OR users.deleted = false;
```

```js
await QueryBuilder
  .of(fastify.pg)
  .insert()
  .into('users')
  .columns(['first_name', 'last_name'])
  .values([[`'Artem'`, `'Tolstykh'`], [`'Maksym'`, `'Bezruchko'`]])
  .returning(['*'])
  .execute()
```

```
INSERT INTO users (first_name, last_name) VALUES ('Artem', 'Tolstykh'), ('Maksym', 'Bezruchko') RETURNING *;
```

## .update(tableName)

```js
await QueryBuilder
  .of(fastify.pg)
  .update('users')
  .set({first_name: `'Artem'`, last_name: `'Tolstykh'`})
  .where('id = :id', {id: 1})
  .execute()
```

```
UPDATE users SET first_name = 'Artem', last_name = 'Tolstykh' WHERE id = 1;
```

## .delete()

```js
await QueryBuilder
  .of(fastify.pg)
  .delete()
  .from('users')
  .execute()
```

```
DELETE FROM users;
```

```js
await QueryBuilder
  .of(fastify.pg)
  .delete()
  .from('users')
  .where('id = :id', {id: 1})
  .returning(['*'])
  .execute()
```

```
DELETE FROM users WHERE id = 1 RETURNING *;
```

## .innerJoin(tableName, expression)

```js
await QueryBuilder
  .of(fastify.pg)
  .select(['users.*', 'photos.*'])
  .from('users')
  .innerJoin('photos', 'photos.user = users.id')
  .andWhere('photos.isRemoved = :isRemoved', {isRemoved: false})
  .where('users.name = :username', {username: `'arttolstykh'`})
  .getOne()
```

```
SELECT users.*, photos.* FROM users INNER JOIN photos ON photos.user = users.id AND photos.isRemoved = false WHERE users.name = 'arttolstykh';
```

## transaction

```js
transaction(async client => {
    const id 
        = await QueryBuilder
        .of(client, ['arttolstykh'])
        .insert()
        .into('users')
        .columns(['username'])
        .values([['$1']])
        .returning(['id'])
        .execute()
    // etc
    return id
})
```

```
BEGIN;
INSERT INTO users (username) VALUES ('arttolstykh') RETURNING id;
-- etc
COMMIT;
```

## QueryBuilder API

- **of**
- **with**
- **withRecursive**
- **insert**
- **table**
- **select**
- **update**
- **delete**
- **into**
- **from**
- **innerJoin**
- **set**
- **where**
- **andWhere**
- **orWhere**
- **columns**
- **values**
- **defaultValues**
- **limit**
- **offset**
- **groupBy**
- **orderBy**
- **onConflict**
- **returning**
- **getQuery**
- **execute**
- **getOne**
- **getMany**

# License

Licensed under [MIT](./LICENSE).
