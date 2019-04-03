const defaultOpts = {
	log: false,
}

const createStore = (reducer, initialState = null, options = {}) => {
	const opts = { ...defaultOpts, ...options }

	const store = {
		state: initialState || reducer(undefined, {}),

		listeners: [],

		getState() {
			return Object.freeze(this.state)
		},

		dispatch(action) {
			this.updateState(action)
			const newState = this.getState()
			this.listeners.map((fn) => fn(newState))
		},

		updateState(action) {
			if (opts.log) {
				console.groupCollapsed('STORE:', action.type)
				console.log('%cbefore', 'color: tomato', this.getState())
				console.log('%caction', 'color: lime', action)
			}

			this.state = reducer(this.state, action)

			if (opts.log) {
				console.log('%cafter ', 'color: dodgerblue', this.getState())
				console.groupEnd()
			}
		},

		unsubscribe(fn) {
			this.listeners = this.listeners.filter((x) => x !== fn)
		},

		subscribe(fn) {
			this.listeners.push(fn)
			return () => this.unsubscribe(fn)
		},
	}

	return store
}

export default createStore
