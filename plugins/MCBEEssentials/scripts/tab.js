const { IframeTab, addTab, getCurrentTabSystem } = await require('@bridge/tab')
const { create } = await require('@bridge/sidebar')
const { register, addTabActions } = await require('@bridge/tab-actions')
const { openExternal } = await require('@bridge/utils')
const commandBar = await require('@bridge/command-bar')

class MCBEEssentialsTab extends IframeTab {
	type = 'MCBEEssentialsTab'

	async setup() {
		addTabActions(this)

		await super.setup()
	}

	static is() {
		return false
	}

	get icon() {
		return 'mdi-wrench-outline'
	}
	get iconColor() {
		return 'primary'
	}
	get name() {
		return 'MCBE Essentials'
	}
}

async function createTab() {
	await addTab(
		new MCBEEssentialsTab(await getCurrentTabSystem(), {
			url: 'https://mcbe-essentials.github.io/',
		})
	)
}

register({
	icon: 'mdi-open-in-new',
	name: '[Open New]',
	trigger() {
		openExternal('https://mcbe-essentials.github.io/')
	},
	isFor(tab) {
		return tab.type === 'MCBEEssentialsTab'
	},
})

create({
	id: 'rebrainertv.bridge.MCBEEssentials',
	displayName: '[MCBE Essentials]',
	icon: 'mdi-wrench-outline',
	onClick: async () => {
		await createTab()
	},
})

commandBar.registerAction({
	icon: 'mdi-wrench-outline',
	name: '[Open MCBE Essentials]',
	description: '[Open a MCBE Essentials tab within bridge.]',
	onTrigger: async () => {
		await createTab()
	},
})
