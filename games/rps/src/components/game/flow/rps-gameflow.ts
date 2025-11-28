import { Gameflow, GameData, Scene } from "@parity-games/core";
import RpsGameData from "../data/rps-game-data";
import { isRoundResultData } from "../utils/guards";

export default class RpsGameflow extends Gameflow{
    constructor(gameData: GameData, scene: Scene) {
        super(gameData, scene);
    }

    override startGame(): void {
        const gameSettings = this.gameData.getGameSettingsData();
        this.scene.initHUD(gameSettings.playerScore, gameSettings.opponentScore);
        this.scene.showStartGame();
    }

    override startRound(): void {
        const roundNumber = this.gameData.getRoundData();
        this.scene.showRound(roundNumber);
    }

    override showRoundResult(...args: any[]): void {
        const playerMove = args[0] || 'rock';
        (this.gameData as RpsGameData).setPlayerMove(playerMove);
        this.scene.showRoundResult(this.gameData.getRoundResultData());
    }

    override showEndGame(result: any): void {
        this.scene.showEndGame(result);
    }

    protected override setupCustomEventHandlers(): void {
        const animationCompletedHandler = (roundResultData: unknown) => {
            if (!isRoundResultData(roundResultData)) return;

            if (roundResultData.result) {
                this.scene.app.stage.emit('GAME_END', roundResultData.result);
                return;
            }

            this.scene.app.stage.emit('ROUND_STARTED');
        };

        this.scene.app.stage.on('ANIMATION_COMPLETED', animationCompletedHandler);
    }
}