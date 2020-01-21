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
		.table('tests')
		.getQuery(),
	`TABLE tests`,
);

tap.equal(
	QueryBuilder
		.of()
		.select(['*'])
		.from('tests')
		.where('column_1 = :column_1', {column_1: `'1'`})
		.andWhere('column_2 = :column_2', {column_2: true})
		.andWhere('column_3 = :column_3', {column_3: 3})
		.orWhere('column_4 = :column_4', {column_4: false})
		.getQuery(),
	`SELECT * FROM tests WHERE column_1 = '1' AND column_2 = true AND column_3 = 3 OR column_4 = false`,
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
		.into('tests')
		.columns(['column_1', 'column_2'])
		.values([[`'1'`, `'2'`], [`'1'`, `'3'`]])
		.returning(['*'])
		.getQuery(),
	`INSERT INTO tests (column_1, column_2) VALUES ('1', '2'), ('1', '3') RETURNING *`,
);

tap.equal(
	QueryBuilder
		.of()
		.update('tests')
		.set({column_1: `'1'`, column_2: 2, column_3: true})
		.where('column_4 = :column_4', {column_4: 4})
		.andWhere('column_5 = :column_5', {column_5: 5})
		.orWhere('column_6 = :column_6', {column_6: true})
		.getQuery(),
	`UPDATE tests SET column_1 = '1', column_2 = 2, column_3 = true WHERE column_4 = 4 AND column_5 = 5 OR column_6 = true`,
);

tap.equal(
	QueryBuilder
		.of()
		.delete()
		.from('tests')
		.getQuery(),
	`DELETE FROM tests`,
);

tap.equal(
	QueryBuilder
		.of()
		.delete()
		.from('tests')
		.where('column_1 = :column_1', {column_1: `'1'`})
		.andWhere('column_2 = :column_2', {column_2: 2})
		.orWhere('column_3 = :column_3', {column_3: true})
		.returning(['*'])
		.getQuery(),
	`DELETE FROM tests WHERE column_1 = '1' AND column_2 = 2 OR column_3 = true RETURNING *`,
);