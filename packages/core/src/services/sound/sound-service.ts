import { Howl, Howler } from 'howler';
import type { SoundConfig, SoundKey, SoundSettingsState, SoundType } from './types.js';

const SOUND_SETTINGS_KEY = 'parity-games-sound-settings';

class SoundService {
	#soundSettings: SoundSettingsState;
	#sounds: Map<SoundKey, Howl>;
	#soundTypes: Map<SoundKey, SoundType>;
	#playingSounds: Map<SoundKey, number[]>;
	#pageUnloadHandler: (() => void) | null = null;

	constructor() {
		this.#soundSettings = this.#loadSettings();
		this.#sounds = new Map();
		this.#soundTypes = new Map();
		this.#playingSounds = new Map();
		this.#setupPageUnloadHandler();
	}

	#setupPageUnloadHandler(): void {
		if (typeof window === 'undefined') return;

		this.#pageUnloadHandler = () => {
			Howler.stop();
			this.#playingSounds.clear();
		};

		window.addEventListener('beforeunload', this.#pageUnloadHandler, { capture: true });
		window.addEventListener('pagehide', this.#pageUnloadHandler, { capture: true });
		window.addEventListener('unload', this.#pageUnloadHandler, { capture: true });
	}

    #loadSettings(): SoundSettingsState {
		if (typeof window === 'undefined') {
			return { sound: true, music: true };
		}

		try {
			const stored = localStorage.getItem(SOUND_SETTINGS_KEY);
			if (stored) {
				return JSON.parse(stored);
			}
		} catch (error) {
			console.warn('Failed to load sound settings from localStorage', error);
		}

		return { sound: true, music: true };
	}

    #saveSettings(): void {
		if (typeof window === 'undefined') return;

		try {
			localStorage.setItem(SOUND_SETTINGS_KEY, JSON.stringify(this.#soundSettings));
		} catch (error) {
			console.warn('Failed to save sound settings to localStorage', error);
		}
	}

    registerSound(key: SoundKey, config: SoundConfig): void {
		if (this.#sounds.has(key)) {
			this.#sounds.get(key)?.unload();
		}

		const sound = new Howl({
			src: [config.src],
			loop: config.loop ?? false,
			volume: config.volume ?? 1.0
		});

		this.#sounds.set(key, sound);
		this.#soundTypes.set(key, 'effect');
	}

    registerMusic(key: SoundKey, config: SoundConfig): void {
		if (this.#sounds.has(key)) {
			this.#sounds.get(key)?.unload();
		}

		const sound = new Howl({
			src: [config.src],
			loop: config.loop ?? true,
			volume: config.volume ?? 1.0
		});

		this.#sounds.set(key, sound);
		this.#soundTypes.set(key, 'music');
	}

	play(key: SoundKey, options?: { loop?: boolean; volume?: number }): number | undefined {
		const sound = this.#sounds.get(key);
		if (!sound) {
			console.warn(`Sound "${key}" is not registered`);
			return undefined;
		}

		const soundType = this.#soundTypes.get(key) ?? 'effect';
		const isEnabled = soundType === 'music' 
			? this.#soundSettings.music 
			: this.#soundSettings.sound;

		if (!isEnabled) {
			return undefined;
		}

		if (options?.loop !== undefined) {
			sound.loop(options.loop);
		}

		if (options?.volume !== undefined) {
			sound.volume(options.volume);
		}

		sound.mute(!isEnabled);

		const soundId = sound.play();
		
		if (!this.#playingSounds.has(key)) {
			this.#playingSounds.set(key, []);
		}
		this.#playingSounds.get(key)?.push(soundId);

		sound.once('end', () => {
			const ids = this.#playingSounds.get(key);
			if (ids) {
				const index = ids.indexOf(soundId);
				if (index > -1) {
					ids.splice(index, 1);
				}
			}
		});

		return soundId;
	}

    stop(key: SoundKey, soundId?: number): void {
		const sound = this.#sounds.get(key);
		if (!sound) return;

		if (soundId !== undefined) {
			sound.stop(soundId);
			const ids = this.#playingSounds.get(key);
			if (ids) {
				const index = ids.indexOf(soundId);
				if (index > -1) {
					ids.splice(index, 1);
				}
			}
		} else {
			sound.stop();
			this.#playingSounds.set(key, []);
		}
	}

    pause(key: SoundKey, soundId?: number): void {
		const sound = this.#sounds.get(key);
		if (!sound) return;

		if (soundId !== undefined) {
			sound.pause(soundId);
		} else {
			sound.pause();
		}
	}

    resume(key: SoundKey, soundId?: number): void {
		const sound = this.#sounds.get(key);
		if (!sound) return;

		if (soundId !== undefined) {
			sound.play(soundId);
		} else {
			sound.play();
		}
	}

    setVolume(key: SoundKey, volume: number, soundId?: number): void {
		const sound = this.#sounds.get(key);
		if (!sound) return;

		const clampedVolume = Math.max(0, Math.min(1, volume));
		if (soundId !== undefined) {
			sound.volume(clampedVolume, soundId);
		} else {
			sound.volume(clampedVolume);
		}
	}

    setMasterVolume(volume: number): void {
		Howler.volume(Math.max(0, Math.min(1, volume)));
	}

    setSoundEnabled(enabled: boolean): void {
		this.#soundSettings.sound = enabled;
		this.#saveSettings();

		for (const [key, sound] of this.#sounds.entries()) {
			const type = this.#soundTypes.get(key);
			if (type === 'effect') {
				sound.mute(!enabled);
			}
		}
	}

    setMusicEnabled(enabled: boolean): void {
		this.#soundSettings.music = enabled;
		this.#saveSettings();

		for (const [key, sound] of this.#sounds.entries()) {
			const type = this.#soundTypes.get(key);
			if (type === 'music') {
				sound.mute(!enabled);
			}
		}
	}

	toggleSound(): boolean {
		this.setSoundEnabled(!this.#soundSettings.sound);
		return this.#soundSettings.sound;
	}

	toggleMusic(): boolean {
		this.setMusicEnabled(!this.#soundSettings.music);
		return this.#soundSettings.music;
	}

    setSettings(settings: SoundSettingsState): void {
		this.#soundSettings = { ...settings };
		this.#saveSettings();

		for (const [key, sound] of this.#sounds.entries()) {
			const type = this.#soundTypes.get(key);
			if (type === 'effect') {
				sound.mute(!this.#soundSettings.sound);
			} else if (type === 'music') {
				sound.mute(!this.#soundSettings.music);
			}
		}
	}

    getSettings(): SoundSettingsState {
		return { ...this.#soundSettings };
	}

    stopAll(): void {
		Howler.stop();
		this.#playingSounds.clear();
	}

	cleanup(): void {
		if (this.#pageUnloadHandler && typeof window !== 'undefined') {
			window.removeEventListener('beforeunload', this.#pageUnloadHandler, { capture: true });
			window.removeEventListener('pagehide', this.#pageUnloadHandler, { capture: true });
			window.removeEventListener('unload', this.#pageUnloadHandler, { capture: true });
		}
		
		this.stopAll();
		for (const sound of this.#sounds.values()) {
			sound.unload();
		}
		this.#sounds.clear();
		this.#soundTypes.clear();
		this.#playingSounds.clear();
	}

    isPlaying(key: SoundKey): boolean {
		const sound = this.#sounds.get(key);
		return sound ? sound.playing() : false;
	}

	get soundSettings(): SoundSettingsState {
		return { ...this.#soundSettings };
	}
}

export const soundService = new SoundService();