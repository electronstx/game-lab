import { Assets, type AssetsManifest } from 'pixi.js';

let manifestAdded = false;

export const bundles = ['content'];

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
                scissors: 'assets/scissors.png',
            },
        },
    ],
};

export async function getAssets(): Promise<boolean> {
    const basePath = window.location.origin;

    if (!Assets.resolver) {
        await Assets.init({
            manifest,
            basePath,
            preferences: {
                crossOrigin: 'anonymous',
            },
        });
        manifestAdded = true;
    } else if (!manifestAdded) {
        await Assets.addBundle(bundles[0], manifest.bundles[0].assets);
        manifestAdded = true;
    }

    const firstAssetId = Object.keys(manifest.bundles[0].assets)[0];
    if (!Assets.cache.has(firstAssetId)) {
        await Assets.loadBundle(bundles);
    }

    return true;
}
