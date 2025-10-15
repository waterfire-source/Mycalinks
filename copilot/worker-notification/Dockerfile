FROM public.ecr.aws/docker/library/node:23.9.0-alpine as builder

# 必要なパッケージをインストール（alpineはapk）
RUN apk update && apk add --no-cache openssl bash curl
RUN apk add --no-cache \
chromium \
nss \
freetype \
harfbuzz \
ca-certificates \
ttf-freefont \
udev
WORKDIR /usr/app

COPY ./prod.npmrc ./.npmrc
RUN corepack enable && corepack prepare pnpm --activate
RUN npm i -g pm2
COPY ./package.json ./pnpm-workspace.yaml ./pnpm-lock.yaml ./


# [TODO] ワイルドカードでやりたい
COPY ./packages/backend-core/package.json ./packages/backend-core/tsconfig.json ./packages/backend-core/
COPY ./packages/common/package.json ./packages/common/tsconfig.json ./packages/common/
COPY ./configs ./configs
COPY ./envs ./envs
RUN pnpm i --frozen-lockfile

# puppeteerのchromeをインストール
RUN npx puppeteer browsers install chrome

COPY ./packages/common ./packages/common
RUN pnpm run build:common

COPY ./packages/backend-core ./packages/backend-core
RUN pnpm run prisma:generate
RUN pnpm run build:backend-core

# ここから特有の処理

COPY ./workers/notification/package.json ./workers/notification/tsconfig.json ./workers/notification/
RUN pnpm i --frozen-lockfile

COPY ./workers/notification ./workers/notification

WORKDIR /usr/app/workers/notification

RUN pnpm run build

FROM builder as develop
CMD pm2-runtime start npm -- run dev:start

FROM builder as staging
CMD pm2-runtime start npm -- run staging:start

FROM builder as customer
CMD pm2-runtime start npm -- run customer-prod:start

FROM builder as production
CMD pm2-runtime start npm -- run prod:start