import createStore from '../createStore'

describe('initial state', () => {
	it('passed initial state', () => {
		const initialState = { a: 1 }
		const reducer = (state, action) => state
		const store = createStore(reducer, initialState)

		expect(store.getState()).toBe(initialState)
	})

	it('reducer initial state', () => {
		const initialState = { a: 1 }
		const reducer = (state = initialState, action) => state
		const store = createStore(reducer)

		expect(store.getState()).toBe(initialState)
	})
})

describe('state frozen', () => {
	it('cant be mutated', () => {
		const initialState = { a: 1 }
		const reducer = (state, action) => state
		const store = createStore(reducer, initialState)

		expect(() => {
			store.getState().a = 2
		}).toThrow('Cannot assign to read only property')
	})
})

describe('dispatch', () => {
	const initialState = { a: 1 }
	const reducer = (state = initialState, action) => {
		switch (action.type) {
			case 'INC':
				return { a: state.a + 1 }
			case 'DEC':
				return { a: state.a - 1 }
			default:
				return state
		}
	}

	it('known action changes state', () => {
		const store = createStore(reducer)
		expect(store.getState()).toEqual({ a: 1 })

		store.dispatch({ type: 'INC' })
		expect(store.getState()).toEqual({ a: 2 })

		store.dispatch({ type: 'DEC' })
		expect(store.getState()).toEqual({ a: 1 })
	})

	it('unknown action changes nothing', () => {
		const store = createStore(reducer)
		expect(store.getState()).toBe(initialState)

		store.dispatch({ type: 'UNKNOWN' })
		expect(store.getState()).toBe(initialState)
	})
})

describe('subscription', () => {
	const initialState = { a: 1 }
	const reducer = (state = initialState, action) => state

	it('can subscribe and unsubscribe', () => {
		const fn = jest.fn()
		const store = createStore(reducer)

		const unsub = store.subscribe(fn)
		store.dispatch({})

		expect(fn).toHaveBeenCalledTimes(1)

		unsub()

		store.dispatch({})

		expect(fn).toHaveBeenCalledTimes(1)
	})
})
