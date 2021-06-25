const { create } = await require('@bridge/sidebar')
const { CodeFileSelect } = await require('@bridge/ui')

create({
	id: 'co.jasongardner.openInVSCode',
	displayName: 'Open in VS Code',
	icon: 'mdi-microsoft-visual-studio-code',
	component: CodeFileSelect,
})
