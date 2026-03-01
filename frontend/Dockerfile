# Stage 1: Build React App
FROM node:18-alpine AS builder

WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
RUN npm run build


# Stage 2: Serve with lightweight server
FROM node:18-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/build ./build

EXPOSE 8501

CMD ["serve", "-s", "build", "-l", "8501"]
