import {Pool, Client} from 'pg';
import fp from 'fastify-plugin';
import {QueryBuilder, transaction} from './utils'

const fastifyPg = (fastify, options, done) => {
	try {
		const name = options.name || 'pg';
		const pool = new Pool(options);
		const pg = {
			Client,
			QueryBuilder,
			pool,
			connect: pool.connect.bind(pool),
			query: pool.query.bind(pool),
			transaction: transaction(pool),
		};
		fastify.addHook('onClose', (context, done) => pool.end(done));
		fastify.decorate(name, pg);
		done();
	} catch (err) {
		done(err);
	}
};

export default fp(fastifyPg, {fastify: '>=2.0.0', name: 'pg'});