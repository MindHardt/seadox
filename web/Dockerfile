FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ARG VITE_WS_URL
ARG VITE_ZITADEL_URL
ARG NODE_ENV=production

RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r --filter=seadox-shared build --outDir /prod/shared
RUN pnpm run -r --filter=seadox-web build -m $NODE_ENV
RUN pnpm deploy --filter=seadox-web --prod /prod/web

FROM base AS web
COPY --from=build /prod/web /prod/web
COPY --from=build /prod/shared/ /prod/web/node_modules/seadox-shared
WORKDIR /prod/web
EXPOSE 3000
CMD [ "pnpm", "start" ]