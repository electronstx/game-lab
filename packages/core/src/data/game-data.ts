export default abstract class GameData {
    protected gameSettings: any;

    constructor(gameSettings: any) {
        this.gameSettings = gameSettings;
    }

    public abstract getHUDData(): any;

    public abstract getRoundData(): any;

    public abstract getRoundResultData(): any;
    
    public abstract resetData(): void;
}