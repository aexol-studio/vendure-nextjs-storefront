ARG NODE_VER=20
FROM node:$NODE_VER-alpine AS base

USER node
WORKDIR /home/node

# 1. Install dependencies only when needed
FROM base AS deps

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
USER root
RUN apk add --no-cache libc6-compat
USER node

# Install dependencies based on the preferred package manager
COPY --chown=node:node package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN --mount=type=cache,target=/home/node/.npm,uid=1000,gid=1000 npm ci --prefer-offline

# 2. Rebuild the source code only when needed

FROM base AS builder

COPY --from=deps --chown=node:node /home/node/node_modules ./node_modules
COPY --chown=node:node . .

RUN --mount=type=cache,target=/home/node/.npm,uid=1000,gid=1000 yarn build \
  && rm -r .next/standalone/node_modules \
  && rm -r node_modules \
  && npm ci --omit-dev --prefer-offline

# 3. Production image, copy all the files and run next
FROM base AS runner

ENV NODE_ENV=production

COPY --from=builder --chown=node:node /home/node/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=node:node /home/node/node_modules ./node_modules
COPY --from=builder --chown=node:node /home/node/.next/standalone ./
COPY --from=builder --chown=node:node /home/node/.next/static ./.next/static

EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
