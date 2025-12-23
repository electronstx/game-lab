# @game-lab/ui

Библиотека общих React компонентов для игр.

## Компоненты

### Features

- **CreateForm** - форма создания/настройки игры
- **FooterPanel** - нижняя панель
- **GameContainer** - контейнер для игрового canvas
- **HeaderPanel** - верхняя панель с заголовком
- **SoundSettings** - настройки звука

### Shared

- **Button** - кнопка
- **ButtonGroup** - группа кнопок
- **ErrorBoundary** - обработка ошибок React

## Использование

\`\`\`typescript
import {
  GameContainer,
  HeaderPanel,
  FooterPanel,
  SoundSettings,
  CreateForm,
  ErrorBoundary
} from '@game-lab/ui';
import '@game-lab/ui/style.css';
\`\`\`

## Пример

\`\`\`tsx
import { GameContainer, HeaderPanel } from '@game-lab/ui';

export const GamePage = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <HeaderPanel title="My Game" />
      <GameContainer containerRef={containerRef} />
    </>
  );
};
\`\`\`
