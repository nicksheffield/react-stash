const matchesParams = (x, params) => Object.entries(params).reduce((pass, [key, val]) => pass && x[key] === val, true)

const c = (context) => {
	const cacheFind = (type, params = {}, opts = {}) => {
		const model = context.models[type]
		const state = context.store.getState()
		let records = state[type].filter((x) => matchesParams(x, params))

		if (records) {
			if (opts.with) {
				records = records.map((record) => {
					const rels = opts.with instanceof Array ? opts.with : [opts.with]

					const relations = rels.reduce((list, rel) => {
						const [linkName, ...withs] = rel.split('.')
						const link = model.relationships[linkName]
						const modelName = link.modelName
						const fk = link.foreignKey

						switch (link.type) {
							case 'belongsTo':
								return {
									...list,
									[linkName]: cacheFind(modelName, { id: record[fk] }, { with: withs, single: true }),
								}
							case 'hasOne':
								return {
									...list,
									[linkName]: cacheFind(
										modelName,
										{ [fk]: record.id },
										{ with: withs, single: true }
									),
								}
							case 'hasMany':
								return {
									...list,
									[linkName]: cacheFind(modelName, { [fk]: record.id }, { with: withs }),
								}
							default:
								return null
						}
					}, {})

					return {
						...record,
						...relations,
					}
				})
			}
		}

		return opts.single ? records[0] : records
	}

	return cacheFind
}

export default c
