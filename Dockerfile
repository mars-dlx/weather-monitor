FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY .eslint.config.mjs ./
COPY .prettierrc ./
COPY ./src ./src

RUN npm install

RUN npm run lint
# RUN npm run test

RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

RUN npm install --omit=dev

ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
