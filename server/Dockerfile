# Base
FROM node:14.15.4-alpine3.12 AS base
WORKDIR /app
COPY package*.json ./
RUN npm install && npm cache clean --force
COPY . .
RUN npm run build

# Build
FROM node:14.15.4-alpine3.12 AS build
WORKDIR /app
COPY --from=base /app/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Release
FROM node:14.15.4-alpine3.12 AS release
RUN apk add dumb-init
USER node
WORKDIR /app
COPY --chown=node:node --from=build /app/package*.json ./
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=base /app/dist ./dist
CMD [ "dumb-init", "node", "./dist/server.js" ]
