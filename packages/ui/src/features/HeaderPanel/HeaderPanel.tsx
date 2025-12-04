import { HeaderPanelProps } from './types';
import './HeaderPanel.css';

export const HeaderPanel = (props: HeaderPanelProps) => {

    return (
        <div className="header-panel">
            <h1>{props.title}</h1>
            <div className="header-panel-actions">
                {props.children}
            </div>
        </div>
    );
}