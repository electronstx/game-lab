export type GameObject = {
    create(...args: any[]): void;
    show?: () => void;
    hide?: () => void;
    update?: () => void;
    reset?: () => void;
    destroy?: () => void;
};
