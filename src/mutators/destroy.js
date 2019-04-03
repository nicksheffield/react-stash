import axios from 'axios'

const c = (context) => {
	const destroy = async (type, record, opts = {}) => {
		const model = context.models[type]
		const url = model.endpoint + '/' + record.id

		await axios.delete(url, record)

		context.store.dispatch({ type: 'REMOVE', payload: { type, record } })

		return record
	}

	return destroy
}

export default c
