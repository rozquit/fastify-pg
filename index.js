const { Pool, Client } = require('pg')
const fp = require('fastify-plugin')
const { QueryBuilder, transaction } = require('./utils')

const fastifyPg = (fastify, options, done) => {
  try {
    const name = options.name || 'pg'

    const pool = new Pool(options)

    const pg = {
      Client,
      pool,
      connect: pool.connect.bind(pool),
      query: pool.query.bind(pool),
      transaction: transaction(pool),
      QueryBuilder
    }

    fastify
      .addHook('onClose', (context, done) => pool.end(done))
      .decorate(name, pg)

    done()
  } catch (err) {
    done(err)
  }
}

module.exports = fp(fastifyPg, { fastify: '>=3.0.0', name: 'pg' })
