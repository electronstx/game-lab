import soundOnIcon from '../../assets/sound-on.png';
import soundOffIcon from '../../assets/sound-off.png';
import musicOnIcon from '../../assets/music-on.png';
import musicOffIcon from '../../assets/music-off.png';

export type SoundSettingsProps = {
    settings: SoundSettingsState;
    onToggleSound: () => void;
    onToggleMusic: () => void;
}

export type SoundSettingsState = {
    sound: boolean;
    music: boolean;
}

export const SOUND_ASSETS = {
    soundOn: soundOnIcon,
    soundOff: soundOffIcon,
    musicOn: musicOnIcon,
    musicOff: musicOffIcon,
} as const;