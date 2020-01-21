```
███████╗ █████╗ ███████╗████████╗██╗███████╗██╗   ██╗     ██████╗  ██████╗ 
██╔════╝██╔══██╗██╔════╝╚══██╔══╝██║██╔════╝╚██╗ ██╔╝     ██╔══██╗██╔════╝ 
█████╗  ███████║███████╗   ██║   ██║█████╗   ╚████╔╝█████╗██████╔╝██║  ███╗
██╔══╝  ██╔══██║╚════██║   ██║   ██║██╔══╝    ╚██╔╝ ╚════╝██╔═══╝ ██║   ██║
██║     ██║  ██║███████║   ██║   ██║██║        ██║        ██║     ╚██████╔╝
╚═╝     ╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝╚═╝        ╚═╝        ╚═╝      ╚═════╝  
```
# fastify-pg
[Fastify](https://github.com/fastify/fastify) PostgreSQL plugin inspired by [fastify-postgres](https://github.com/fastify/fastify-postgres) and [typeorm](https://github.com/typeorm/typeorm).

Dependencies: 
 - [esm](https://github.com/standard-things/esm)
 - [folktale](https://github.com/origamitower/folktale)
 - [pg](https://github.com/brianc/node-postgres)

## Install

```
npm i esm folktale pg fastify fastify-plugin fastify-pg --save
```

## Usage
```js
import pg from 'fastify-pg';
```

```js
fastify.register(pg, options);
```

This plugin will add the `pg` namespace in your Fastify instance, with the following properties:

```js
const {
  Client, // a client constructor for a single query
  QueryBuilder, // query builder
  pool, // the pool instance
  connect, // the function to get a connection from the pool
  query, // a utility to perform a query WITHOUT a transaction
  transaction, // a utility to perform multiple queries WITH a transaction
} = fastify.pg;
```

For examples, please see the [fastify-postgres](https://github.com/fastify/fastify-postgres/blob/master/README.md) and [node-postgres](https://node-postgres.com/) documentation.

## QueryBuilder

```js
const {QueryBuilder, transaction} = fastify.pg;
```

## .table(tableName)

```js
await QueryBuilder
  .of(fastify.pg)
  .table('table_name')
  .execute();
```

```
TABLE table_name;
```

## .select(elements)

```js
await QueryBuilder
  .of(fastify.pg)
  .select(['*'])
  .from('table_name')
  .where('column_1 = :column_1', {column_1: `'1'`})
  .andWhere('column_2 = :column_2', {column_2: 2})
  .orWhere('column_4 = :column_4', {column_4: false})
  .getMany(); // .getOne();
```

```
SELECT * FROM table_name WHERE column_1 = '1' AND column_2 = 2 OR column_4 = false;
```

## .insert()

```js
await QueryBuilder
  .of(fastify.pg)
  .insert()
  .into('table_name')
  .defaultValues()
  .returning(['*'])
  .execute();
```

```
INSERT INTO table_name DEFAULT VALUES RETURNING *;
```

```js
await QueryBuilder
  .of(fastify.pg)
  .insert()
  .into('table_name')
  .columns(['column_1', 'column_2'])
  .values([[`'1'`, `'2'`], [`'1'`, `'3'`]])
  .returning(['*'])
  .execute();
```

```
INSERT INTO table_name (column_1, column_2) VALUES ('1', '2'), ('1', '3') RETURNING *;
```

## .update(tableName)

```js
await QueryBuilder
  .of(fastify.pg)
  .update('table_name')
  .set({column_1: `'1'`, column_2: 2})
  .where('column_3 = :column_3', {column_3: false})
  .andWhere('column_5 = :column_5', {column_5: 5})
  .orWhere('column_6 = :column_6', {column_6: true})
  .execute();
```

```
UPDATE table_name SET column_1 = '1', column_2 = 2 WHERE column_3 = false AND column_5 = 5 OR column_6 = true;
```

## .delete()

```js
await QueryBuilder
  .of(fastify.pg)
  .delete()
  .from('table_name')
  .execute();
```

```
DELETE FROM table_name;
```

```js
await QueryBuilder
  .of(fastify.pg)
  .delete()
  .from('table_name')
  .where('column_1 = :column_1', {column_1: `'1'`})
  .andWhere('column_2 = :column_2', {column_2: 2})
  .orWhere('column_3 = :column_3', {column_3: true})
  .returning(['*'])
  .execute();
```

```
DELETE FROM table_name WHERE column_1 = '1' AND column_2 = 2 OR column_3 = true RETURNING *;
```

## transaction

```js
transaction(async client => {
    const id 
        = await QuryBulder
        .of(client, ['arttolstykh'])
        .insert()
        .into('table_name')
        .columns(['username'])
        .values([['$1']])
        .returning(['id'])
        .execute();
    // etc
    return id;
})
```

```
BEGIN;
INSERT INTO table_name (username) VALUES ('arttolstykh') RETURNING id;
-- etc
COMMIT;
```

## License

Licensed under [MIT](./LICENSE).