# react-stash

Data fetching in react via hooks and suspense

---

I will probably improve these docs in future, but for now, just follow these instructions:

## Install

Before I publish this to npm, you can install via the github url

```
$ npm install --save https://github.com/nicksheffield/react-stash
```

## Setup

You'll want to add a directory structure like this inside your project:

```
store/
	models/
		user.js
		thing.js
		...
	index.js
```

The `index.js` will look something like this:

```javascript
import createStash from '@nicksheffield/react-stash'

const req = require.context('./models', true, /.js$/)
const models = req.keys().map(function(key) {
	return req(key).default
})

export const { useFind, useQuery, save, destroy } = createStash({ models })
```

This will auto-require models from the `models` folder, and then pass them into the `createStash` function.

The model files should look something like this:

```javascript
import { belongsTo, hasMany } from '@nicksheffield/react-stash'

export default {
	name: 'user',
	endpoint: 'http://localhost:8000/api/users',
	relationships: {
		photo: belongsTo('photo', 'photo_id'),
		files: hasMany('file', 'user_id'),
	},
}
```

And you're good to go! Now you can import the `useFind` and `useQuery` hooks from that `./store` directory, as well as the `save` and `destroy` functions.

# API

### `useFind(modelName, id, options?)`

This hook is used to retrieve one record via their `id`. The first param, `modelName`, needs to match the `name` param in one of the model files.

For now options isn't used, but in future you will be able to set custom request headers etc.

This hook will throw a promise if a value does not already exist in the cache, so you will need to have a `Suspense` somewhere higher in the component heirarchy.
It will also throw an error (for example on a 404) that you should catch with an Error Boundary component higher in the component heirarchy.

Theoretically you can trust that the record returned from `useFind()` will definitely exist.

---

### `useQuery(modelName, params?, options?)`

Ths hook is similar to `useFind` except for fetching multiple results. Params is optional if you want to fetch everything.

Params is useful for pagination, eg: `useQuery('post', { page: 2, limit: 10 })`

---

### `save(modelName, record)`

This function will send a post or put request to your api, depending on the existence of an `id` field.

The result will be integrated into the cache.

This function returns a promise.

---

### `destroy(modelName, record)`

This function will send a delete request to your api, and upon a success response, remove the record from the cache.

This function returns a promise.
