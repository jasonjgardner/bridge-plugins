const { getCurrentRP } = await require('@bridge/env');
const { basename, join } = await require('@bridge/path')

module.exports = async ({ createFile, expandFiles, models }) => {
	const {
		IDENTIFIER,
		PRESET_PATH,
		BASE_LAYER,
		MER_LAYER,
		DEPTH_MAP_LAYER,
		DEPTH_MAP_TYPE,
		CARRIED_TEXTURE,
		FORMAT_VERSION
	} = models

	const id = IDENTIFIER ? IDENTIFIER.replace(/[\s]+/g, '_') : basename(BASE_LAYER.name, '.png').replace(/[\s]+/g, '_')

	const textureSet = {
		format_version: FORMAT_VERSION,
		'minecraft:texture_set': {}
	}

	const dest = join(PRESET_PATH, id);

	if (DEPTH_MAP_LAYER) {
		const depthMap = DEPTH_MAP_TYPE === 'normal' ? 'normal' : 'heightmap'

		await createFile(
			`${dest}_${depthMap}.png`,
			DEPTH_MAP_LAYER
		)
		textureSet['minecraft:texture_set'][
			depthMap
		] = `${id}_${depthMap}`
	}

	if (MER_LAYER) {
		await createFile(
			`${dest}_mer.png`,
			MER_LAYER
		)
		textureSet[
			'minecraft:texture_set'
		].metalness_emissiveness_roughness = `${id}_mer`
	}

	if (BASE_LAYER) {
		await createFile(
			`${dest}.png`,
			BASE_LAYER
		)

		textureSet['minecraft:texture_set'].color = IDENTIFIER
	}

	await createFile(
		`${dest}.texture_set.json`,
		JSON.stringify(textureSet, null, 2)
	)

	if (CARRIED_TEXTURE) {
		await createFile(`${dest}_carried.png`, CARRIED_TEXTURE)

		await expandFiles(`${getCurrentRP()}/blocks.json`, {
			[id]: {
				carried_textures: `${id}_carried`
			}
		})

		await expandFiles(`${getCurrentRP()}/textures/terrain_texture.json`, {
			texture_data: {
				[`${id}_carried`]: {
					textures: `${dest}_carried`
				}
			}
		})
	}
}
