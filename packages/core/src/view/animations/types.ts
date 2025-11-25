export type GameAnimation = {
    create: () => void;
    reset: () => void;
    show: (...args: any[]) => void;
};