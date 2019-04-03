import createStore from './createStore'
import createNetworkFind from './resolvers/networkFind'
import createCacheFind from './resolvers/cacheFind'
import createSave from './mutators/save'
import createDestroy from './mutators/destroy'
import createHooks from './hooks'

export * from './relationships'

const create = (opts) => {
	const models = opts.models.reduce((list, model) => {
		return { ...list, [model.name]: model }
	}, {})

	const initialState = Object.keys(models).reduce((list, model) => {
		return { ...list, [model]: [] }
	}, {})

	const upsert = (list, record) => {
		let foundRecord = list.find((x) => x.id === record.id)

		if (foundRecord) {
			return list.map((x) => (x === foundRecord ? { ...foundRecord, ...record } : x))
		} else {
			return [...list, record]
		}
	}

	const reducer = (state, action) => {
		switch (action.type) {
			case 'UPSERT':
				return {
					...state,
					[action.payload.type]: action.payload.records
						? action.payload.records.reduce(upsert, state[action.payload.type])
						: upsert(state[action.payload.type], action.payload.record),
				}
			case 'REMOVE':
				return {
					...state,
					[action.payload.type]: state[action.payload.type].filter((x) => x.id !== action.payload.record.id),
				}
			default:
				return state
		}
	}

	const store = createStore(reducer, initialState)

	const context = {}

	const cacheFind = createCacheFind(context)
	const networkFind = createNetworkFind(context)
	const { useFind, useQuery } = createHooks(context)
	const save = createSave(context)
	const destroy = createDestroy(context)

	context.store = store
	context.models = models
	context.cacheFind = cacheFind
	context.networkFind = networkFind
	context.useFind = useFind
	context.useQuery = useQuery
	context.save = save
	context.destroy = destroy

	return {
		store,
		models,
		cacheFind,
		networkFind,
		useFind,
		useQuery,
		save,
		destroy,
	}
}

export default create
