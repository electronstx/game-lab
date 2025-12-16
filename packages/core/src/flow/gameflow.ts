import { ErrorCategory, ErrorSeverity, GameError, handleError, handleErrorSilently, InitializationError, StateError } from "@parity-games/errors";
import { GameEndEvent, GameEvents, EventEmitter, RoundCompletedEvent, RoundStartedEvent } from "../data/events.js";
import GameData from "../data/game-data.js";
import { GameStateName, GameStates, StateEnterData } from "../data/types.js";
import { isGameEndEvent, isRoundCompletedEvent } from "../utils/guards.js";
import Scene from "../view/scene.js";
import { safeCleanup } from "../utils/cleanup.js";

export default abstract class Gameflow {
    protected gameData: GameData;
    protected scene: Scene;
    #eventHandlers: Map<string, (...args: unknown[]) => void> = new Map();
    #eventEmitter: EventEmitter;

    constructor(gameData: GameData, scene: Scene) {
        this.gameData = gameData;
        this.scene = scene;
        try {
            this.#eventEmitter = scene.getEventEmitter();
        } catch (error) {
            const initializationError = new InitializationError(
                'Failed to get event emitter from scene',
                { component: 'Gameflow', method: 'constructor', originalError: error }
            );
            handleError(initializationError);
            throw initializationError;
        }

        this.#setupEventHandlers();
        this.#enterState(this.gameData.getCurrentState());
    }

    protected onEnterInit(): void {
        this.scene.showStartScreen();
    }

    protected onEnterStart(): void {
        this.startGame();
    }

    protected onEnterRound(): void {
        this.startRound();
    }

    protected onEnterRoundResult(resultData?: unknown): void {
        this.showRoundResult(resultData);
    }

    protected onEnterEnd(result?: unknown, timescale?: number): void {
        this.showEndGame(result, timescale);
    }

    protected onEnterRestart(): void {
        this.restartGame();
    }

    #enterState(stateName: GameStateName, data?: StateEnterData): void {
        try {
            switch (stateName) {
                case GameStates.INIT:
                    this.onEnterInit();
                    break;
                case GameStates.START:
                    this.onEnterStart();
                    break;
                case GameStates.ROUND:
                    this.onEnterRound();
                    break;
                case GameStates.ROUND_RESULT:
                    this.onEnterRoundResult(data?.resultData);
                    break;
                case GameStates.END:
                    this.onEnterEnd(data?.result, data?.timescale);
                    break;
                case GameStates.RESTART:
                    this.onEnterRestart();
                    break;
            }
        } catch (error) {
            const stateError = new StateError(
                `Failed to enter state "${stateName}"`,
                stateName,
                { component: 'Gameflow', method: '#enterState', originalError: error }
            );
            handleError(stateError);
        }
    }

    #changeState(newState: GameStateName, data?: StateEnterData): void {
        try {
            this.gameData.changeState(newState, data ? { stateData: data } : undefined);
            this.#enterState(newState, data);
        } catch (error) {
            const stateError = new StateError(
                `Failed to change state to "${newState}"`,
                newState,
                { component: 'Gameflow', method: '#changeState', originalError: error }
            );
            handleError(stateError);
        }
    }

    #setupEventHandlers(): void {
        const gameInitHandler = () => {
            this.#changeState(GameStates.INIT);
        };
        this.subscribe(GameEvents.GAME_INIT, gameInitHandler);

        const gameStartedHandler = () => {
            this.#changeState(GameStates.START);
        };
        this.subscribe(GameEvents.GAME_STARTED, gameStartedHandler);

        const roundStartedHandler = () => {
            this.#changeState(GameStates.ROUND);
        };
        this.subscribe(GameEvents.ROUND_STARTED, roundStartedHandler);

        const roundCompletedHandler = (...args: unknown[]) => {
            const data = args[0];

            if (isRoundCompletedEvent(data)) {
                this.#changeState(GameStates.ROUND_RESULT, { resultData: data.payload });
                return;
            }

            if (typeof data === 'string' || (typeof data === 'object' && data !== null)) {
                const roundNumber = this.gameData.getRoundData();
                this.#changeState(GameStates.ROUND_RESULT, {
                    resultData: typeof data === 'string'
                        ? { playerMove: data, roundNumber }
                        : { ...data, roundNumber }
                });
                return;
            }
        };
        this.subscribe(GameEvents.ROUND_COMPLETED, roundCompletedHandler);

        const gameEndHandler = (...args: unknown[]) => {
            const data = args[0];

            if (isGameEndEvent(data)) {
                const payload = data.payload && typeof data.payload === 'object' ? data.payload : {};
                this.#changeState(GameStates.END, {
                    result: 'result' in payload ? payload.result : data,
                    timescale: 'timescale' in payload && typeof payload.timescale === 'number'
                        ? payload.timescale
                        : undefined
                });
                return;
            }

            if (data !== undefined) {
                this.#changeState(GameStates.END, { result: data });
            }
        };
        this.subscribe(GameEvents.GAME_END, gameEndHandler);

        const gameRestartedHandler = () => {
            this.#changeState(GameStates.RESTART);
        };
        this.subscribe(GameEvents.GAME_RESTARTED, gameRestartedHandler);

        this.setupCustomEventHandlers();
    }

    protected setupCustomEventHandlers(): void { }

    protected subscribe(event: string, handler: (...args: unknown[]) => void): void {
        const wrappedHandler = (...args: unknown[]) => {
            try {
                handler(...args);
            } catch (error) {
                const gameError = new GameError(
                    `Error in event handler for "${event}"`,
                    ErrorSeverity.HIGH,
                    ErrorCategory.EVENT,
                    { component: 'Gameflow', method: 'subscribe', event, originalError: error },
                    true
                );
                handleError(gameError);
            }
        };

        const oldHandler = this.#eventHandlers.get(event);
        if (oldHandler) {
            this.#eventEmitter.off(event, oldHandler);
        }
        this.#eventEmitter.on(event, wrappedHandler);
        this.#eventHandlers.set(event, wrappedHandler);
    }

    protected emit(event: string, ...args: unknown[]): void {
        if (!this.#eventEmitter) return;

        this.#eventEmitter.emit(event, ...args);
    }

    cleanupEventHandlers(): void {
        for (const [event, handler] of this.#eventHandlers) {
            safeCleanup(
                `event handler for "${event}"`,
                () => this.#eventEmitter.off(event, handler),
                'Gameflow',
                'cleanupEventHandlers'
            );
        }
        this.#eventHandlers.clear();
    }

    destroy(): void {
        this.cleanupEventHandlers();

        this.#eventEmitter = null as unknown as EventEmitter;
        this.gameData = null as unknown as GameData;
        this.scene = null as unknown as Scene;
    }

    abstract setGameSettings(gameSettings: unknown): void;
    abstract startGame(): void;
    abstract startRound(): void;
    abstract showRoundResult(...args: unknown[]): void;
    abstract showEndGame(result: unknown, timescale?: number): void;
    abstract restartGame(): void;
}