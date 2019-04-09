const matchesParams = (x, params) => Object.entries(params).reduce((pass, [key, val]) => pass && x[key] === val, true)

const c = (context) => {
	const cacheFind = (type, params = {}, opts = {}) => {
		const model = context.models[type]
		const state = context.store.getState()
		let records = state[type].filter((x) => matchesParams(x, params))

		try {
			if (records) {
				if (opts.with) {
					records = records.map((record) => {
						const rels = opts.with instanceof Array ? opts.with : [opts.with]

						const relations = rels.reduce((list, rel) => {
							const [linkName1, ...withs] = rel.split('.')
							const optional = linkName1.indexOf('?') > -1
							const linkName = linkName1.replace(/\?/g, '')
							const link = model.relationships[linkName]
							const modelName = link.modelName
							const fk = link.foreignKey

							let found =
								link.type === 'belongsTo'
									? cacheFind(modelName, { id: record[fk] }, { with: withs, single: true })
									: link.type === 'hasOne'
									? cacheFind(modelName, { [fk]: record.id }, { with: withs, single: true })
									: link.type === 'hasMany'
									? cacheFind(modelName, { [fk]: record.id }, { with: withs })
									: null

							if (!found && !optional) {
								throw new Error('cache hole found')
							}

							return {
								...list,
								[linkName]: found,
							}
						}, {})

						return {
							...record,
							...relations,
						}
					})
				}
			}
		} catch (e) {
			if (e.message === 'cache hole found') {
				return null
			} else {
				throw e
			}
		}

		return opts.single ? records[0] : records
	}

	return cacheFind
}

export default c
