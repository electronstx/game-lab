import { Howl, Howler } from 'howler';
import type { SoundConfig, SoundKey, SoundSettingsState, SoundType } from './types.js';
import { AudioError, ErrorCategory, ErrorSeverity, GameError, handleErrorSilently, StorageError } from '@game-lab/errors';
import { safeCleanup } from '../../utils/cleanup.js';

const SOUND_SETTINGS_KEY = 'game-lab-sound-settings';

export class SoundService {
	#soundSettings: SoundSettingsState;
	#sounds: Map<SoundKey, Howl>;
	#soundTypes: Map<SoundKey, SoundType>;
	#playingSounds: Map<SoundKey, number[]>;
	#pageUnloadHandler: (() => void) | null = null;
	#subscribers: Set<(settings: SoundSettingsState) => void> = new Set();
	#abortController: AbortController | null = null;
	#isCleanedUp: boolean = false;
	#eventHandlers: Map<SoundKey, Map<number, () => void>> = new Map();

	constructor() {
		this.#soundSettings = this.#loadSettings();
		this.#sounds = new Map();
		this.#soundTypes = new Map();
		this.#playingSounds = new Map();
		this.#setupPageUnloadHandler();
	}

	#setupPageUnloadHandler(): void {
		if (typeof window === 'undefined') return;

		this.#abortController = new AbortController();
		const signal = this.#abortController.signal;

		this.#pageUnloadHandler = () => {
			Howler.stop();
			this.#playingSounds.clear();
		};

		window.addEventListener('beforeunload', this.#pageUnloadHandler, {
			capture: true,
			signal
		});
		window.addEventListener('pagehide', this.#pageUnloadHandler, {
			capture: true,
			signal
		});
		window.addEventListener('unload', this.#pageUnloadHandler, {
			capture: true,
			signal
		});
	}

	subscribe(callback: (settings: SoundSettingsState) => void): () => void {
		this.#subscribers.add(callback);
		callback(this.getSettings());

		return () => {
			this.#subscribers.delete(callback);
		};
	}

	#notifySubscribers(): void {
		const settings = this.getSettings();
		this.#subscribers.forEach(callback => {
			callback(settings);
		});
	}

    #loadSettings(): SoundSettingsState {
		if (typeof window === 'undefined') {
			return { sound: true, music: true };
		}

		try {
			const stored = localStorage.getItem(SOUND_SETTINGS_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				if (
					typeof parsed === 'object' &&
					parsed !== null &&
					typeof parsed.sound === 'boolean' &&
					typeof parsed.music === 'boolean'
				) {
					return parsed;
				}
			}
		} catch (error) {
			const storageError = new StorageError(
				'Failed to load sound settings from localStorage',
				{ component: 'SoundService', method: '#loadSettings', originalError: error }
			);
			handleErrorSilently(storageError);
		}

		return { sound: true, music: true };
	}

    #saveSettings(): void {
		if (typeof window === 'undefined') return;

		try {
			localStorage.setItem(SOUND_SETTINGS_KEY, JSON.stringify(this.#soundSettings));
		} catch (error) {
			const storageError = new StorageError(
				'Failed to save sound settings to localStorage',
				{ component: 'SoundService', method: '#saveSettings', originalError: error }
			);
			handleErrorSilently(storageError);
		}
	}

    #registerAudio(key: SoundKey, config: SoundConfig, type: SoundType, defaultLoop: boolean): void {
        if (this.#sounds.has(key)) {
            this.#sounds.get(key)?.unload();
        }

        try {
            const sound = new Howl({
                src: [config.src],
                loop: config.loop ?? defaultLoop,
                volume: config.volume ?? 1.0,
                onloaderror: (id, error) => {
					const audioType = type === 'music' ? 'music' : 'sound';
					const audioError = new AudioError(
						`Failed to load ${audioType} "${key}"`,
						key,
						{ component: 'SoundService', method: '#registerAudio', originalError: error }
					);
					handleErrorSilently(audioError);
				}
            });

            if (type === 'effect') {
                sound.mute(!this.#soundSettings.sound);
            } else {
                if (!this.#soundSettings.music) {
                    sound.pause();
                }
            }

            this.#sounds.set(key, sound);
            this.#soundTypes.set(key, type);
        } catch (error) {
			const audioType = type === 'music' ? 'music' : 'sound';
			const audioError = new AudioError(
				`Failed to register ${audioType} "${key}"`,
				key,
				{ component: 'SoundService', method: '#registerAudio', originalError: error }
			);
			handleErrorSilently(audioError);
		}
    }

    registerSound(key: SoundKey, config: SoundConfig): void {
        this.#registerAudio(key, config, 'effect', false);
    }

    registerMusic(key: SoundKey, config: SoundConfig): void {
        this.#registerAudio(key, config, 'music', true);
    }

	play(key: SoundKey, options?: { loop?: boolean; volume?: number }): number | undefined {
		const sound = this.#sounds.get(key);
		if (!sound) {
			const audioError = new GameError(
				`Sound "${key}" is not registered`,
				ErrorSeverity.MEDIUM,
				ErrorCategory.AUDIO,
				{ component: 'SoundService', method: 'play', soundKey: key },
				true
			);
			handleErrorSilently(audioError);
			return undefined;
		}

		const soundType = this.#soundTypes.get(key) ?? 'effect';
		const isEnabled = soundType === 'music'
			? this.#soundSettings.music
			: this.#soundSettings.sound;

		if (soundType === 'effect' && !isEnabled) {
			return undefined;
		}

		try {
			if (options?.loop !== undefined) {
				sound.loop(options.loop);
			}

			if (options?.volume !== undefined) {
				sound.volume(options.volume);
			}

			if (soundType === 'music') {
				const soundId = sound.play();
				if (soundId !== undefined) {
					if (!isEnabled) {
						sound.pause(soundId);
					}
					this.#addPlayingSound(key, soundId);
					return soundId;
				}
			}

			sound.mute(!isEnabled);
			const soundId = sound.play();
			if (soundId !== undefined) {
				this.#addPlayingSound(key, soundId);
				return soundId;
			}
		} catch (error) {
			const audioError = new AudioError(
				`Failed to play sound "${key}"`,
				key,
				{ component: 'SoundService', method: 'play', originalError: error }
			);
			handleErrorSilently(audioError);
			return undefined;
		}

		return undefined;
	}

	#addPlayingSound(key: SoundKey, soundId: number): void {
		if (!this.#playingSounds.has(key)) {
			this.#playingSounds.set(key, []);
		}
		this.#playingSounds.get(key)?.push(soundId);

		const sound = this.#sounds.get(key);
		if (!sound) {
			this.#removePlayingSound(key, soundId);
			return;
		}

		if (sound.state() === 'unloaded') {
			this.#removePlayingSound(key, soundId);
			return;
		}

		const soundIds = this.#playingSounds.get(key);
		if (!soundIds || soundIds.length === 0) {
			return;
		}

		if (sound.playing(soundId)) {
			const endHandler = () => {
				if (this.#isCleanedUp) return;

				this.#removePlayingSound(key, soundId);
				this.#removeEventHandler(key, soundId);
			};

			sound.once('end', endHandler, soundId);

			if (!this.#eventHandlers.has(key)) {
				this.#eventHandlers.set(key, new Map());
			}
			this.#eventHandlers.get(key)?.set(soundId, endHandler);
		} else {
			this.#removePlayingSound(key, soundId);
		}
	}

	#removeEventHandler(key: SoundKey, soundId: number): void {
		const handlers = this.#eventHandlers.get(key);
		if (handlers) {
			handlers.delete(soundId);
			if (handlers.size === 0) {
				this.#eventHandlers.delete(key);
			}
		}
	}

	#removePlayingSound(key: SoundKey, soundId: number): void {
		const ids = this.#playingSounds.get(key);
		if (ids) {
			const index = ids.indexOf(soundId);
			if (index > -1) {
				ids.splice(index, 1);
			}
		}
	}

    stop(key: SoundKey, soundId?: number): void {
		const sound = this.#sounds.get(key);
		if (!sound) return;

		if (soundId !== undefined) {
			sound.stop(soundId);
			this.#removePlayingSound(key, soundId);
			this.#removeEventHandler(key, soundId);
		} else {
			sound.stop();
			this.#playingSounds.set(key, []);
			this.#eventHandlers.delete(key);
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

		for (const [key, sound] of this.#sounds.entries()) {
			if (this.#soundTypes.get(key) !== 'effect') continue;
			sound.mute(!enabled);
		}

		this.#saveSettings();
		this.#notifySubscribers();
	}

	setMusicEnabled(enabled: boolean): void {
		this.#soundSettings.music = enabled;

		for (const [key, sound] of this.#sounds.entries()) {
			const type = this.#soundTypes.get(key);
			if (type !== 'music') continue;

			if (enabled) {
				this.#resumeMusic(key, sound);
			} else {
				sound.pause();
			}
		}

		this.#saveSettings();
		this.#notifySubscribers();
	}

	#resumeMusic(key: SoundKey, sound: Howl): void {
		if (sound.playing()) {
			return;
		}

		const soundId = sound.play();
		if (soundId !== undefined) {
			if (!this.#playingSounds.has(key)) {
				this.#playingSounds.set(key, []);
			}
			this.#playingSounds.get(key)?.push(soundId);

			if (sound.playing(soundId)) {
				const endHandler = () => {
					if (this.#isCleanedUp) return;

					this.#removePlayingSound(key, soundId);
					this.#removeEventHandler(key, soundId);
				};

				sound.once('end', endHandler, soundId);

				if (!this.#eventHandlers.has(key)) {
					this.#eventHandlers.set(key, new Map());
				}
				this.#eventHandlers.get(key)?.set(soundId, endHandler);
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

		this.setSoundEnabled(this.#soundSettings.sound);
		this.setMusicEnabled(this.#soundSettings.music);
	}

    getSettings(): SoundSettingsState {
		return { ...this.#soundSettings };
	}

    stopAll(): void {
		Howler.stop();
		this.#playingSounds.clear();
	}

	cleanup(): void {
		if (this.#isCleanedUp) return;
		this.#isCleanedUp = true;

		if (this.#abortController) {
			this.#abortController.abort();
			this.#abortController = null;
		}
		this.#pageUnloadHandler = null;

		this.stopAll();

		for (const [key, sound] of this.#sounds.entries()) {
			safeCleanup(
				`sound "${key}"`,
				() => {
					const handlers = this.#eventHandlers.get(key);
					if (handlers) {
						for (const [soundId, handler] of handlers) {
							sound.off('end', handler, soundId);
						}
					}
					sound.unload();
				},
				'SoundService',
				'cleanup'
			);
		}

		this.#sounds.clear();
		this.#soundTypes.clear();
		this.#playingSounds.clear();
		this.#eventHandlers.clear();
		this.#subscribers.clear();
	}

    isPlaying(key: SoundKey): boolean {
		const sound = this.#sounds.get(key);
		if (!sound) return false;

		return sound.playing();
	}
}