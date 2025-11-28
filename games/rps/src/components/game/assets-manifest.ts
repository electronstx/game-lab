import { Assets, type AssetsManifest } from 'pixi.js';

let initialized = false;

export const bundles = [
	'content'
];

export const manifest: AssetsManifest = {
	bundles: [
		{
			name: 'content',
			assets: {
				background: 'assets/background.png',
				paperButton: 'assets/button-paper.png',
				rockButton: 'assets/button-rock.png',
                scissorsButton: 'assets/button-scissors.png',
                cardBack: 'assets/card-back.png',
                opponentScore: 'assets/opponent-score.png',
                paper: 'assets/paper.png',
                playerScore: 'assets/player-score.png',
                rock: 'assets/rock.png',
                scissors: 'assets/scissors.png'
			}
		}
	]
};

export async function getAssets(): Promise<boolean> {
	const basePath = window.location.origin;

	if (!initialized) {
		await Assets.init({
			manifest,
			basePath,
			preferences: {
				crossOrigin: 'anonymous'
			}
		});
		initialized = true;
	}

	await Assets.loadBundle(bundles);
	return true;
}