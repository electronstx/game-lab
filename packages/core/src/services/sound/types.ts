export type SoundSettingsState = {
    sound: boolean;
    music: boolean;
};

export type SoundKey = string;

export type SoundType = 'effect' | 'music';

export type SoundConfig = {
    src: string;
    loop?: boolean;
    volume?: number;
};
