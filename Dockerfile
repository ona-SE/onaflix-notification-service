FROM node:20.20.2-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

EXPOSE 3004

USER node

CMD ["node", "src/index.js"]
