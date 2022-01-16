<template>
	<v-container class="d-flex flex-column no-gutters">
		<v-combobox
			v-model="blockName"
			:items="blockList"
			label="Generate texture set for block"
			clearable
		>
			<template v-slot:item="{ item }">
				<v-row class="no-gutters">
					<v-col cols="7">
						{{ item }}
					</v-col>
					<v-col class="d-flex align-center" cols="5">
						<v-spacer></v-spacer>
						<v-tooltip>
							<template v-slot:activator="{ on }">
								<v-chip
									v-if="
										existingTextures.colors.includes(item)
									"
									color="indigo lighten-4"
									x-small
									label
									v-on="on"
									>Color</v-chip
								>

								<v-chip
									v-if="
										existingTextures.mers.includes(
											`${item}_mer`
										)
									"
									class="ml-1"
									color="pink lighten-4"
									x-small
									label
									v-on="on"
									>MER</v-chip
								>
								<v-chip
									v-if="
										existingTextures.normals.includes(
											`${item}_normal`
										)
									"
									class="ml-1"
									color="blue lighten-4"
									x-small
									label
									v-on="on"
									>Normal</v-chip
								>
								<v-chip
									v-if="
										existingTextures.heightmaps.includes(
											`${item}_heightmap`
										)
									"
									class="ml-1"
									color="gray darken-1"
									x-small
									label
									v-on="on"
									>Heightmap</v-chip
								>
							</template>

							{{ item }} PBR pipeline textures exist
						</v-tooltip>
					</v-col>
				</v-row>
			</template>
		</v-combobox>

		<TextureSetOutput
			v-if="blockName"
			:block="blockName"
			:existing="existingTextures"
			@save="onSave"
			@reset="onReset"
			@upload="onUpload"
		/>

		<v-snackbar :value="uploadedFile && uploadedFile.length">
			{{ uploadedFile }} saved

			<template v-slot:action="{ attrs }">
				<v-btn
					color="yellow"
					text
					v-bind="attrs"
					@click="uploadedFile = false"
				>
					Close
				</v-btn>
			</template>
		</v-snackbar>

		<v-snackbar :value="savedFile && savedFile.length">
			{{ savedFile }} saved

			<template v-slot:action="{ attrs }">
				<v-btn
					color="pink"
					text
					v-bind="attrs"
					@click="savedFile = false"
				>
					Close
				</v-btn>
			</template>
		</v-snackbar>
	</v-container>
</template>

<script>
const { readJSON, readFilesFromDir } = await require('@bridge/fs')
const { createError } = await require('@bridge/notification')
const { getCurrentRP } = await require('@bridge/env')
const { TextureSetOutput } = await require('@bridge/ui')

const getExistingTextures = async () => {
	const baseNames = [
		...(await readFilesFromDir(getCurrentRP() + '/textures/blocks')),
	]
		.filter(({ name }) => /\.(png|tga|gif|jpe?g)$/i.test(name))
		.map(({ name }) => name.substr(0, name.indexOf('.')))

	const rtxTextures = {
		mers: baseNames.filter((name) => name.endsWith('_mer')),
		normals: baseNames.filter((name) => /_n(ormal)?$/i.test(name)),
		heightmaps: baseNames.filter((name) => name.endsWith('_heightmap')),
	}

	const rtxList = Object.values(rtxTextures).flat()

	return {
		colors: baseNames.filter((name) => !rtxList.includes(name)),
		...rtxTextures,
	}
}

export default {
	name: 'TextureSetGenerator',
	props: {
		tab: Object,
	},
	components: {
		TextureSetOutput,
	},
	data: () => ({
		resetOnSave: false,
		savedFile: false,
		uploadedFile: '',
		blockName: '',
		blockList: [],
		existingTextures: [],
	}),
	async mounted() {
		this.updateBlocksList()
		this.existingTextures = await getExistingTextures()
		console.log(this.tab)
	},
	methods: {
		async updateBlocksList() {
			const terrainTextureFile = `${getCurrentRP()}/textures/terrain_texture.json`
			const { texture_data: textureData } = await readJSON(
				terrainTextureFile
			)

			if (!textureData) {
				createError(
					new Error(
						`Could not read textures in ${terrainTextureFile}`
					)
				)
				return
			}

			/// 🍝
			this.blockList = [
				...new Set(
					Object.keys(textureData)
						.map((k) =>
							Array.isArray(textureData[k].textures)
								? textureData[k].textures
										.map((txtr) =>
											`${txtr.path || txtr}`.substring(
												(txtr.path || txtr)
													.toString()
													.lastIndexOf('/') + 1
											)
										)
										.flat()
								: `${textureData[k].textures}`.substring(
										textureData[k].textures
											.toString()
											.lastIndexOf('/') + 1
								  )
						)
						.flat()
						.filter((v) => v && `${v}`.length > 0)
				),
			]
		},
		onReset() {
			this.blockName = ''
		},
		onSave(savedFile) {
			this.savedFile = savedFile

			if (this.resetOnSave) {
				this.onReset()
			}
		},
		onUpload(success, filename) {
			this.uploadedFile = success ? filename : false
		},
	},
	computed: {
		existingTexturesList() {
			return Object.values(this.existingTextures).flat()
		},
		chipValues() {
			return [
				{
					key: 'colors',
					label: 'Colors',
					search: '',
					text: 'Base texture',
				},
				{
					key: 'mers',
					label: 'MER',
					search: '_mer',
					text: 'Metalness Emissive Roughness',
				},
				{
					key: 'normals',
					label: 'Normal',
					search: '_normal',
					text: 'Normal map',
				},
				{
					key: 'heightmap',
					label: 'Height',
					search: '_heightmap',
					text: 'Height map',
				},
			]
		},
	},
}
</script>
