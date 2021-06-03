import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, FileExplorerNoteCountSettings, FileExplorerNoteCountSettingsTab } from './settings';
import './main.css'
import { clearInsertedNumbers, updateFolderNumbers } from './core';

export default class FileExplorerNoteCount extends Plugin {

	settings: FileExplorerNoteCountSettings;
	loadedStyles: Array<HTMLStyleElement>;

	updateFolderNumbers = () => {
    updateFolderNumbers(this.app);
  };

	async onload() {
		this.addSettingTab(new FileExplorerNoteCountSettingsTab(this.app, this));
		await this.loadSettings();
		if (!this.settings.showAllNumbers) this.loadStyle();
		this.updateFolderNumbers();
		this.app.metadataCache.on('resolved', this.updateFolderNumbers);
		this.app.vault.on('create', this.updateFolderNumbers);
		this.app.vault.on('rename', this.updateFolderNumbers);
		this.app.vault.on('delete', this.updateFolderNumbers);
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {
		clearInsertedNumbers();
		console.log('unloading plugin');
		this.app.vault.off('create', this.updateFolderNumbers);
		this.app.vault.off('rename', this.updateFolderNumbers);
		this.app.vault.off('delete', this.updateFolderNumbers);
		this.unloadStyle();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	// Style Settings

	loadStyle = () => {
		this.loadedStyles = Array<HTMLStyleElement>(0);
		var style = document.createElement("style");
		style.innerHTML = collapseStyle;
		document.head.appendChild(style);
		this.loadedStyles.push(style);
	}

	unloadStyle = () => {
		for (let style of this.loadedStyles) {
			document.head.removeChild(style);
		}
		this.loadedStyles = Array<HTMLStyleElement>(0);
	}

	handleStyleToggle = (newStyle: boolean) => {
		if (!newStyle) {
			this.loadStyle();
		} else {
			this.unloadStyle();
		}
	}

}

const collapseStyle = `
	.nav-folder:not(.is-collapsed) > .nav-folder-title > .oz-folder-numbers { 
		display: none; 
	}

	.oz-folder-numbers:not([haschild='true']){
		display: inline !important;
	}
`