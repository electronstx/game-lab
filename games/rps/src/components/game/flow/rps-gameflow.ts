import { Gameflow, GameData, Scene, GameStates } from "@parity-games/core";

export default class RpsGameflow extends Gameflow{
    constructor(gameData: GameData, scene: Scene) {
        super(gameData, scene);
    }

    public override startGame(): void {
        const gameSettings = this.gameData.getGameSettingsData();
        this.scene.initHUD(gameSettings);
        this.scene.showStartGame();
    }

    public override startRound(roundNumber: number): void {
        this.scene.showRound(roundNumber);
    }

    public override showRoundResult(...args: any[]): void {
        this.scene.showRoundResult();
    }

    public override showEndGame(result: any, timescale?: number): void {
        this.scene.showEndGame(result, timescale);
    }
}