# 軽量なAlpine Linuxベース
FROM node:22.15-alpine

# Node.jsとnpmのバージョンを固定
ARG NODE_VERSION=22.15.0
ARG NPM_VERSION=10.9.2

# 環境変数の設定
ENV NODE_ENV=development
ENV PATH=/app/node_modules/.bin:$PATH
ENV PORT=4545

# 作業ディレクトリを作成
WORKDIR /app

# 必要な依存関係をインストール（軽量化のため最小限）
RUN apk add --no-cache \
    git \
    bash \
    curl \
    && npm install -g npm@${NPM_VERSION} \
    && npm cache clean --force

# package.jsonとpackage-lock.jsonをコピー（キャッシュ効率化）
COPY package*.json ./

# 依存関係のインストール
RUN npm ci --only=production \
    && npm cache clean --force

# 非rootユーザーを作成（セキュリティ向上）
RUN addgroup -g 1001 -S notify_bot \
    && adduser -S notify_bot_user -u 1001 \
    && chown -R notify_bot_user:notify_bot /app

# アプリケーションファイルをコピー
COPY --chown=notify_bot_user:notify_bot main.mjs app/
COPY --chown=notify_bot_user:notify_bot lib app/
COPY --chown=notify_bot_user:notify_bot json app/

# 非rootユーザーに切り替え
USER notify_bot_user

# アプリケーション起動
CMD ["node", "main.mjs"]