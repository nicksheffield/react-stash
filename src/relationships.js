export const belongsTo = (type, foreignKey) => ({
	type: 'belongsTo',
	modelName: type,
	foreignKey,
})

export const hasOne = (type, foreignKey) => ({
	type: 'hasOne',
	modelName: type,
	foreignKey,
})

export const hasMany = (type, foreignKey) => ({
	type: 'hasMany',
	modelName: type,
	foreignKey,
})
