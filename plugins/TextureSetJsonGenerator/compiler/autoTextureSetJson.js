module.exports = ({ fileSystem, outputFileSystem, compileFiles, options }) => {
	const basename = (filePath) =>
		`${filePath}`.substring(
			filePath.lastIndexOf('/') + 1,
			filePath.indexOf('.')
		)

	const isTextureSet = (filePath) =>
		`${filePath}`.endsWith('.texture_set.json')

	const isColor = (value) =>
		(Array.isArray(value) && value.length >= 3 && value.length <= 4) ||
		/^#([a-fA-F0-9]{3,8})$/g.test(value.toString())

	function run() {
		const currentProject = 'JG RTX Addon'
		const dir = `projects/${currentProject}/RP/textures/blocks`
		const files = await fileSystem.readFilesFromDir(dir)

		const textureSets = files.filter(({ name }) => isTextureSet(name))

		console.log(files, textureSets)

		textureSets.forEach(async ({ path }) => {
			try {
				const data = await fileSystem.readJSON(path)[
					'minecraft:texture_set'
				]

				const textures = Object.keys(data).map((layerName) => {
					if (!data['minecraft:texture_set'][layerName]) {
						return null
					}

					if (isColor(data['minecraft:texture_set'][layerName])) {
						return data['minecraft:texture_set'][layerName]
					}

					return ['tga', 'png', 'jpg', 'jpeg']
						.map((ext) =>
							files.includes(
								`${dir}/${data['minecraft:texture_set'][layerName]}.${ext}`
							)
						)
						.filter()
				})

				console.log(textures)
			} catch (err) {
				console.error(err)
			}
		})
	}

	return {
		transformPath(filePath) {},
		// include() {
		// 	return [
		// 		'RP/textures/**/*.texture_set.json'
		// 	]
		// },
		// read(filePath) {
		// 	if (filePath.endsWith('.texture_set.json')) {
		// 		return filePath;
		// 	}
		// },
		// require(filePath, fileContent) {
		// 	if (filePath.endsWith('.texture_set.json')) {
		// 		return [filePath.replace(/\.texture_set.json$/, '.*')]
		// 	}
		// },
		// load(filePath, fileContent) {
		// 	console.log(filePath, fileContent)
		// },
		async buildStart() {
			await run()
		},
		// transform(filePath, fileContent, dependencies = {}) {
		// 	if (filePath.endsWith('.texture_set.json')) {
		// 		console.log(fileContent)
		// 	}

		// 	//console.log('transform', filePath, fileContent, dependencies)
		// }
	}
}
