import { GameData, GameStateName } from "@parity-games/core";

export default class RpsGameData extends GameData {
    #playerNickname: string = 'Player';
    #opponentNickname: string = 'Opponent';
    #playerScore: number = 0;
    #opponentScore: number = 0;
    #roundNumber: number = 0;

    constructor(gameSettings: any, initialState: GameStateName) {
        super(gameSettings, initialState);
    }

    public override getGameSettingsData(): any {}

    public override getRoundData(): any {}

    public override getRoundResultData(): any {}
    
    public override resetData(): void {}
}