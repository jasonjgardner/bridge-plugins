const getExtension = ({ name }) =>
	name.substring(name.lastIndexOf('.') + 1, name.length) || name || 'png'
const stripExtension = (name) => name.substr(0, name.lastIndexOf('.'))

module.exports = async ({
	createFile,
	models: { IDENTIFIER, LAYERS, PRESET_PATH, FORMAT_VERSION, DEFAULT_COLOR },
}) => {
	const files = Object.fromEntries(
		LAYERS.map((layer) => {
			const name = stripExtension(layer.name)

			if (`${name}`.endsWith('_mer')) {
				return ['mer', layer]
			}

			if (`${name}`.endsWith('_normal')) {
				return ['normal', layer]
			}

			if (`${name}`.endsWith('_heightmap')) {
				return ['heightmap', layer]
			}

			return ['color', layer]
		})
	)

	const id = (IDENTIFIER || stripExtension(files.color?.name || ''))
		.trim()
		.replace(/[\s\/\\?.@#]+/g, '_')

	if (!id || id.length < 1) {
		throw Error(
			'A texture identifier must be provided. Can not determine ID from file name.'
		)
	}

	const create = []
	const dest = PRESET_PATH + id
	const layers = {
		color: DEFAULT_COLOR,
	}

	if (files.color) {
		create.push(
			createFile(`${dest}.${getExtension(files.color)}`, files.color)
		)

		layers.color = id
	}

	if (files.mer) {
		create.push(
			createFile(`${dest}_mer.${getExtension(files.mer)}`, files.mer)
		)
		layers.metalness_emissive_roughness = `${id}_mer`
	}

	if (files.normal) {
		create.push(
			createFile(
				`${dest}_normal.${getExtension(files.normal)}`,
				files.normal
			)
		)
		layers.normal = `${id}_normal`
	} else if (files.heightmap) {
		create.push(
			createFile(
				`${dest}_heigtmap.${getExtension(files.heightmap)}`,
				files.heightmap
			)
		)
		layers.heightmap = `${id}_heightmap`
	}

	create.push(
		createFile(
			`${dest}.texture_set.json`,
			JSON.stringify(
				{
					format_version: FORMAT_VERSION,
					'minecraft:texture_set': layers,
				},
				null,
				2
			)
		)
	)

	await Promise.all(create)
}
