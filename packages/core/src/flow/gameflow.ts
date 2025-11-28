import { GameEvents } from "../data/events.js";
import GameData from "../data/game-data.js";
import { GameStateName, GameStates } from "../data/types.js";
import Scene from "../view/scene.js";

export default abstract class Gameflow {
    protected gameData: GameData;
    protected scene: Scene;
    #eventHandlers: Map<string, (...args: any[]) => void> = new Map();

    constructor(gameData: GameData, scene: Scene) {
        this.gameData = gameData;
        this.scene = scene;

        this.#setupEventHandlers();
        this.#enterState(this.gameData.getCurrentState());
    }
    
    protected onEnterInit(): void {
        this.scene.showStartScreen();
    }

    protected onEnterStart(): void {
        this.startGame();
    }

    protected onEnterRound(roundNumber: number): void {
        this.startRound(roundNumber);
    }

    protected onEnterRoundResult(resultData?: any): void {
        this.showRoundResult(resultData);
    }

    protected onEnterEnd(result?: any, timescale?: number): void {
        this.showEndGame(result, timescale);
    }

    #enterState(stateName: GameStateName, ...args: any[]): void {
        console.log(`CURRENT GAMESTATE: ${stateName}`);
        switch (stateName) {
            case GameStates.INIT:
                this.onEnterInit();
                break;
            case GameStates.START:
                this.onEnterStart();
                break;
            case GameStates.ROUND:
                this.onEnterRound(args[0] as number);
                break;
            case GameStates.ROUND_RESULT:
                this.onEnterRoundResult(args[0]);
                break;
            case GameStates.END:
                this.onEnterEnd(args[0], args[1]);
                break;
        }
    }

    #changeState(newState: GameStateName, ...args: any[]): void {
        this.gameData.changeState(newState, { args });        
        this.#enterState(newState, ...args);
    }

    #setupEventHandlers(): void {
        const gameStartedHandler = () => {
            this.#changeState(GameStates.START);
        };
        this.#subscribe(GameEvents.GAME_STARTED, gameStartedHandler);

        const roundStartedHandler = (data: any) => {
            this.#changeState(GameStates.ROUND, data);
        };
        this.#subscribe(GameEvents.ROUND_STARTED, roundStartedHandler);

        const roundCompletedHandler = (data: any) => {
            this.#changeState(GameStates.ROUND_RESULT, data);
        };
        this.#subscribe(GameEvents.ROUND_COMPLETED, roundCompletedHandler);

        const gameEndHandler = (data: any) => {
            this.#changeState(GameStates.END, data);
        };
        this.#subscribe(GameEvents.GAME_END, gameEndHandler);

        this.setupCustomEventHandlers();
    }

    protected setupCustomEventHandlers(): void { }

    #subscribe(event: string, handler: (...args: any[]) => void): void {
        const eventEmitter = this.scene.app.stage;
        eventEmitter.on(event, handler);
        this.#eventHandlers.set(event, handler);
    }

    cleanupEventHandlers(): void {
        const eventEmitter = this.scene.app.stage;
        for (const [event, handler] of this.#eventHandlers) {
            eventEmitter.off(event, handler);
        }
        this.#eventHandlers.clear();
    }

    abstract startGame(): void;
    abstract startRound(roundNumber: number): void;
    abstract showRoundResult(...args: any[]): void;
    abstract showEndGame(result: any, timescale?: number): void;
}