import type { RpsGameSettings } from '../../../game/types';

export type RpsGameSettingsProps = {
    onStart: (settings: RpsGameSettings) => void | Promise<void>;
    disabled?: boolean;
};
