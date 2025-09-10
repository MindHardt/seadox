FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r --filter=seadox-shared build --outDir /prod/shared
RUN pnpm run -r --filter=!seadox-shared build
RUN pnpm deploy --filter=seadox-ws --prod /prod/ws
RUN pnpm deploy --filter=seadox-web --prod /prod/web

FROM base AS ws
COPY --from=build /prod/ws /prod/ws
COPY --from=build /prod/shared/ /prod/ws/node_modules/seadox-shared
WORKDIR /prod/ws
EXPOSE 1234
CMD [ "pnpm", "start" ]

FROM base AS web
COPY --from=build /prod/web /prod/web
COPY --from=build /prod/shared/ /prod/web/node_modules/seadox-shared
WORKDIR /prod/web
EXPOSE 3000
CMD [ "pnpm", "start" ]