class QueryBuilder {
  constructor (pool, values) {
    this.query = ''
    this.isTransaction = !!values
    this.pool = pool
    this.valuesArray = values || []
    this.res = []
  }

  static of (pool, values) {
    return new QueryBuilder(pool, values)
  };

  toPairs (obj) {
    return Object.keys(obj).map(k => [k, obj[k]])
  }

  getValues (obj) {
    return Object.keys(obj).map(k => obj[k])
  }

  createColumnsExpression (values) {
    return ` (${values.join(', ')})`
  }

  createValuesExpression (values) {
    return ` VALUES ${values.map(valuesArray =>
      `(${valuesArray.map(value =>
        value).join(', ')})`).join(', ')}`
  }

  with (obj) {
    const pairs = this.toPairs(obj)
    this.query +=
      `WITH${pairs.map(([key, value]) =>
        ` ${key} AS (${value})`)}`
    return this
  }

  withRecursive (obj1, obj2) {
    const values = this.getValues(obj2)
    this.query +=
      `WITH RECURSIVE ${this.toPairs(obj1).map(([key, values]) =>
        `${key}(${values.join(', ')})`)} AS (${values[0]} UNION ALL ${values[1]})`
    return this
  }

  insert () {
    this.query = 'INSERT '
    return this
  };

  table (tableName) {
    this.query += `TABLE ${tableName}`
    return this
  }

  select (elements) {
    this.query +=
      `${this.query.includes('WITH')
        ? ` SELECT ${elements.join(', ')}`
        : `SELECT ${elements.join(', ')}`}`
    return this
  };

  update (tableName) {
    this.query += `UPDATE ${tableName || ''}`
    return this
  };

  delete () {
    this.query += 'DELETE'
    return this
  };

  into (tableName) {
    this.query += `INTO ${tableName}`
    return this
  }

  from (tableName) {
    this.query += ` FROM ${tableName}`
    return this
  }

  innerJoin (tableName, expression) {
    this.query += ` INNER JOIN ${tableName} ON ${expression}`
    return this
  }

  set (obj) {
    this.query +=
      ` SET ${this.toPairs(obj).map(([key, value]) =>
        `${key} = ${value}`).join(', ')}`
    return this
  }

  where (condition, obj) {
    const pairs = this.toPairs(obj)
    this.query +=
      ` WHERE ${pairs.map(([key, value]) =>
        `${condition.replace(`:${key}`, value)}`)}`
    return this
  }

  andWhere (condition, obj) {
    const pairs = this.toPairs(obj)
    this.query +=
      ` AND ${pairs.map(([key, value]) =>
        `${condition.replace(`:${key}`, value)}`)}`
    return this
  }

  orWhere (condition, obj) {
    const pairs = this.toPairs(obj)
    this.query +=
      ` OR ${pairs.map(([key, value]) =>
        `${condition.replace(`:${key}`, value)}`)}`
    return this
  }

  columns (elements) {
    this.query += this.createColumnsExpression(elements)
    return this
  }

  values (elements) {
    this.query += this.createValuesExpression(elements)
    return this
  }

  defaultValues () {
    this.query += ' DEFAULT VALUES'
    return this
  }

  limit (number) {
    this.query += ` LIMIT ${number}`
    return this
  }

  offset (number) {
    this.query += ` OFFSET ${number}`
    return this
  }

  groupBy (elements) {
    this.query +=
      ` GROUP BY ${elements.join(', ')}`
    return this
  }

  orderBy (expression) {
    this.query +=
      ` ORDER BY ${expression}`
    return this
  }

  onConflict (expression) {
    this.query +=
      ` ON CONFLICT ${expression}`
    return this
  }

  returning (elements) {
    this.query += ` RETURNING ${elements.join(', ')}`
    return this
  }

  getQuery () {
    return this.query.trim()
  };

  async execute () {
    return this.isTransaction
      ? await this.pool.query(this.query, this.valuesArray)
      : await this.pool.query(this.query += ';')
  }

  async getOne () {
    const res = await this.execute()
    return res.rows[0]
  }

  async getMany (pluck = null) {
    const res = await this.execute()
    return pluck ? res.rows.map(value => value[pluck]) : res.rows
  }
}

module.exports = QueryBuilder
