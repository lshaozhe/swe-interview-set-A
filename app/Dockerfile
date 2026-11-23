# INTERVIEWER-ANNOTATION-START
# [CL-13 · T1 · security] Unpinned latest image, runs as root, installs everything, no multi-stage build or .dockerignore.
#     Look near: FROM node:latest
# INTERVIEWER-ANNOTATION-END
FROM node:latest

WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["npx", "tsx", "src/server/main.ts"]
