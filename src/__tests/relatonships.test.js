import { belongsTo, hasOne, hasMany } from '../relationships'

describe('relationships', () => {
	it('belongsTo', () => {
		const rel = belongsTo('model', 'foreign_id')

		expect(rel).toEqual({ type: 'belongsTo', modelName: 'model', foreignKey: 'foreign_id' })
	})

	it('hasOne', () => {
		const rel = hasOne('model', 'foreign_id')

		expect(rel).toEqual({ type: 'hasOne', modelName: 'model', foreignKey: 'foreign_id' })
	})

	it('hasMany', () => {
		const rel = hasMany('model', 'foreign_id')

		expect(rel).toEqual({ type: 'hasMany', modelName: 'model', foreignKey: 'foreign_id' })
	})
})
