# Руководство по разработке

## Создание новой игры

### Шаг 1: Структура проекта

Создайте новую папку в `games/` со следующей структурой:

games/your-game/
├── src/
│ ├── components/
│ │ └── game/
│ │ ├── data/
│ │ │ └── your-game-data.ts # extends GameData
│ │ ├── flow/
│ │ │ └── your-gameflow.ts # extends Gameflow
│ │ ├── view/
│ │ │ └── your-scene.ts # extends Scene
│ │ ├── Game.ts # implements Game
│ │ └── types.ts
│ ├── utils/
│ │ └── hooks/
│ │ └── useYourGame.ts
│ └── YourGamePage.tsx
├── package.json
└── vite.config.ts


### Шаг 2: Настройка package.json

{
  "name": "@game-lab/your-game",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "biome check ."
  },
  "dependencies": {
    "gsap": "^3.13.0",
    "howler": "^2.2.4",
    "pixi.js": "^8.14.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@game-lab/core": "workspace:*",
    "@game-lab/ui": "workspace:*"
  }
}

### Шаг 3: Реализация GameData

import GameData from '@game-lab/core';
import { GameStates } from '@game-lab/core';

export default class YourGameData extends GameData {
  // Ваши игровые данные
  protected score: number = 0;

  constructor() {
    super(GameStates.INIT);
  }

  // Реализуйте методы для управления состоянием игры
}

### Шаг 4: Реализация Scene

import Scene from '@game-lab/core';
import * as PIXI from 'pixi.js';
import { SoundService } from '@game-lab/core';

export default class YourScene extends Scene {
  constructor(app: PIXI.Application, soundService: SoundService, scale: number) {
    super(app, soundService, scale);
    // Инициализация игровых объектов
  }

  override async create(): Promise<void> {
    // Создание сцены
  }

  override destroy(): void {
    // Очистка ресурсов
  }
}

### Шаг 5: Реализация Gameflow

import Gameflow from '@game-lab/core';
import YourGameData from './data/your-game-data';
import YourScene from './view/your-scene';

export default class YourGameflow extends Gameflow {
  protected gameData: YourGameData;
  protected scene: YourScene;

  setGameSettings(gameSettings: YourGameSettings): void {
    // Настройка игры
  }

  startGame(): void {
    // Запуск игры
  }

  startRound(): void {
    // Запуск раунда
  }

  showRoundResult(...args: unknown[]): void {
    // Показ результата раунда
  }

  showEndGame(result: unknown, timescale?: number): void {
    // Показ окончания игры
  }

  restartGame(): void {
    // Перезапуск игры
  }
}

### Шаг 6: Реализация Game

import { Application } from 'pixi.js';
import { SoundService } from '@game-lab/core';
import { Game } from './types';

export class YourGame implements Game {
  #app: Application | null = null;
  #gameScene: YourScene | null = null;
  #gameData: YourGameData | null = null;
  #gameflow: YourGameflow | null = null;
  #soundService: SoundService;

  constructor(soundService: SoundService) {
    this.#soundService = soundService;
  }

  async init(parent: HTMLDivElement): Promise<YourGame> {
    // Инициализация PixiJS приложения
    // Создание сцены, данных, gameflow
    return this;
  }

  destroy(): void {
    // Очистка всех ресурсов
  }
}

### Шаг 7: React компонент

import { useYourGame } from './utils/hooks/useYourGame';
import { GameContainer, HeaderPanel } from '@game-lab/ui';

export const YourGamePage = () => {
  const { containerRef, startGame, isGameStarted } = useYourGame();

  return (
    <>
      <HeaderPanel title="Your Game" />
      <GameContainer containerRef={containerRef} />
    </>
  );
};

## Тестирование

### Запуск тестов Core пакета

```bash
cd packages/core
pnpm test
```

### Покрытие тестами

```bash
cd packages/core
pnpm test:coverage
```

## Линтинг

```bash
# Проверка всего проекта
pnpm -r run lint

# Проверка конкретного пакета/игры
cd packages/core
pnpm lint
```

## Сборка

```bash
# Сборка всех пакетов
pnpm ci:build

# Сборка конкретного пакета
cd packages/core
pnpm build
```