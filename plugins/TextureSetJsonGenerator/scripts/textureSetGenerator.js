const { getFileHandle, loadFileHandleAsDataUrl, fileExists } = await require('@bridge/fs')
const { basename, join, dirname } = await require('@bridge/path')
const {
	openTab,
	ContentTab,
	FileTab,
	ThreePreviewTab,
	register: registerTab,
} = await require('@bridge/tab')
const {
	register: registerTabAction,
	addTabActions,
	registerPreview,
} = await require('@bridge/tab-actions')
const { parse } = await require('@bridge/json5')
const { TextureSetGenerator, TextureSetFile } = await require('@bridge/ui')


class TextureSetTab extends FileTab {
	type = 'TextureSetTab'
	component = TextureSetFile
	isLoading = true
	formatVersion = null
	fileData = {}
	textureSet = {}
	textureImages = {}
	textureColors = {}
	
	depthMap = 'normal'
	errors = []

	EXT_NAME = '.texture_set.json'
	METALNESS_INDEX = 0;
	EMISSIVENESS_INDEX = 1;
	ROUGHNESS_INDEX = 2;

	get kind() {
		return this.EXT_NAME;
	}
	
	get name() {
		return basename(this.fileHandle.name, this.EXT_NAME)
	}
	
	get icon() {
		return 'mdi-buffer'
	}
	
	get iconColor() {
		return !this.isUnsaved ? 'danger' : 'success'
	}
	
	static is(tab) {
		return tab.name.endsWith('.texture_set.json');
	}
	
	isFor(fileHandle) {
		return fileHandle.name.endsWith(this.EXT_NAME);
	}
	
	async setup() {
		await super.setup()
			
		this.isLoading = true
	
		try {
			this.fileData = await this.parseTextureSet()
			this.textureImages = await this.loadImages(this.fileData['minecraft:texture_set'])
			this.isLoading = false;
		} catch (err) {
			console.error(err)
		}
			
	}
	
	async parseTextureSet() {
		const handle = await this.getFile()
	
		const data = await new Promise((res, rej) => {
			const reader = new FileReader()
			reader.onload = () => res(reader.result)
			reader.onerror = (ev) => rej(ev)
			reader.readAsText(handle)
		})

		return parse(data)
	}

	async loadTextureImages(textureName) {
		const extPriority = ['tga', 'png', 'jpg', 'jpeg', 'gif']
		const imgPath = dirname(await this.getPath())

		const found = await Promise.all(extPriority.map(async (ext) => {
			const texturePath = join(imgPath, `/${textureName}.${ext}`)

			if (await fileExists(texturePath)) {
				return [ext, await loadFileHandleAsDataUrl(await getFileHandle(texturePath))]
			}

			return [ext, false]
		}))

		return Object.fromEntries(found)
	}
	
	async loadImages(textureSet) {
		const textureImages = {
			color: {},
			metalness_emissive_roughness: {},
			normal: {}
		}
	
		Object.keys(textureImages).forEach(async (layer) => {
			const textureName = textureSet[layer]
	
			if (TextureSetTab.isColor(textureName)) {
				return
			}

			textureImages[layer] = await this.loadTextureImages(textureName)
		});
	
		return textureImages
	}

	receiveCanvas(canvas, imgSrc, layerPosition) {
		canvas.width = imgSrc.width;
		canvas.height = imgSrc.height;
		
		const ctx = canvas.getContext('2d')
		
		ctx.drawImage(imgSrc, 0, 0);
		const imageData = ctx.getImageData(0, 0, imgSrc.width, imgSrc.height)
		const data = imageData.data;

		for (let itr = 0; itr < data.length; itr += 4) {
			const currentIdx = itr + layerPosition;
			data[itr + this.METALNESS_INDEX] = layerPosition === this.METALNESS_INDEX ? data[itr + this.METALNESS_INDEX] : data[currentIdx];
			data[itr + this.EMISSIVENESS_INDEX] = layerPosition === this.EMISSIVENESS_INDEX ? data[itr + this.EMISSIVENESS_INDEX] : data[currentIdx];
			data[itr + this.ROUGHNESS_INDEX] = layerPosition === this.ROUGHNESS_INDEX ? data[itr + this.ROUGHNESS_INDEX] : data[currentIdx];
		}

		ctx.putImageData(imageData, 0, 0)
	}
	
	static isColor(value) {
		return (Array.isArray(value) && value.length >= 3 && value.length <= 4) || /^#([a-fA-F0-9]{3,8})$/g.test(value.toString());
	}

	static parseColor(value) {
		let r = 255;
		let g = 255;
		let b = 255;
		let a = 1;
	
		if (typeof value === 'string' && value.length > 6) {
			let alphaHex = 'FF';
			let hex = value.substr(1, 6)
	
			if (value.length === 9) {
				// ARGB format
				alphaHex = value.substr(1, 2)
				hex = value.substr(2, 6)
			}
	
			value = `${hex}${alphaHex}`.match(/\w\w/g)
		}
	
		if (Array.isArray(value)) {
			[r, g, b, a] = value
		}
	
		return `rgba(${Math.max(0, Math.min(255, r))}, ${Math.max(0, Math.min(255, g))}, ${Math.max(0, Math.min(255, b))}, ${Math.max(0, Math.min(1, a))})`;
	}
}
	
registerTab(TextureSetTab)
	
// registerTabAction({
// 	icon: TextureSetTab.icon,
// 	name: 'Edit texture set',
// 	async trigger(tab) {
// 		openTab(TextureSetTab, true)
// 	},
// 	async isFor(tab) {
// 		const file = await tab.getFile()
// 		return file.name.endsWith('.texture_set.json');
// 	}
// })
	
// try {
// 	registerPreview({
// 		name: 'Texture Set',
// 		fileMatch: '.texture_set.json',
// 		fileType: '.texture_set.json',
// 		async isFor(tab) {
// 			const file = await tab.getFile()
// 			return file.name.endsWith('.texture_set.json');
// 		},
// 		async trigger(tab) {
// 			console.log('preview', await tab.fileHandle.getFile())
// 			openTab(TextureSetFileTab, true)
// 		},
// 	})
// } catch (err) {
// 	console.error('Failed registering texture set preview: %s', err)
// }
	
	
	
// createSidebarIcon({
// 	id: 'co.jasongardner.textureSetGenerator',
// 	displayName: 'Texture Set Generator',
// 	icon: 'mdi-buffer',
// 	onClick: () => {
// 		openTab(TextureSetPreviewTab)
// 	}
// })
