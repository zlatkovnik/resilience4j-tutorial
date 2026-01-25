# Frontend Dockerfile
FROM node:20 AS build
WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY package.json .
RUN npm install --omit=dev
EXPOSE 3000
CMD ["npx", "serve", "./dist", "-l", "3000"]
