```
   ___                 __           ___                                       
 /'___\               /\ \__  __  /'___\                                      
/\ \__/   __      ____\ \ ,_\/\_\/\ \__/  __  __           _____      __      
\ \ ,__\/'__`\   /',__\\ \ \/\/\ \ \ ,__\/\ \/\ \  _______/\ '__`\  /'_ `\    
 \ \ \_/\ \L\.\_/\__, `\\ \ \_\ \ \ \ \_/\ \ \_\ \/\______\ \ \L\ \/\ \L\ \   
  \ \_\\ \__/.\_\/\____/ \ \__\\ \_\ \_\  \/`____ \/______/\ \ ,__/\ \____ \  
   \/_/ \/__/\/_/\/___/   \/__/ \/_/\/_/   `/___/> \        \ \ \/  \/___L\ \ 
                                              /\___/         \ \_\    /\____/ 
                                              \/__/           \/_/    \_/__/  
```
# fastify-pg
Fastify PostgreSQL plugin inspired by [fastify-postgres](https://github.com/fastify/fastify-postgres) and [typeorm](https://github.com/typeorm/typeorm).

Dependencies: 
 - [esm](https://github.com/standard-things/esm)
 - [folktale](https://github.com/origamitower/folktale)
 - [pg](https://github.com/brianc/node-postgres)
 - [fastify-plugin](https://github.com/fastify/fastify-plugin)
 - [fastify](https://github.com/fastify/fastify)

## Install

```
npm i esm folktale pg fastify-plugin fastify --save
```

```
npm i fastify-pg --save
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
  Client, // client constructor for a single query
  QueryBuilder, // query builder
  pool, // pool instance
  connect, // function to get a connection from the pool
  query, // utility to perform a query WITHOUT a transaction
  transaction, // utility to perform multiple queries WITH a transaction
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
  .getMany();
```

```
SELECT * FROM table_name WHERE column_1 = '1' AND column_2 = 2 OR column_4 = false;
```

### .innerJoin(tableName, expression)

```js
await QueryBuilder
  .of(fastify.pg)
  .select(['users.*', 'photos.*'])
  .from('users')
  .innerJoin('photos', 'photos.user = users.id')
  .andWhere('photos.isRemoved = :isRemoved', {isRemoved: false})
  .where('users.name = :username', {username: `'arttolstykh'`})
  .getOne();
```

```
SELECT users.*, photos.* FROM users INNER JOIN photos ON photos.user = users.id AND photos.isRemoved = false WHERE users.name = 'arttolstykh';
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
        = await QueryBuilder
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