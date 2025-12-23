import { safeCall } from '../../utils/safe-call';
import './FooterPanel.css';
import { SOCIAL_LINKS } from './types.js';

export const FooterPanel = () => {
    return (
        <div className="footer-panel">
            <div className="footer-panel-content">
                <div className="social-links">
                    {SOCIAL_LINKS.map((link) => (
                        <a
                            key={link.name}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-link"
                            aria-label={link.name}
                        >
                            <img
                                src={link.icon}
                                alt={link.name}
                                className="social-icon"
                                onError={(e) => {
                                    safeCall(
                                        () => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        },
                                        { component: 'FooterPanel', method: 'imageLoad' },
                                        true,
                                    );
                                }}
                            />
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};
