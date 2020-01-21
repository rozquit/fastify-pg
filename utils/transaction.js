const {log} = console;

const shouldAbort
	= client =>
	(err, done) =>
		err ? client.query('ROLLBACK', done) : !!err;

const commit
	= client =>
	(cb, done) =>
		(err, res) =>
			shouldAbort(client)(err, done)
				? cb(err)
				: client.query('COMMIT', err => {
					log('COMMIT;');
					done();
					err ? cb(err) : cb(null, res);
				});

const begin
	= client =>
	(fn, cb, done) =>
		client.query('BEGIN', err => {
			log('BEGIN;');
			if (shouldAbort(client)(err, done)) return cb(err);
			const promise = fn(client, commit(client)(cb, done));
			if (promise && typeof promise.then === 'function') {
				promise.then(
					res => commit(client)(cb, done)(null, res),
					err => commit(client)(cb, done)(err));
			}
		});

const transactionUtil
	= pool =>
	(fn, cb) =>
		pool.connect((err, client, done) =>
			err ? cb(err) : begin(client)(fn, cb, done));

const transaction
	= pool =>
	(fn, cb) =>
		cb && typeof cb === 'function'
			? transactionUtil(pool)(fn, cb)
			: transactionUtil(pool)(fn, (err, res) =>
				err
					? Promise.reject(err)
					: Promise.resolve(res));

export default transaction;