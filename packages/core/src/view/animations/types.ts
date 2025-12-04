export type GameAnimation = {
    create: (...args: any[]) => void;
    reset: () => void;
    show: (...args: any[]) => void;
    destroy?: () => void;
};