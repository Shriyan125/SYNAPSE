FROM node:20-alpine

WORKDIR /app

# Install dependencies first (leverage Docker layer caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy source code and database migrations/seeds
COPY . .
COPY ../db /db

ENV NODE_ENV=production
ENV PORT=5001

EXPOSE 5001

CMD ["node", "src/server.js"]
