# 軽量なAlpine Linuxベースイメージを使用
FROM alpine:3.21

# Terraformのバージョンを指定（必要に応じて変更）
ARG TERRAFORM_VERSION=1.6.6

# 必要な依存関係をインストール
RUN apk add --no-cache \
    curl \
    unzip \
    ca-certificates \
    git \
    bash

# Terraformをダウンロードしてインストール
RUN curl -fsSL "https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip" -o terraform.zip && \
    unzip terraform.zip && \
    mv terraform /usr/local/bin/ && \
    rm terraform.zip

# 作業ディレクトリを設定
WORKDIR /workspace

# 非rootユーザーを作成（セキュリティ向上）
RUN addgroup -g 1000 terraform && \
    adduser -D -s /bin/bash -u 1000 -G terraform terraform_user && \
    chown -R terraform_user:terraform /workspace

# 非rootユーザーに切り替え
USER terraform_user

# ワークスペースに
COPY --chown=terraform_user:terraform notify-bot.tf /workspace/
COPY --chown=terraform_user:terrafrom public.pem /workspace/

# Terraformのバージョン確認
RUN terraform version

CMD ["terraform", "--help"]