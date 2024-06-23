/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-interface */
import 'list2heading'

import { App, Editor, MarkdownView, Plugin, PluginSettingTab, Setting, Vault } from 'obsidian';

import { MdListConverter } from 'list2heading';

// Remember to rename these classes and interfaces!

interface PluginSettings {
	intent: number
	useVaultSettings: boolean,
}

const DEFAULT_SETTINGS: PluginSettings = {
	intent: 2,
	useVaultSettings: true,
}

export default class List2heading extends Plugin {
	settings: PluginSettings;

	async onload() {
		await this.loadSettings();
		this.addCommand({
			id: 'list2heading',
			name: 'List to Heading',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				//获取用户在obsidian的全局设置


				const selectedText = editor.getSelection();
				const converter = await MdListConverter.createConverter(selectedText);
				const tabSize = this.settings.useVaultSettings ? (this.app.vault as any).config['tabSize'] : this.settings.intent;
				const convertedText = await converter.lists2heading({ intent: ' '.repeat(tabSize) });
				editor.replaceSelection(convertedText);
			}
		})
		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

// class SampleModal extends Modal {
// 	constructor(app: App) {
// 		super(app);
// 	}

// 	onOpen() {
// 		const {contentEl} = this;
// 		contentEl.setText('Woah!');
// 	}

// 	onClose() {
// 		const {contentEl} = this;
// 		contentEl.empty();
// 	}
// }

class SampleSettingTab extends PluginSettingTab {
	plugin: List2heading;

	constructor(app: App, plugin: List2heading) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('intent:')
			.setDesc('How many spaces to indent the list')
			.addSlider(slider => slider
				.setDynamicTooltip()
				.setLimits(0, 10, 1)
				.setValue(this.plugin.settings.intent)
				.onChange(async (value) => {
					this.plugin.settings.intent = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('use vault settings')
			.setDesc('use tab size in the vault settings')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.useVaultSettings)
				.onChange(async (value) => {
					this.plugin.settings.useVaultSettings = value;
					await this.plugin.saveSettings();
				}));
	}
}
