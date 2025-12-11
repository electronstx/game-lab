import { Gameflow, GameData, Scene, GameEvents } from "@parity-games/core";
import RpsGameData from "../data/rps-game-data";
import { isRoundResultData, isRpsGameSettings, isRpsMove } from "../utils/guards";

export default class RpsGameflow extends Gameflow{
    constructor(gameData: GameData, scene: Scene) {
        super(gameData, scene);
    }

    override setGameSettings(gameSettings: unknown): void {
        if (isRpsGameSettings(gameSettings)) {
            this.gameData.setGameSettings(gameSettings);
        }
    }

    override startGame(): void {
        const gData = this.gameData.getGameData();
        this.scene.initHUD(gData.playerScore, gData.opponentScore);
        this.scene.showStartGame();
    }

    override startRound(): void {
        const roundNumber = this.gameData.getRoundData();
        this.scene.showRound(roundNumber);
    }

    override showRoundResult(...args: unknown[]): void {
        const playerMove = isRpsMove(args[0]) ? args[0] : 'rock';
        (this.gameData as RpsGameData).setPlayerMove(playerMove);
        this.scene.showRoundResult(this.gameData.getRoundResultData());
    }

    override showEndGame(result: unknown): void {
        this.scene.showEndGame(result);
    }

    override restartGame(): void {
        this.gameData.resetData();
        this.scene.restartGame();
    }

    protected override setupCustomEventHandlers(): void {
        const animationCompletedHandler = (roundResultData: unknown) => {
            if (!isRoundResultData(roundResultData)) return;
    
            if (roundResultData.result) {
                this.emit(GameEvents.GAME_END, roundResultData.result);
                return;
            }
    
            this.emit(GameEvents.ROUND_STARTED);
        };
    
        this.subscribe('ANIMATION_COMPLETED', animationCompletedHandler);
    }
}