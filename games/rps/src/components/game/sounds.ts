import { SoundService } from '@parity-games/core';

export function initGameSounds(soundService: SoundService) {
	soundService.registerMusic('bgMusic', {
		src: '/assets/sounds/music-loop.mp3',
		loop: true,
		volume: 0.01
	});

	soundService.registerSound('click', {
		src: '/assets/sounds/click.mp3',
		volume: 0.1
	});

	soundService.registerSound('hover', {
		src: '/assets/sounds/hover.mp3',
		volume: 0.1
	});

    soundService.registerSound('flash', {
		src: '/assets/sounds/flash.mp3',
		volume: 0.1
	});

	soundService.registerSound('end-game-win', {
		src: '/assets/sounds/end-game-win.mp3',
		volume: 0.1
	});

	soundService.registerSound('end-game-lose', {
		src: '/assets/sounds/end-game-lose.mp3',
		volume: 0.1
	});

	if (!soundService.isPlaying('bgMusic')) {
		soundService.play('bgMusic');
	}
}

export function playClickSound(soundService: SoundService) {
	soundService.play('click');
}

export function playHoverSound(soundService: SoundService) {
	soundService.play('hover');
}

export function playFlashSound(soundService: SoundService) {
	soundService.play('flash');
}

export function playEndGameSound(soundService: SoundService, result: string) {
	const soundName = result === 'Player wins!' ? 'end-game-win' : 'end-game-lose';
	soundService.play(soundName);
}