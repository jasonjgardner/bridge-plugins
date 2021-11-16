module.exports = async ({ createFile, expandFile, models }) => {
	const {
		IDENTIFIER,
		PRESET_PATH,
		BASE_LAYER,
		MER_LAYER,
		DEPTH_MAP_LAYER,
		DEPTH_MAP_TYPE,
		CARRIED_TEXTURE,
		FORMAT_VERSION,
	} = models

	const id = IDENTIFIER
		? IDENTIFIER.replace(/[\s]+/g, '_')
		: BASE_LAYER.name.replace(/\.[^\.]*$/, '').replace(/[\s]+/g, '_')

	const textureSet = {
		format_version: FORMAT_VERSION,
		'minecraft:texture_set': {},
	}

	const dest = PRESET_PATH + id

	if (BASE_LAYER) {
		await createFile(`${dest}.png`, BASE_LAYER)

		textureSet['minecraft:texture_set'].color = IDENTIFIER
	}

	if (MER_LAYER) {
		await createFile(`${dest}_mer.png`, MER_LAYER)
		textureSet[
			'minecraft:texture_set'
		].metalness_emissive_roughness = `${id}_mer`
	}

	if (DEPTH_MAP_LAYER) {
		const depthMap = DEPTH_MAP_TYPE === 'normal' ? 'normal' : 'heightmap'

		await createFile(`${dest}_${depthMap}.png`, DEPTH_MAP_LAYER)
		textureSet['minecraft:texture_set'][depthMap] = `${id}_${depthMap}`
	}

	await createFile(
		`${dest}.texture_set.json`,
		JSON.stringify(textureSet, null, 2)
	)

	if (CARRIED_TEXTURE) {
		await createFile(`${dest}_carried.png`, CARRIED_TEXTURE)

		await expandFile('RP/blocks.json', {
			[`${id}`]: {
				carried_textures: `${id}_carried`,
			},
		})

		await expandFile('RP/textures/terrain_texture.json', {
			texture_data: {
				[`${id}_carried`]: {
					textures: `${dest}_carried`,
				},
			},
		})
	}
}
