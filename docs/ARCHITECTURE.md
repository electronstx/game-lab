# Архитектура Game Lab

## Обзор

Проект использует комбинированную архитектуру:

### Игровая логика (Core)
- **MVP (Model-View-Presenter)** - для управления состоянием и потоком игры
  - **Model**: `GameData` - управление состоянием игры
  - **View**: `Scene` - представление на основе PixiJS
  - **Presenter**: `Gameflow` - управление потоком и обработка событий

### UI (React)
- **Feature-Sliced Design (FSD)** - для организации React компонентов
  - **Features** - бизнес-фичи (CreateForm, HeaderPanel, GameContainer и т.д.)
  - **Shared** - переиспользуемые компоненты (Button, ErrorBoundary и т.д.)
  - **Utils** - утилиты

### Игровые объекты
- **Manager Pattern** - для управления жизненным циклом игровых объектов
  - `GameObjects` - контейнер для управления коллекцией объектов
  - `GameObject` - интерфейс с методами жизненного цикла (create, show, hide, update, reset, destroy)

## Ключевые паттерны проектирования

### Архитектурные паттерны

#### MVP (Model-View-Presenter)
Разделение ответственности между слоями:
- **Model** (`GameData`) - управление состоянием и данными игры
- **View** (`Scene`) - представление на основе PixiJS Container
- **Presenter** (`Gameflow`) - координация между Model и View, обработка бизнес-логики

#### Feature-Sliced Design (FSD)
Организация React компонентов по слоям:
- **Features** - бизнес-фичи (CreateForm, HeaderPanel, GameContainer)
- **Shared** - переиспользуемые компоненты (Button, ErrorBoundary)
- **Utils** - вспомогательные функции

### Поведенческие паттерны

#### Finite State Machine (FSM)
Управление состояниями игры:
- `GameData` хранит текущее состояние и историю переходов
- `Gameflow` обрабатывает переходы между состояниями (INIT → START → ROUND → ROUND_RESULT → END)
- Состояния определены в `GameStates` и валидируются при переходах

#### Observer / Event Emitter
Коммуникация между компонентами через систему событий:
- `EventEmitter` интерфейс (on, off, emit, once)
- `Gameflow` подписывается на события и реагирует на них
- Типизированные события игры (GameInitEvent, GameStartedEvent, RoundStartedEvent и т.д.)
- `SoundService.subscribe()` для подписки на изменения настроек звука

#### Template Method
Абстрактные классы определяют структуру алгоритма:
- `GameData` - абстрактные методы: `getGameData()`, `getRoundData()`, `resetData()`
- `Gameflow` - абстрактные методы: `startGame()`, `startRound()`, `showRoundResult()` и т.д.
- `Scene` - абстрактные методы: `create()`, `showStartScreen()`, `showRound()` и т.д.
- Дочерние классы реализуют конкретную логику

### Структурные паттерны

#### Adapter
Адаптация внешних интерфейсов:
- `Scene.getEventEmitter()` адаптирует PIXI.Application stage к интерфейсу `EventEmitter`
- Позволяет использовать систему событий PixiJS через единый интерфейс

#### Composite
Управление коллекциями объектов через единый интерфейс:
- `HUD` - коллекция `HUDComponent` с методами create, show, hide, destroy
- `GameObjects` - коллекция `GameObject` с методами create, show, hide, update, reset, destroy
- Единообразная работа с отдельными объектами и их группами

#### Facade
Упрощенный интерфейс к сложной подсистеме:
- `Scene` предоставляет упрощенный интерфейс для работы с `HUD`, `AnimationManager`, `GameObjects`, `SoundService`
- Скрывает сложность взаимодействия между компонентами

### Паттерны создания объектов

#### Factory Function
Создание объектов через функции:
- `createSoundService()` - создание экземпляра SoundService
- Инкапсуляция логики создания и инициализации

#### Dependency Injection
Зависимости передаются извне:
- `SoundService` передается через конструкторы (`Game`, `Scene`, `Gameflow`)
- Упрощает тестирование и обеспечивает слабую связанность

### Специфичные паттерны

#### Custom Hooks Pattern (React)
Инкапсуляция логики в переиспользуемые хуки:
- `useRpsGame`, `useBowlingGame` - управление жизненным циклом игры
- `useSoundSettings` - управление настройками звука
- Изоляция side effects и состояния

#### Manager Pattern
Централизованное управление коллекциями:
- `GameObjects` - управление игровыми объектами
- `HUD` - управление компонентами интерфейса
- `AnimationManager` - управление анимациями
- Единая точка управления жизненным циклом

#### Type Guards
Type narrowing для TypeScript:
- `isRoundCompletedEvent()`, `isGameEndEvent()` в `utils/guards.ts`
- Безопасная проверка типов во время выполнения

#### Safe Wrapper Pattern
Безопасное выполнение операций с обработкой ошибок:
- `safeCleanup()` - безопасная очистка ресурсов
- `safeCall()`, `safeCallAsync()` - безопасное выполнение функций
- Предотвращение падений при ошибках очистки

## Структура пакетов

### @game-lab/core

Ядро игрового движка, предоставляющее:

#### Data Layer (Model)
- **GameData** - абстрактный класс для управления состоянием игры
- **GameStates** - константы состояний игры (INIT, START, ROUND, etc.)
- **EventEmitter** - система событий для коммуникации между компонентами

#### Flow Layer (Presenter)
- **Gameflow** - абстрактный презентер, управляющий потоком игры
  - Обрабатывает переходы между состояниями
  - Управляет событиями игры
  - Координирует взаимодействие между Model и View

#### View Layer
- **Scene** - базовый класс сцены на основе PixiJS Container
- **HUD** - система интерфейса (Head-Up Display)
- **AnimationManager** - менеджер анимаций
- **GameObjects** - менеджер игровых объектов (Manager Pattern)

#### Services
- **SoundService** - сервис для управления звуками и музыкой

### @game-lab/ui

React компоненты, организованные по **Feature-Sliced Design**:

#### Features (Бизнес-фичи)
- **CreateForm** - форма создания/настройки игры
- **FooterPanel** - нижняя панель
- **GameContainer** - контейнер для игрового canvas
- **HeaderPanel** - верхняя панель с заголовком
- **SoundSettings** - настройки звука

#### Shared (Переиспользуемые компоненты)
- **Button** - кнопка
- **ButtonGroup** - группа кнопок
- **ErrorBoundary** - обработка ошибок React

#### Utils
- Вспомогательные функции

### @game-lab/errors

Централизованная система обработки ошибок:
- Типизированные классы ошибок (GameError, InitializationError, StateError, ValidationError)
- Обработчики ошибок с разными уровнями серьезности
- Категоризация ошибок

## Структура игр

Каждая игра следует единой структуре:

```
games/[game-name]/src/
├── components/
│ ├── game/ # Игровая логика (MVP)
│ │ ├── data/ # Model (GameData)
│ │ ├── flow/ # Presenter (Gameflow)
│ │ ├── view/ # View (Scene)
│ │ │ ├── animations/
│ │ │ ├── game-objects/
│ │ │ └── hud/
│ │ ├── Game.ts # Главный класс игры
│ │ └── types.ts
│ └── ui/ # UI компоненты (FSD)
│ └── features/ # Специфичные для игры фичи
├── utils/
│ └── hooks/ # React хуки
└── [Game]Page.tsx # Главный React компонент
```

## Поток данных

```
React Component (UI) [FSD]
↓
Game (init, start, destroy)
↓
Gameflow (Presenter) ← → GameData (Model)
↓
Scene (View) → PixiJS Rendering
↓
GameObjects (Manager) → GameObject instances
```

## Система событий

Игры используют систему событий для коммуникации между компонентами:
- `GameInitEvent` - инициализация игры
- `GameStartedEvent` - начало игры
- `RoundStartedEvent` - начало раунда
- `RoundCompletedEvent` - завершение раунда
- `GameEndEvent` - окончание игры
- `GameRestartedEvent` - перезапуск игры

## Состояния игры

Стандартные состояния (определены в `GameStates`):
- `INIT` - начальное состояние
- `START` - игра запущена
- `ROUND` - активный раунд
- `ROUND_RESULT` - результат раунда
- `END` - окончание игры
- `RESTART` - перезапуск

## Управление игровыми объектами

Игровые объекты реализуют интерфейс `GameObject` и управляются через `GameObjects` менеджер:

```typescript
interface GameObject {
  create(...args: any[]): void;
  show?(): void;
  hide?(): void;
  update?(): void;
  reset?(): void;
  destroy?(): void;
}
```

Менеджер обеспечивает централизованное управление жизненным циклом всех объектов на сцене.