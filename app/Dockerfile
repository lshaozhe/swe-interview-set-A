FROM node:latest

WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["npx", "tsx", "src/server/main.ts"]
