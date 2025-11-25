import Model from "../data/game-data.js";
import Scene from "../view/scene.js";

export default abstract class Gameflow {
    protected model: Model;
    protected scene: Scene;

    constructor(model: Model, scene: Scene) {
        this.model = model;
        this.scene = scene;
    }  

    public abstract configureData(): void;

    public abstract startGame(): void;

    public abstract startRound(roundNumber: number): void;

    public abstract showRoundResult(...args: any[]): void;

    public abstract showEndGame(result: any, timescale?: number): void;
}