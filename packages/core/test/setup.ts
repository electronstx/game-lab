import { MockedFunction, vi } from 'vitest';

vi.mock('pixi.js', async (importOriginal) => {
    const actual = await importOriginal<typeof import('pixi.js')>();
    return {
        ...actual,
        Application: vi.fn(),
    };
});

type MockHowlInstance = {
    play: MockedFunction<() => number>;
    stop: MockedFunction<() => void>;
    pause: MockedFunction<() => void>;
    mute: MockedFunction<(mute?: boolean) => void>;
    volume: MockedFunction<(volume?: number, id?: number) => number | void>;
    loop: MockedFunction<(loop?: boolean) => boolean | void>;
    unload: MockedFunction<() => void>;
    state: MockedFunction<() => 'unloaded' | 'loading' | 'loaded'>;
    playing: MockedFunction<(id?: number) => boolean>;
    once: MockedFunction<(event: string, listener: () => void, id?: number) => void>;
    off: MockedFunction<(event: string, listener?: () => void, id?: number) => void>;
    on: MockedFunction<(event: string, listener: () => void, id?: number) => void>;
};

type HowlConfig = {
    src: string[];
    loop: boolean;
    volume: number;
    onloaderror?: (id: number, error: Error) => void;
};

const mockHowlInstance: MockHowlInstance = {
    play: vi.fn(() => 1),
    stop: vi.fn(),
    pause: vi.fn(),
    mute: vi.fn(),
    volume: vi.fn(),
    loop: vi.fn(),
    unload: vi.fn(),
    state: vi.fn(() => 'loaded'),
    playing: vi.fn(() => true),
    once: vi.fn(),
    off: vi.fn(),
    on: vi.fn(),
};

// Create MockHowl as a constructor that returns mockHowlInstance
const MockHowl = vi.fn().mockImplementation(function MockHowl(this: any, config: HowlConfig) {
    return mockHowlInstance;
}) as unknown as MockedFunction<new (config: HowlConfig) => MockHowlInstance> & ((config: HowlConfig) => MockHowlInstance);

// Make it callable as a constructor
Object.setPrototypeOf(MockHowl, Function.prototype);

vi.mock('howler', () => ({
    Howl: MockHowl,
    Howler: {
        stop: vi.fn(),
        volume: vi.fn(),
    },
}));

export { mockHowlInstance, MockHowl, type HowlConfig };