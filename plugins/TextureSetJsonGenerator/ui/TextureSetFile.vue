<template>
	<v-container :height="height">
		<v-row>
			<div ref="editor"></div>
		</v-row>
		<v-row>
			<v-col cols="3">
				<v-card>
					<v-card-title>Color Layer</v-card-title>
					<v-card-subtitle>{{ tab.fileData['minecraft:texture_set'].color }}</v-card-subtitle>
					<v-img :src="textureSrc(tab.textureImages.color)" :alt="`Preview color: ${tab.fileData['minecraft:texture_set'].color}`" contain :width="tab.imageSize" :height="tab.imageSize"></v-img>
				</v-card>
			</v-col>
			<v-col cols="3">
				<v-card>
					<v-card-title>MER Layer</v-card-title>
					<v-card-subtitle>{{ tab.fileData['minecraft:texture_set'].metalness_emissive_roughness }}</v-card-subtitle>
					<v-img ref="mer" :src="textureSrc(tab.textureImages.metalness_emissive_roughness)" :alt="`Preview MER: ${tab.fileData['minecraft:texture_set'].metalness_emissive_roughness}`" @load="loadMer" width="256" height="256"></v-img>

					<v-card-subtitle>Metalness</v-card-subtitle>
					<canvas ref="metalness"></canvas>
					<v-card-subtitle>Emissiveness</v-card-subtitle>
					<canvas ref="emissiveness"></canvas>
					<v-card-subtitle>Roughness</v-card-subtitle>
					<canvas ref="roughness"></canvas>

				</v-card>
			</v-col>
			<v-col cols="3">
				<v-card>
					<v-card-title>Normal Map Layer</v-card-title>
					<v-card-subtitle>{{ tab.fileData['minecraft:texture_set'].normal }}</v-card-subtitle>
					<v-img :src="textureSrc(tab.textureImages.normal)" :alt="`Preview normal map: ${tab.fileData['minecraft:texture_set'].normal}`"></v-img>
				</v-card>
			</v-col>
			<v-col cols="3">
				<v-card>
					<v-card-title>Height Map Layer</v-card-title>
					<v-card-subtitle>{{ tab.fileData['minecraft:texture_set'].heightmap }}</v-card-subtitle>
					<v-img :src="textureSrc(tab.textureImages.heightmap)" :alt="`Preview height map: ${tab.fileData['minecraft:texture_set'].heightmap}`"></v-img>
				</v-card>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
export default {
	name: 'TextureSetFile',
	props: {
		tab: Object,
		height: Number,
	},
	activated() {
		this.loadMer()
	},
	mounted() {
		this.loadMer()
	},
	data: () => ({
	}),
	methods: {
		textureSrc(srcset) {
			if (srcset === undefined) {
				// TODO: Return filler
				return
			}
			return srcset['png'] || srcset['jpg'] || srcset['jpeg']
		},
		loadMer() {
			const merSrc = this.$refs.mer.image;
			// TODO: Wait for refs to load before sending to tab controller
			this.tab.receiveCanvas(this.$refs.metalness, merSrc, this.tab.METALNESS_INDEX)
			this.tab.receiveCanvas(this.$refs.emissiveness, merSrc, this.tab.EMISSIVENESS_INDEX)
			this.tab.receiveCanvas(this.$refs.roughness, merSrc, this.tab.ROUGHNESS_INDEX)
		}
	},
	watch: {
		'tab.uuid'() {
			//this.loadMer()
		},
	},
}
</script>
