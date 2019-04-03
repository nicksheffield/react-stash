import axios from 'axios'

const c = (context) => {
	const save = async (type, record, opts = {}) => {
		const model = context.models[type]
		const url = model.endpoint + (record.id ? `/${record.id}` : '')
		const method = record.id ? 'put' : 'post'
		const response = await axios[method](url, record)
		const newRecord = response.data

		context.store.dispatch({ type: 'UPSERT', payload: { type, record: newRecord } })

		return newRecord
	}

	return save
}

export default c
