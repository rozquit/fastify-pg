import tap from 'tap';
import {QueryBuilder} from '../utils';

tap.equal(
	QueryBuilder
		.of()
		.with({
			regional_sales: QueryBuilder
				.of()
				.select(['region', 'SUM(amount) AS total_sales'])
				.from('orders')
				.groupBy(['region'])
				.getQuery(),
			top_regions: QueryBuilder
				.of()
				.select(['region'])
				.from('regional_sales')
				.where(
					'total_sales > (:value)',
					{value: QueryBuilder.of().select(['SUM(total_sales)/10']).from('regional_sales').getQuery()},
				)
				.getQuery(),
		})
		.select([
			'region',
			'product',
			'SUM(quantity) AS product_units',
			'SUM(amount) AS product_sales',
		])
		.from('orders')
		.where(
			'region IN (:value)',
			{value: QueryBuilder.of().select(['region']).from('top_regions').getQuery()},
		)
		.groupBy(['region', 'product'])
		.getQuery(),
	`WITH regional_sales AS (SELECT region, SUM(amount) AS total_sales FROM orders GROUP BY region), top_regions AS (SELECT region FROM regional_sales WHERE total_sales > (SELECT SUM(total_sales)/10 FROM regional_sales)) SELECT region, product, SUM(quantity) AS product_units, SUM(amount) AS product_sales FROM orders WHERE region IN (SELECT region FROM top_regions) GROUP BY region, product`,
);

tap.equal(
	QueryBuilder
		.of()
		.withRecursive(
			{t: ['n']},
			{
				left: QueryBuilder.of().values([[1]]).getQuery(),
				right: QueryBuilder.of().select(['n+1']).from('t').where('n < :n', {n: 100}).getQuery(),
			},
		)
		.select(['sum(n)'])
		.from('t')
		.limit(100)
		.getQuery(),
	`WITH RECURSIVE t(n) AS (VALUES (1) UNION ALL SELECT n+1 FROM t WHERE n < 100) SELECT sum(n) FROM t LIMIT 100`,
);

tap.equal(
	QueryBuilder
		.of()
		.table('users')
		.getQuery(),
	`TABLE users`,
);

tap.equal(
	QueryBuilder
		.of()
		.select(['*'])
		.from('users')
		.where('id = :id', {id: 1})
		.andWhere('is_active = :is_active', {is_active: true})
		.orWhere('deleted = :deleted', {deleted: false})
		.getQuery(),
	`SELECT * FROM users WHERE id = 1 AND is_active = true OR deleted = false`,
);

tap.equal(
	QueryBuilder
		.of()
		.insert()
		.into('tests')
		.defaultValues()
		.returning(['*'])
		.getQuery(),
	`INSERT INTO tests DEFAULT VALUES RETURNING *`,
);

tap.equal(
	QueryBuilder
		.of()
		.insert()
		.into('users')
		.columns(['first_name', 'last_name'])
		.values([[`'Artem'`, `'Tolstykh'`], [`'Maksym'`, `'Bezruchko'`]])
		.returning(['*'])
		.getQuery(),
	`INSERT INTO users (first_name, last_name) VALUES ('Artem', 'Tolstykh'), ('Maksym', 'Bezruchko') RETURNING *`,
);

tap.equal(
	QueryBuilder
		.of()
		.update('users')
		.set({first_name: `'Artem'`, last_name: `'Tolstykh'`})
		.where('id = :id', {id: 1})
		.getQuery(),
	`UPDATE users SET first_name = 'Artem', last_name = 'Tolstykh' WHERE id = 1`,
);

tap.equal(
	QueryBuilder
		.of()
		.delete()
		.from('users')
		.getQuery(),
	`DELETE FROM users`,
);

tap.equal(
	QueryBuilder
		.of()
		.delete()
		.from('users')
		.where('id = :id', {id: 1})
		.returning(['*'])
		.getQuery(),
	`DELETE FROM users WHERE id = 1 RETURNING *`,
);

tap.equal(
	QueryBuilder
		.of()
		.select(['users.*', 'photos.*'])
		.from('users')
		.innerJoin('photos', 'photos.user = users.id')
		.andWhere('photos.isRemoved = :isRemoved', {isRemoved: false})
		.where('users.name = :username', {username: `'arttolstykh'`})
		.getQuery(),
	`SELECT users.*, photos.* FROM users INNER JOIN photos ON photos.user = users.id AND photos.isRemoved = false WHERE users.name = 'arttolstykh'`,
);