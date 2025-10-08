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

RUN apk add --no-cache \
  font-noto \
  font-noto-cjk \
  fontconfig

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

COPY ./packages/api-generator/package.json ./packages/api-generator/tsconfig.json ./packages/api-generator/
RUN pnpm i --frozen-lockfile
COPY ./packages/api-generator ./packages/api-generator

COPY ./packages/web-app/package.json ./packages/web-app/tsconfig.json ./packages/web-app/
RUN pnpm i --frozen-lockfile
COPY ./packages/web-app ./packages/web-app

WORKDIR /usr/app/packages/web-app

# 念の為ボリューム用のフォルダを明示的に作成
RUN mkdir -p /usr/app/packages/web-app/uploaded
# RUN npm ci
# RUN npm run prisma:generate

FROM builder as develop

WORKDIR /usr/app/packages/api-generator
RUN pnpm dev:api:generate
WORKDIR /usr/app/packages/web-app
RUN npm run develop:build

EXPOSE 3000

CMD ["pm2-runtime","start","npm","--","run","develop:start"]


# CMD ["npm", "run", "dev"]


FROM builder as staging

WORKDIR /usr/app/packages/api-generator
RUN pnpm stg:api:generate
WORKDIR /usr/app/packages/web-app
RUN npm run staging:build

EXPOSE 3000

CMD ["pm2-runtime","start","npm","--","run","staging:start"]


FROM builder as production

WORKDIR /usr/app/packages/api-generator
RUN pnpm prod:api:generate
WORKDIR /usr/app/packages/web-app
RUN npm run build
EXPOSE 3000

CMD cd /usr/app && pnpm dbDeploy && cd /usr/app/packages/web-app && pm2-runtime start npm -- run start


FROM builder as public

WORKDIR /usr/app/packages/api-generator
RUN pnpm public-prod:api:generate
WORKDIR /usr/app/packages/web-app
RUN npm run public-prod:build
EXPOSE 3000

CMD ["pm2-runtime","start","npm","--","run","public-prod:start"]


FROM builder as customer

WORKDIR /usr/app/packages/api-generator
RUN pnpm customer-prod:api:generate
WORKDIR /usr/app/packages/web-app
RUN npm run customer-prod:build
EXPOSE 3000

CMD ["pm2-runtime","start","npm","--","run","customer-prod:start"]