import { Gameflow, GameData, GameEvents } from "@game-lab/core";
import BowlingGameData from "../data/bowling-game-data.js";
import { isBowlingGameSettings } from "../utils/guards.js";
import { IBowlingScene } from "../view/types.js";

export default class BowlingGameflow extends Gameflow {
    #scene: IBowlingScene;
    #roundCompletedEmitted: boolean = false;
    #ballWasLaunched: boolean = false;
    #timers: ReturnType<typeof setTimeout>[] = [];

    constructor(gameData: GameData, scene: IBowlingScene) {
        super(gameData, scene);
        this.#scene = scene;
    }

    override setGameSettings(gameSettings: unknown): void {
        if (isBowlingGameSettings(gameSettings)) {
            this.gameData.setGameSettings(gameSettings);
            (this.gameData as BowlingGameData).initializeFrames();
        }
    }

    override startGame(): void {
        const gData = this.gameData.getGameData();
        this.#scene.initHUD(gData.numberOfFrames, gData.playerScore, gData.opponentScore);
        this.#scene.showStartGame();
        this.#updateScoreboard();
    }

    override startRound(): void {
        this.#clearTimers();

        const gameData = this.gameData as BowlingGameData;
        const shouldResetAllPins = gameData.shouldResetAllPins();
        
        this.#scene.showRound(undefined, undefined, shouldResetAllPins); 
        
        this.#updateScoreboard();
        
        this.#roundCompletedEmitted = false;
        this.#ballWasLaunched = false;
    }

    override showRoundResult(...args: unknown[]): void {
        const resultData = args[0];
        const gameData = this.gameData as BowlingGameData;
        
        if (resultData && typeof resultData === 'object' && 'pinsKnockedDown' in resultData) {
            if (!gameData.canProcessThrowResult()) {
                return;
            }
            
            gameData.setThrowResult((resultData as { pinsKnockedDown: number }).pinsKnockedDown);
            
            const endGameResult = gameData.checkEndGame();
            if (endGameResult) {
                this.scene.showRoundResult(this.gameData.getRoundResultData());
                this.#updateScoreboard();
                this.#scene.stopGameLoop();
                const timer = setTimeout(() => {
                    this.emit(GameEvents.GAME_END, endGameResult);
                }, 2000);
                this.#timers.push(timer);
                return;
            }
            
            this.scene.showRoundResult(this.gameData.getRoundResultData());
            this.#updateScoreboard();
            
            const timer = setTimeout(() => {
                this.emit(GameEvents.ROUND_STARTED);
            }, 2000);
            this.#timers.push(timer);
        } else {
            this.scene.showRoundResult(this.gameData.getRoundResultData());
            this.#updateScoreboard();
        }
    }

    override showEndGame(result: unknown, timescale?: number): void {
        this.#clearTimers();

        this.#scene.stopGameLoop();
        this.#scene.showEndGame(result, timescale);
        this.#updateScoreboard();
    }

    override restartGame(): void {
        this.#scene.stopGameLoop();
        this.gameData.resetData();
        this.#scene.restartGame();
        this.#updateScoreboard();
    }

    #clearTimers(): void {
        this.#timers.forEach(timer => clearTimeout(timer));
        this.#timers = [];
    }

    #updateScoreboard(): void {
        const scoreboardData = (this.gameData as BowlingGameData).getScoreboardData();
        this.#scene.updateScoreboard(scoreboardData);
    }

    protected override setupCustomEventHandlers(): void {
        const userInputHandler = (data: unknown) => {
            if (!this.#ballWasLaunched && typeof data === 'object' && data !== null && 'angle' in data) {
                this.#scene.launchBall((data as { angle: number }).angle);
            }
        };
        this.subscribe('USER_INPUT_BALL_LAUNCH', userInputHandler);
        
        const ballStoppedHandler = () => {
            if (!this.#ballWasLaunched || this.#roundCompletedEmitted) {
                return;
            }
            this.#scene.onBallStopped();
        };
        this.subscribe('BALL_STOPPED', ballStoppedHandler);
        
        const ballLaunchedHandler = () => {
            this.#ballWasLaunched = true;
        };
        this.subscribe('BALL_LAUNCHED', ballLaunchedHandler);
        
        const pinsSettledHandler = (data: unknown) => {
            if (this.#roundCompletedEmitted) {
                return;
            }
            
            if (typeof data === 'object' && data !== null && 'pinsKnockedDown' in data) {
                this.#roundCompletedEmitted = true;
                this.#ballWasLaunched = false;
                
                this.emit(GameEvents.ROUND_COMPLETED, {
                    pinsKnockedDown: (data as { pinsKnockedDown: number }).pinsKnockedDown
                });
            }
        };
        this.subscribe('PINS_SETTLED', pinsSettledHandler);
    }

    cleanupEventHandlers(): void {
        this.#clearTimers();
        super.cleanupEventHandlers();
    }

    override destroy(): void {
        this.#clearTimers();
        super.destroy();
    }
}