import { describe, it, expect, beforeEach, vi, afterEach, type MockedFunction } from 'vitest';
import { SoundService } from '../../../src/services/sound/sound-service.js';
import { mockHowlInstance, MockHowl } from '../../setup.js';
import { Howler } from 'howler';
import type { SoundConfig, SoundSettingsState } from '../../../src/services/sound/types.js';

describe('SoundService', () => {
    let service: SoundService;
    let mockLocalStorage: Storage;
    let mockWindow: Window;
    let mockAddEventListener: MockedFunction<Window['addEventListener']>;

    beforeEach(() => {
        mockHowlInstance.play.mockClear();
        mockHowlInstance.state.mockClear();
        mockHowlInstance.playing.mockClear();
        mockHowlInstance.volume.mockClear();
        mockHowlInstance.loop.mockClear();
        mockHowlInstance.mute.mockClear();
        mockHowlInstance.pause.mockClear();
        mockHowlInstance.stop.mockClear();
        mockHowlInstance.unload.mockClear();
        mockHowlInstance.once.mockClear();
        mockHowlInstance.off.mockClear();
        mockHowlInstance.on.mockClear();

        mockHowlInstance.play.mockReturnValue(1);
        mockHowlInstance.state.mockReturnValue('loaded');
        mockHowlInstance.playing.mockReturnValue(true);
        mockHowlInstance.volume.mockReturnValue(1);
        mockHowlInstance.loop.mockReturnValue(false);
        mockHowlInstance.mute.mockReturnValue(undefined);
        mockHowlInstance.pause.mockReturnValue(undefined);
        mockHowlInstance.stop.mockReturnValue(undefined);
        mockHowlInstance.unload.mockReturnValue(undefined);
        mockHowlInstance.once.mockReturnValue(undefined);
        mockHowlInstance.off.mockReturnValue(undefined);
        mockHowlInstance.on.mockReturnValue(undefined);

        MockHowl.mockClear();

        vi.mocked(Howler.stop).mockClear();
        vi.mocked(Howler.volume).mockClear();

        mockLocalStorage = {
            getItem: vi.fn(),
            setItem: vi.fn(),
            removeItem: vi.fn(),
            clear: vi.fn(),
            length: 0,
            key: vi.fn(),
        };

        mockAddEventListener = vi.fn();

        mockWindow = {
            addEventListener: mockAddEventListener,
            removeEventListener: vi.fn(),
            localStorage: mockLocalStorage,
        } as unknown as Window;

        Object.defineProperty(global, 'window', {
            value: mockWindow,
            writable: true,
            configurable: true,
        });

        (global as any).window = mockWindow;

        (global as any).localStorage = mockLocalStorage;

        if (typeof window === 'undefined') {
            throw new Error('window is not defined');
        }

        service = new SoundService();
    });

    afterEach(() => {
        service.cleanup();
    });

    describe('constructor', () => {
        it('should initialize with default settings when localStorage is empty', () => {
            mockLocalStorage.getItem = vi.fn(() => null);
            const newService = new SoundService();
            expect(newService.getSettings()).toEqual({ sound: true, music: true });
            newService.cleanup();
        });

        it('should load settings from localStorage', () => {
            const settings: SoundSettingsState = { sound: false, music: true };
            mockLocalStorage.getItem = vi.fn(() => JSON.stringify(settings));

            const newService = new SoundService();
            expect(newService.getSettings()).toEqual(settings);
            newService.cleanup();
        });

        it('should use default settings when localStorage has invalid data', () => {
            mockLocalStorage.getItem = vi.fn(() => 'invalid json');
            const newService = new SoundService();
            expect(newService.getSettings()).toEqual({ sound: true, music: true });
            newService.cleanup();
        });

        it('should set up page unload handlers', () => {
            expect(mockAddEventListener).toHaveBeenCalledWith(
                'beforeunload',
                expect.any(Function),
                { capture: true, signal: expect.any(AbortSignal) }
            );
            expect(mockAddEventListener).toHaveBeenCalledWith(
                'pagehide',
                expect.any(Function),
                { capture: true, signal: expect.any(AbortSignal) }
            );
            expect(mockAddEventListener).toHaveBeenCalledWith(
                'unload',
                expect.any(Function),
                { capture: true, signal: expect.any(AbortSignal) }
            );
        });
    });

    describe('subscribe', () => {
        it('should add subscriber and call it immediately with current settings', () => {
            const callback = vi.fn();
            const unsubscribe = service.subscribe(callback);

            expect(callback).toHaveBeenCalledWith({ sound: true, music: true });
            expect(callback).toHaveBeenCalledTimes(1);

            unsubscribe();
        });

        it('should notify subscriber when settings change', () => {
            const callback = vi.fn();
            service.subscribe(callback);
            callback.mockClear();

            service.setSoundEnabled(false);
            expect(callback).toHaveBeenCalledWith({ sound: false, music: true });
        });

        it('should return unsubscribe function that removes subscriber', () => {
            const callback = vi.fn();
            const unsubscribe = service.subscribe(callback);
            callback.mockClear();

            unsubscribe();
            service.setSoundEnabled(false);
            expect(callback).not.toHaveBeenCalled();
        });

        it('should handle subscriber errors gracefully', () => {
            const errorCallback = vi.fn(() => {
                throw new Error('Test error');
            });
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            service.subscribe(errorCallback);
            service.setSoundEnabled(false);

            expect(consoleErrorSpy).toHaveBeenCalled();
            consoleErrorSpy.mockRestore();
        });
    });

    describe('registerSound', () => {
        it('should register a sound effect', () => {
            const config: SoundConfig = { src: 'test.mp3' };
            service.registerSound('test-sound', config);

            expect(MockHowl).toHaveBeenCalledWith({
                src: ['test.mp3'],
                loop: false,
                volume: 1.0,
                onloaderror: expect.any(Function),
            });
        });

        it('should use provided loop and volume settings', () => {
            const config: SoundConfig = { src: 'test.mp3', loop: true, volume: 0.5 };
            service.registerSound('test-sound', config);

            expect(MockHowl).toHaveBeenCalledWith({
                src: ['test.mp3'],
                loop: true,
                volume: 0.5,
                onloaderror: expect.any(Function),
            });
        });

        it('should mute sound if sound is disabled', () => {
            service.setSoundEnabled(false);
            const config: SoundConfig = { src: 'test.mp3' };
            service.registerSound('test-sound', config);

            expect(mockHowlInstance.mute).toHaveBeenCalledWith(true);
        });

        it('should replace existing sound when registering same key', () => {
            const config1: SoundConfig = { src: 'test1.mp3' };
            const config2: SoundConfig = { src: 'test2.mp3' };

            service.registerSound('test-sound', config1);
            const firstHowl = MockHowl.mock.results[0].value;
            service.registerSound('test-sound', config2);

            expect(firstHowl.unload).toHaveBeenCalled();
            expect(MockHowl).toHaveBeenCalledTimes(2);
        });
    });

    describe('registerMusic', () => {
        it('should register music with loop enabled by default', () => {
            const config: SoundConfig = { src: 'music.mp3' };
            service.registerMusic('test-music', config);

            expect(MockHowl).toHaveBeenCalledWith({
                src: ['music.mp3'],
                loop: true,
                volume: 1.0,
                onloaderror: expect.any(Function),
            });
        });

        it('should pause music if music is disabled', () => {
            service.setMusicEnabled(false);
            const config: SoundConfig = { src: 'music.mp3' };
            service.registerMusic('test-music', config);

            expect(mockHowlInstance.pause).toHaveBeenCalled();
        });
    });

    describe('play', () => {
        beforeEach(() => {
            mockHowlInstance.play.mockClear();
            mockHowlInstance.mute.mockClear();
            mockHowlInstance.pause.mockClear();
            MockHowl.mockClear();

            service.registerSound('test-sound', { src: 'test.mp3' });
            service.registerMusic('test-music', { src: 'music.mp3' });

            mockHowlInstance.mute.mockClear();
            mockHowlInstance.pause.mockClear();

            mockHowlInstance.play.mockReturnValue(1);
        });

        it('should play registered sound and return sound ID', () => {
            const soundId = service.play('test-sound');

            expect(mockHowlInstance.play).toHaveBeenCalled();
            expect(soundId).toBe(1);
        });

        it('should return undefined for unregistered sound', () => {
            const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const soundId = service.play('unregistered');

            expect(soundId).toBeUndefined();
            expect(consoleWarnSpy).toHaveBeenCalledWith('Sound "unregistered" is not registered');
            consoleWarnSpy.mockRestore();
        });

        it('should not play sound effect when sound is disabled', () => {
            mockHowlInstance.play.mockClear();
            service.setSoundEnabled(false);
            const soundId = service.play('test-sound');

            expect(soundId).toBeUndefined();
            expect(mockHowlInstance.play).not.toHaveBeenCalled();
        });

        it('should play music even when music is disabled but pause it', () => {
            service.setMusicEnabled(false);
            const soundId = service.play('test-music');

            expect(mockHowlInstance.play).toHaveBeenCalled();
            expect(mockHowlInstance.pause).toHaveBeenCalledWith(1);
            expect(soundId).toBe(1);
        });

        it('should apply loop option when playing', () => {
            service.play('test-sound', { loop: true });

            expect(mockHowlInstance.loop).toHaveBeenCalledWith(true);
        });

        it('should apply volume option when playing', () => {
            service.play('test-sound', { volume: 0.7 });

            expect(mockHowlInstance.volume).toHaveBeenCalledWith(0.7);
        });

        it('should mute sound effect based on settings', () => {
            service.setSoundEnabled(false);
            service.play('test-sound');

            expect(mockHowlInstance.mute).toHaveBeenCalledWith(true);
        });

        it('should track playing sounds', () => {
            mockHowlInstance.playing.mockReturnValue(true);
            service.play('test-sound');

            expect(mockHowlInstance.once).toHaveBeenCalledWith('end', expect.any(Function), 1);
        });

        it('should remove sound from tracking if not playing', () => {
            mockHowlInstance.playing.mockReturnValue(false);
            service.play('test-sound');

            expect(mockHowlInstance.once).not.toHaveBeenCalled();
        });
    });

    describe('stop', () => {
        beforeEach(() => {
            service.registerSound('test-sound', { src: 'test.mp3' });

            mockHowlInstance.mute.mockClear();
            mockHowlInstance.play.mockClear();

            mockHowlInstance.play.mockReturnValue(1);
        });

        it('should stop specific sound by ID', () => {
            const soundId = service.play('test-sound');
            service.stop('test-sound', soundId);

            expect(mockHowlInstance.stop).toHaveBeenCalledWith(soundId);
        });

        it('should stop all instances of a sound when no ID provided', () => {
            service.play('test-sound');
            service.stop('test-sound');

            expect(mockHowlInstance.stop).toHaveBeenCalled();
        });

        it('should do nothing for unregistered sound', () => {
            service.stop('unregistered');
            expect(mockHowlInstance.stop).not.toHaveBeenCalled();
        });
    });

    describe('pause', () => {
        beforeEach(() => {
            service.registerSound('test-sound', { src: 'test.mp3' });

            mockHowlInstance.mute.mockClear();
            mockHowlInstance.play.mockClear();

            mockHowlInstance.play.mockReturnValue(1);
        });

        it('should pause specific sound by ID', () => {
            const soundId = service.play('test-sound');

            expect(soundId).toBe(1);

            service.pause('test-sound', soundId);

            expect(mockHowlInstance.pause).toHaveBeenCalledWith(soundId);
        });

        it('should pause all instances when no ID provided', () => {
            service.play('test-sound');
            service.pause('test-sound');

            expect(mockHowlInstance.pause).toHaveBeenCalled();
        });
    });

    describe('resume', () => {
        beforeEach(() => {
            service.registerSound('test-sound', { src: 'test.mp3' });

            mockHowlInstance.mute.mockClear();
            mockHowlInstance.play.mockClear();

            mockHowlInstance.play.mockReturnValue(1);
        });

        it('should resume specific sound by ID', () => {
            const soundId = service.play('test-sound');

            expect(soundId).toBe(1);

            service.pause('test-sound', soundId);
            service.resume('test-sound', soundId);

            expect(mockHowlInstance.play).toHaveBeenCalledWith(soundId);
        });

        it('should resume all instances when no ID provided', () => {
            service.play('test-sound');
            service.pause('test-sound');
            service.resume('test-sound');

            expect(mockHowlInstance.play).toHaveBeenCalled();
        });
    });

    describe('setVolume', () => {
        beforeEach(() => {
            service.registerSound('test-sound', { src: 'test.mp3' });

            mockHowlInstance.mute.mockClear();
        });

        it('should set volume for specific sound ID', () => {
            const soundId = service.play('test-sound');
            service.setVolume('test-sound', 0.5, soundId);

            expect(mockHowlInstance.volume).toHaveBeenCalledWith(0.5, soundId);
        });

        it('should set volume for all instances when no ID provided', () => {
            service.setVolume('test-sound', 0.7);

            expect(mockHowlInstance.volume).toHaveBeenCalledWith(0.7);
        });

        it('should clamp volume to 0-1 range', () => {
            service.setVolume('test-sound', -0.5);
            expect(mockHowlInstance.volume).toHaveBeenCalledWith(0);

            service.setVolume('test-sound', 1.5);
            expect(mockHowlInstance.volume).toHaveBeenCalledWith(1);
        });
    });

    describe('setMasterVolume', () => {
        it('should set master volume using Howler', () => {
            service.setMasterVolume(0.6);

            expect(Howler.volume).toHaveBeenCalledWith(0.6);
        });

        it('should clamp master volume to 0-1 range', () => {
            service.setMasterVolume(-0.2);
            expect(Howler.volume).toHaveBeenCalledWith(0);

            service.setMasterVolume(1.5);
            expect(Howler.volume).toHaveBeenCalledWith(1);
        });
    });

    describe('setSoundEnabled', () => {
        beforeEach(() => {
            service.setSettings({ sound: true, music: true });

            service.registerSound('sound1', { src: 'sound1.mp3' });
            service.registerSound('sound2', { src: 'sound2.mp3' });
            service.registerMusic('music1', { src: 'music1.mp3' });

            mockHowlInstance.mute.mockClear();
            mockHowlInstance.pause.mockClear();
        });

        it('should update sound setting and save to localStorage', () => {
            service.setSoundEnabled(false);

            expect(service.getSettings().sound).toBe(false);
            expect(mockLocalStorage.setItem).toHaveBeenCalled();
        });

        it('should mute/unmute all sound effects', () => {
            service.setSoundEnabled(false);
            expect(mockHowlInstance.mute).toHaveBeenCalledTimes(2);
            expect(mockHowlInstance.mute).toHaveBeenCalledWith(true);

            mockHowlInstance.mute.mockClear();
            service.setSoundEnabled(true);
            expect(mockHowlInstance.mute).toHaveBeenCalledTimes(2);
            expect(mockHowlInstance.mute).toHaveBeenCalledWith(false);
        });

        it('should not affect music', () => {
            service.setSoundEnabled(false);
            expect(mockHowlInstance.mute).toHaveBeenCalledTimes(2);
            expect(mockHowlInstance.mute).toHaveBeenCalledWith(true);
        });

        it('should notify subscribers', () => {
            service.setSettings({ sound: true, music: true });

            const callback = vi.fn();
            service.subscribe(callback);
            callback.mockClear();

            service.setSoundEnabled(false);
            expect(callback).toHaveBeenCalledWith({ sound: false, music: true });
        });
    });

    describe('setMusicEnabled', () => {
        beforeEach(() => {
            service.registerMusic('music1', { src: 'music1.mp3' });
            service.registerMusic('music2', { src: 'music2.mp3' });

            mockHowlInstance.pause.mockClear();
        });

        it('should update music setting and save to localStorage', () => {
            service.setMusicEnabled(false);

            expect(service.getSettings().music).toBe(false);
            expect(mockLocalStorage.setItem).toHaveBeenCalled();
        });

        it('should pause all music when disabled', () => {
            service.setMusicEnabled(false);

            expect(mockHowlInstance.pause).toHaveBeenCalled();
        });

        it('should resume music when enabled', () => {
            service.setMusicEnabled(false);
            mockHowlInstance.play.mockClear();

            mockHowlInstance.playing.mockReturnValue(false);
            service.setMusicEnabled(true);

            expect(mockHowlInstance.play).toHaveBeenCalled();
        });

        it('should notify subscribers', () => {
            const callback = vi.fn();
            service.subscribe(callback);
            callback.mockClear();

            service.setMusicEnabled(false);
            expect(callback).toHaveBeenCalledWith({ sound: true, music: false });
        });
    });

    describe('toggleSound', () => {
        it('should toggle sound enabled state', () => {
            service.setSettings({ sound: true, music: true });

            expect(service.toggleSound()).toBe(false);
            expect(service.getSettings().sound).toBe(false);

            expect(service.toggleSound()).toBe(true);
            expect(service.getSettings().sound).toBe(true);
        });
    });

    describe('toggleMusic', () => {
        it('should toggle music enabled state', () => {
            service.setSettings({ sound: true, music: true });

            expect(service.toggleMusic()).toBe(false);
            expect(service.getSettings().music).toBe(false);

            expect(service.toggleMusic()).toBe(true);
            expect(service.getSettings().music).toBe(true);
        });
    });

    describe('setSettings', () => {
        it('should update both sound and music settings', () => {
            service.setSettings({ sound: false, music: false });
            expect(service.getSettings()).toEqual({ sound: false, music: false });
        });

        it('should apply settings to registered sounds', () => {
            service.registerSound('sound1', { src: 'sound1.mp3' });
            service.registerMusic('music1', { src: 'music1.mp3' });

            mockHowlInstance.mute.mockClear();
            mockHowlInstance.pause.mockClear();

            service.setSettings({ sound: false, music: false });

            expect(mockHowlInstance.mute).toHaveBeenCalledTimes(1);
            expect(mockHowlInstance.mute).toHaveBeenCalledWith(true);
            expect(mockHowlInstance.pause).toHaveBeenCalled();
        });
    });

    describe('getSettings', () => {
        it('should return a copy of current settings', () => {
            const settings1 = service.getSettings();
            const settings2 = service.getSettings();

            expect(settings1).toEqual(settings2);
            expect(settings1).not.toBe(settings2);
        });
    });

    describe('stopAll', () => {
        it('should stop all sounds using Howler', () => {
            service.stopAll();

            expect(Howler.stop).toHaveBeenCalled();
        });

        it('should clear playing sounds tracking', () => {
            service.registerSound('test-sound', { src: 'test.mp3' });
            service.play('test-sound');

            mockHowlInstance.playing.mockReturnValue(false);
            service.stopAll();

            expect(service.isPlaying('test-sound')).toBe(false);
        });
    });

    describe('cleanup', () => {
        beforeEach(() => {
            mockHowlInstance.unload.mockClear();
            mockHowlInstance.stop.mockClear();
            MockHowl.mockClear();
            vi.mocked(Howler.stop).mockClear();

            mockLocalStorage.getItem = vi.fn(() => null);
        });

        it('should unload all sounds', () => {
            service.registerSound('sound1', { src: 'sound1.mp3' });
            service.registerMusic('music1', { src: 'music1.mp3' });

            service.cleanup();

            expect(mockHowlInstance.unload).toHaveBeenCalledTimes(2);
        });

        it('should clear all internal maps', () => {
            service.registerSound('sound1', { src: 'sound1.mp3' });
            service.play('sound1');

            service.cleanup();

            expect(service.isPlaying('sound1')).toBe(false);
        });

        it('should remove all subscribers', () => {
            const callback = vi.fn();
            service.subscribe(callback);

            callback.mockClear();

            service.cleanup();
            service.setSoundEnabled(false);

            expect(callback).not.toHaveBeenCalled();
        });

        it('should abort event listeners', () => {
            service.cleanup();

            mockLocalStorage.getItem = vi.fn(() => null);

            const newService = new SoundService();
            expect(newService.getSettings()).toEqual({ sound: true, music: true });
            newService.cleanup();
        });

        it('should not cleanup twice', () => {
            service.registerSound('sound1', { src: 'sound1.mp3' });
            service.cleanup();

            const unloadCalls = mockHowlInstance.unload.mock.calls.length;
            service.cleanup();

            expect(mockHowlInstance.unload.mock.calls.length).toBe(unloadCalls);
        });
    });

    describe('isPlaying', () => {
        it('should return true when sound is playing', () => {
            service.registerSound('test-sound', { src: 'test.mp3' });
            mockHowlInstance.playing.mockReturnValue(true);

            expect(service.isPlaying('test-sound')).toBe(true);
        });

        it('should return false when sound is not playing', () => {
            service.registerSound('test-sound', { src: 'test.mp3' });
            mockHowlInstance.playing.mockReturnValue(false);

            expect(service.isPlaying('test-sound')).toBe(false);
        });

        it('should return false for unregistered sound', () => {
            expect(service.isPlaying('unregistered')).toBe(false);
        });
    });

    describe('page unload handler', () => {
        it('should stop all sounds on page unload', () => {
            const handlers = mockAddEventListener.mock.calls
                .filter(call => call[0] === 'beforeunload' || call[0] === 'pagehide' || call[0] === 'unload')
                .map(call => call[1] as () => void);

            expect(handlers.length).toBeGreaterThan(0);
            handlers[0]!();

            expect(Howler.stop).toHaveBeenCalled();
        });
    });

    describe('error handling', () => {
        it('should handle localStorage errors gracefully', () => {
            const originalSetItem = mockLocalStorage.setItem;
            mockLocalStorage.setItem = vi.fn(() => {
                throw new Error('Storage quota exceeded');
            });

            const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            service.setSoundEnabled(false);

            expect(consoleWarnSpy).toHaveBeenCalled();
            consoleWarnSpy.mockRestore();

            mockLocalStorage.setItem = originalSetItem;
        });

        it('should handle sound loading errors', () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const config: SoundConfig = { src: 'invalid.mp3' };

            service.registerSound('test-sound', config);

            const howlCall = MockHowl.mock.calls[0];
            if (!howlCall || !howlCall[0]?.onloaderror) {
                throw new Error('Howl mock call not found');
            }
            const onloaderror = howlCall[0].onloaderror;
            onloaderror(1, new Error('Load failed'));

            expect(consoleErrorSpy).toHaveBeenCalled();
            consoleErrorSpy.mockRestore();
        });
    });
});