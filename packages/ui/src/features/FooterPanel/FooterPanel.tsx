import './FooterPanel.css';
import { SOCIAL_LINKS } from './types';

export const FooterPanel = () => {
    return (
        <div className='footer-panel'>
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
                            />
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}