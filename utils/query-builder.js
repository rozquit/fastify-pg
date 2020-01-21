import toPairs from 'folktale/core/object/to-pairs';
import getValues from 'folktale/core/object/values';

const {log} = console;

export default class QueryBuilder {
	constructor(client, values) {
		this.query = '';
		this.isTransaction = !!values;
		this.client = client;
		this.valuesArray = values || [];
	}
	static of(client, values) {
		return new QueryBuilder(client, values);
	};
	createColumnsExpression
		= values =>
		` (${values.join(', ')})`;
	createValuesExpression
		= values =>
		` VALUES ${values.map(valuesArray =>
			`(${valuesArray.map(value =>
				value).join(', ')})`).join(', ')}`;
	with(obj) {
		const pairs = toPairs(obj);
		this.query
			+= `WITH${pairs.map(([key, value]) =>
			` ${key} AS (${value})`)}`;
		return this;
	}
	withRecursive(obj1, obj2) {
		const values = getValues(obj2);
		this.query
			+= `WITH RECURSIVE ${toPairs(obj1).map(([key, values]) =>
			`${key}(${values.join(', ')})`)} AS (${values[0]} UNION ALL ${values[1]})`;
		return this;
	}
	insert() {
		this.query = 'INSERT ';
		return this;
	};
	table(tableName) {
		this.query += `TABLE ${tableName}`;
		return this;
	}
	select(elements) {
		this.query
			+= `${this.query.includes('WITH')
			? ` SELECT ${elements.join(', ')}`
			: `SELECT ${elements.join(', ')}`}`;
		return this;
	};
	update(tableName) {
		this.query += `UPDATE ${tableName ? tableName : ''}`;
		return this;
	};
	delete() {
		this.query += 'DELETE';
		return this;
	};
	from(tableName) {
		this.query += ` FROM ${tableName}`;
		return this;
	}
	set(obj) {
		this.query
			+= ` SET ${toPairs(obj).map(([key, value]) =>
			`${key} = ${value}`).join(', ')}`;
		return this;
	}
	where(condition, obj) {
		const pairs = toPairs(obj);
		this.query
			+= ` WHERE ${pairs.map(([key, value]) =>
			`${condition.replace(`:${key}`, value)}`)}`;
		return this;
	}
	andWhere(condition, obj) {
		const pairs = toPairs(obj);
		this.query
			+= ` AND ${pairs.map(([key, value]) =>
			`${condition.replace(`:${key}`, value)}`)}`;
		return this;
	}
	orWhere(condition, obj) {
		const pairs = toPairs(obj);
		this.query
			+= ` OR ${pairs.map(([key, value]) =>
			`${condition.replace(`:${key}`, value)}`)}`;
		return this;
	}
	into(tableName) {
		this.query += `INTO ${tableName}`;
		return this;
	}
	columns(elements) {
		this.query += this.createColumnsExpression(elements);
		return this;
	}
	values(elements) {
		this.query += this.createValuesExpression(elements);
		return this;
	}
	defaultValues() {
		this.query += ' DEFAULT VALUES';
		return this;
	}
	returning(elements) {
		this.query += ` RETURNING ${elements.join(', ')}`;
		return this;
	}
	limit(number) {
		this.query += ` LIMIT ${number}`;
		return this;
	}
	groupBy(elements) {
		this.query
			+= ` GROUP BY ${elements.join(', ')}`;
		return this;
	}
	getQuery() {
		log(this.query);
		return this.query.trim();
	};
	async execute() {
		log(`${this.query};`);
		return this.isTransaction
			? await this.client.query(this.query, this.valuesArray)
			: await this.client.query(this.query += ';');
	}
	async getOne() {
		const res = await this.execute();
		return res.rows[0];
	}
	async getMany() {
		const res = await this.execute();
		return res.rows;
	}
}