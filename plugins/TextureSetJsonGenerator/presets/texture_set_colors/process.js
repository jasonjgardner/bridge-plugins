module.exports = async ({ createFile, models }) => {
	const {
		IDENTIFIER,
		IMAGE_SAVE_PATH,
		PRESET_PATH,
		BASE_LAYER_COLOR,
		DEPTH_MAP_LAYER,
		DEPTH_MAP_TYPE,
		FORMAT_VERSION,
	} = models

	const id = IDENTIFIER.replace(/[\s]+/g, '_')

	const textureSet = {
		format_version: FORMAT_VERSION,
		'minecraft:texture_set': {
			color: BASE_LAYER_COLOR || id,
		},
	}

	if (MER_LAYER_COLOR) {
		textureSet[
			'minecraft:texture_set'
		].metalness_emissiveness_roughness = MER_LAYER_COLOR
	}

	if (DEPTH_MAP_LAYER) {
		const depthMap = DEPTH_MAP_TYPE === 'normal' ? 'normal' : 'heightmap'

		await createFile(
			`${IMAGE_SAVE_PATH}${PRESET_PATH}${IDENTIFIER}_${depthMap}.png`,
			DEPTH_MAP_LAYER
		)
		textureSet['minecraft:texture_set'][depthMap] = `${id}_${depthMap}`
	}

	await createFile(
		`${IMAGE_SAVE_PATH}${PRESET_PATH}${IDENTIFIER}.texture_set.json`,
		JSON.stringify(textureSet, null, 2)
	)
}
