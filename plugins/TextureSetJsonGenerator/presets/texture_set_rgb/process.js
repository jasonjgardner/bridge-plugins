module.exports = async ({ createFile, models }) => {
	const {
		IDENTIFIER,
		IMAGE_SAVE_PATH,
		PRESET_PATH,
		COLOR_RED,
		COLOR_GREEN,
		COLOR_BLUE,
		COLOR_ALPHA,
		MER_RED,
		MER_GREEN,
		MER_BLUE,
		DEPTH_MAP_LAYER,
		DEPTH_MAP_TYPE,
		HEIGHT_VALUE,
		FORMAT_VERSION,
	} = models

	const id = IDENTIFIER.replace(/[\s'"_]+/g, '_')

	const textureSet = {
		format_version: FORMAT_VERSION,
		'minecraft:texture_set': {
			color: [
				COLOR_RED,
				COLOR_GREEN,
				COLOR_BLUE,
				COLOR_ALPHA !== undefined ? COLOR_ALPHA : 1,
			],
			metalness_emissiveness_roughness: [
				MER_RED || 0,
				MER_GREEN || 0,
				MER_BLUE || 0,
			],
		},
	}

	const depthMap = DEPTH_MAP_TYPE === 'normal' ? 'normal' : 'heightmap'

	if (DEPTH_MAP_LAYER && DEPTH_MAP_TYPE !== 'uniform') {
		await createFile(
			`${IMAGE_SAVE_PATH}${PRESET_PATH}${IDENTIFIER}_${depthMap}.png`,
			DEPTH_MAP_LAYER
		)
		textureSet['minecraft:texture_set'][depthMap] = `${id}_${depthMap}`
	}

	if (DEPTH_MAP_TYPE === 'uniform') {
		textureSet['minecraft:texture_set'][depthMap] = `#${
			(HEIGHT_VALUE < 7 ? '0' : '') +
			Math.round((HEIGHT_VALUE * 255) / 100).toString(16)
		}`
	}

	await createFile(
		`${IMAGE_SAVE_PATH}${PRESET_PATH}${IDENTIFIER}.texture_set.json`,
		JSON.stringify(textureSet, null, 2)
	)
}
