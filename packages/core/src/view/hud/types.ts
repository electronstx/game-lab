export type HUDComponent = {
    create(scale: number, ...args: any[]): void;
    show(...args: any[]): void;
    hide(): void;
    destroy?: () => void;
};
