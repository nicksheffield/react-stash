import { useEffect, useState } from 'react'
import deepEqual from 'deep-equal'

const c = (context) => {
	const fetchCaches = []

	const useFind = (type, id, opts = {}) => {
		return run(type, { id }, { ...opts, single: true })
	}

	const useQuery = (type, params, opts = {}) => {
		return run(type, params, { ...opts, single: false })
	}

	const run = (type, params, opts = {}) => {
		let firstRun = true
		// check for past fetch errors, and throw them
		for (const fetchCache of fetchCaches) {
			if (
				deepEqual(type, fetchCache.type) &&
				deepEqual(params, fetchCache.params) &&
				deepEqual(opts, fetchCache.opts)
			) {
				firstRun = false
				if (Object.prototype.hasOwnProperty.call(fetchCache, 'error')) {
					throw fetchCache.error
				}
			}
		}

		const [record, setRecord] = useState(context.cacheFind(type, params, opts))

		const [solidParams, setSolidParams] = useState(params)

		if (!deepEqual(solidParams, params)) {
			setSolidParams(params)
		}

		const fetch = () => {
			const cache = { type, params, opts }

			const promise = context
				.networkFind(type, params, opts)
				.then((result) => {
					setRecord(result)
				})
				.catch((err) => {
					cache.error = err
				})

			fetchCaches.push(cache)

			if (!record) {
				throw promise
			}
		}

		let fetched = false

		if (!record || firstRun) {
			fetched = true
			fetch()
		}

		useEffect(() => {
			if (!fetched && !opts.single) {
				fetch()
			}

			return context.store.subscribe((state) => {
				const newVal = context.cacheFind(type, params, opts)

				if (!deepEqual(newVal, record) || (newVal instanceof Array && !newVal.length)) {
					setRecord(newVal)
				}
			})
		}, [type, solidParams])

		return record
	}

	return {
		useFind,
		useQuery,
	}
}

export default c
