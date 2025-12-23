# @game-lab/errors

Централизованная система обработки ошибок для игр.

## Основные классы ошибок

- **GameError** - базовый класс для всех игровых ошибок
- **InitializationError** - ошибки инициализации
- **StateError** - ошибки состояний
- **ValidationError** - ошибки валидации

## Использование

```typescript
import {
  GameError,
  InitializationError,
  handleError,
  handleErrorSilently
} from '@game-lab/errors';

// Создание ошибки
const error = new InitializationError(
  'Failed to initialize game',
  { component: 'Game', method: 'init' }
);

// Обработка ошибки
handleError(error);

// Тихая обработка (не бросает исключение)
handleErrorSilently(error);
```

## Категории и уровни серьезности

### ErrorCategory
- `INITIALIZATION` - ошибки инициализации
- `STATE` - ошибки состояний
- `VALIDATION` - ошибки валидации
- `RUNTIME` - ошибки выполнения

### ErrorSeverity
- `CRITICAL` - критическая ошибка
- `HIGH` - высокая серьезность
- `MEDIUM` - средняя серьезность
- `LOW` - низкая серьезность