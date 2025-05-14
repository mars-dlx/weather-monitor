FROM node:22-alpine AS builder

RUN apk add --no-cache git

WORKDIR /app

COPY package*.json .
RUN npm ci

COPY . .

RUN npm run lint
# RUN npm run test

RUN npm run build
RUN cp ./dist/version.json .
RUN npm run web:build

FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

RUN npm ci --omit=dev

ENV NODE_ENV=production
CMD ["node", "dist/api/src/index.js"]
