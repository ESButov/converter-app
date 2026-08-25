# Ветеринарный калькулятор

React + TypeScript + Vite приложение с набором ветеринарных калькуляторов.

## Локальная разработка

```bash
npm install
npm run dev
```

## Проверки

```bash
npm test
npm run lint
npm run build
```

## Деплой на GitHub Pages

В проект добавлен workflow `.github/workflows/deploy.yml`. Он запускается при push в `main` или `master`, а также вручную через `workflow_dispatch`. Workflow выполняет тесты, линт, сборку и публикует папку `dist` в GitHub Pages.

После первого push на GitHub нужно открыть настройки репозитория: `Settings` -> `Pages` -> `Build and deployment` -> `Source` -> `GitHub Actions`.

`vite.config.ts` автоматически выбирает корректный `base`:

- локально используется `/`;
- в GitHub Actions путь берется из имени репозитория, например `/converter-app/`;
- для ручной проверки можно переопределить путь:

```bash
VITE_BASE_PATH=/converter-app/ npm run build
```

Клиентская навигация работает через hash-router, поэтому прямые ссылки на страницы будут выглядеть в формате `https://<user>.github.io/<repo>/#/calculation/echo`.
