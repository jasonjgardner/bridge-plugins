<template>
	<v-dialog v-value="true" max-width="480">
		<v-card>
			<slot name="header"></slot>
			<v-card-text>
				<v-file-input
					v-model="fileSelection"
					:label="label"
					:accept="accepts"
					@change="onChange"
				></v-file-input>
			</v-card-text>
			<v-divider></v-divider>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn text color="primary" @click="onClose">Close</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>
<script>
export default {
	name: 'TextureUpload',
	props: {
		layer: {
			type: String,
			required: true,
			default: 'color',
			validator: (v) =>
				['color', 'mer', 'normal', 'heightmap'].includes(v),
		},
		label: {
			type: String,
			required: true,
			default: 'Color',
			validator: (v) => typeof v === 'string' && v.length > 1,
		},
	},
	data: () => ({
		fileSelection: null,
	}),
	methods: {
		onClose() {
			this.$emit('close')
		},
		onChange() {
			const file = this.fileSelection

			if (!(file instanceof File)) {
				return
			}

			const reader = new FileReader()

			reader.onload = () => {
				this.$emit('upload', file.name, reader.result)
				this.onClose()
			}
		},
	},
	computed: {
		accepts() {
			const mimes = ['image/png', 'image/gif', 'image/jpeg']

			if (this.layer === 'color') {
				mimes.push('.tga')
			}

			return mimes
		},
	},
}
</script>
