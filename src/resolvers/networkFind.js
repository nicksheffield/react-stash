import axios from 'axios'

const parseParams = (params) => {
	const { id, ...query } = params
	const idPart = `${id ? `/${id}` : ''}`

	const queryParams = Object.entries(query)
	const queryPart = `${queryParams.length ? `?${queryParams.map((x) => x.join('=')).join('&')}` : ''}`
	return `${idPart}${queryPart}`
}

const c = (context) => {
	const networkFind = async (type, params = {}, opts = {}) => {
		const model = context.models[type]
		const endpoint = model.endpoint
		const url = endpoint + parseParams(params)
		let { data: record } = await axios.get(url)
		let records = record instanceof Array ? record : [record]
		const rawRecords = records

		if (records) {
			if (opts.with) {
				records = await Promise.all(
					records.map(async (record) => {
						const rels = opts.with instanceof Array ? opts.with : [opts.with]

						let relations = {}

						for (let i = 0; i < rels.length; i++) {
							const rel = rels[i]

							const [linkName1, ...withs] = rel.split('.')
							// const optional = linkName1.indexOf('?') > -1
							const linkName = linkName1.replace(/\?/g, '')
							const link = model.relationships[linkName]
							const modelName = link.modelName
							const fk = link.foreignKey

							switch (link.type) {
								case 'belongsTo':
									relations = {
										...relations,
										[linkName]: await networkFind(
											modelName,
											{ id: record[fk] },
											{ with: withs, single: true }
										),
									}
									break
								case 'hasOne':
									relations = {
										...relations,
										[linkName]: await networkFind(
											modelName,
											{ [fk]: record.id },
											{ with: withs, single: true }
										),
									}
									break
								case 'hasMany':
									relations = {
										...relations,
										[linkName]: await networkFind(modelName, { [fk]: record.id }, { with: withs }),
									}
									break
								default:
									return null
							}
						}

						return {
							...record,
							...relations,
						}
					})
				)
			}
		}

		context.store.dispatch({ type: 'UPSERT', payload: { type, records: rawRecords } })

		return opts.single ? records[0] : records
	}

	return networkFind
}

export default c
