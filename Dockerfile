FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r build
RUN pnpm deploy --legacy --filter=seadox-ws --prod /prod/ws
RUN pnpm deploy --legacy --filter=seadox-web --prod /prod/web

FROM base AS ws
COPY --from=build /prod/ws /prod/ws
WORKDIR /prod/ws
EXPOSE 1234
CMD [ "pnpm", "start" ]

FROM base AS web
COPY --from=build /prod/web /prod/web
WORKDIR /prod/web
EXPOSE 3000
CMD [ "pnpm", "start" ]