'use strict';

const { globalRegistry } = require('./registry');
const { isObject } = require('./util');
const { validateMetricName, validateLabelName } = require('./validation');

/**
 * @abstract
 */
class Metric {
	constructor(config, defaults = {}) {
		if (!isObject(config)) {
			throw new TypeError('constructor expected a config object');
		}
		Object.assign(
			this,
			{
				labelNames: [],
				registers: [globalRegistry],
				aggregator: 'sum',
			},
			defaults,
			config,
		);
		// labelNames are passed to constructor as array for user-friendliness,
		// but interally, we use them as a Set
		this.labelNames = new Set(this.labelNames);
		if (!this.registers) {
			// in case config.registers is `undefined`
			this.registers = [globalRegistry];
		}
		if (!this.help) {
			throw new Error('Missing mandatory help parameter');
		}
		if (!this.name) {
			throw new Error('Missing mandatory name parameter');
		}
		if (!validateMetricName(this.name)) {
			throw new Error('Invalid metric name');
		}
		if (!validateLabelName([...this.labelNames])) {
			throw new Error('Invalid label name');
		}

		this.reset();

		for (const register of this.registers) {
			register.registerMetric(this);
		}
	}

	reset() {
		/* abstract */
	}
}

module.exports = { Metric };