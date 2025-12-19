import { Button } from '../../shared/Button/Button.js';
import { safeCall } from '../../utils/safe-call.js';
import './SoundSettings.css';
import { SOUND_ASSETS, SoundSettingsProps } from './types.js';

export const SoundSettings = ({
    settings,
    onToggleSound,
    onToggleMusic
}: SoundSettingsProps) => {
    return (
        <div className="sound-settings">
            <Button
                className="sound-settings-button"
                size="medium"
                color="secondary"
                icon={
                    <img
                        src={settings.sound ? SOUND_ASSETS.soundOn : SOUND_ASSETS.soundOff}
                        alt={settings.sound ? "Sound On" : "Sound Off"}
                        className="sound-settings-icon"
                        onError={(e) => {
                            safeCall(
                                () => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                },
                                { component: 'SoundSettings', method: 'imageLoad' },
                                true
                            );
                        }}
                    />
                }
                onClick={() => safeCall(
                    () => onToggleSound(),
                    { component: 'SoundSettings', method: 'onToggleSound' },
                    false
                )}
            />
            <Button
                className="sound-settings-button"
                size="medium"
                color="secondary"
                icon={
                    <img
                        src={settings.music ? SOUND_ASSETS.musicOn : SOUND_ASSETS.musicOff}
                        alt={settings.music ? "Music On" : "Music Off"}
                        className="sound-settings-icon"
                        onError={(e) => {
                            safeCall(
                                () => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                },
                                { component: 'SoundSettings', method: 'imageLoad' },
                                true
                            );
                        }}
                    />
                }
                onClick={() => safeCall(
                    () => onToggleMusic(),
                    { component: 'SoundSettings', method: 'onToggleMusic' },
                    false
                )}
            />
        </div>
    );
};