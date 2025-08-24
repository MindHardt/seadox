# Seadox
// TODO: сделать описание
w
## Локальная разработка:
```shell
pnpm -r dev
```

## Сборка докер образов
web:
```shell
docker build -t un1ver5e/seadox-web --target web --push .
```
ws:
```shell
docker build -t un1ver5e/seadox-ws --target ws --push .
```