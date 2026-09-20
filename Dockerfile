FROM node:24-alpine AS builder
WORKDIR /app

# Declare the build argument
ARG VITE_BASE_PATH=/

COPY package*.json ./
RUN npm ci

COPY . .

# Set env var for Vite build step using the ARG
ENV VITE_BASE_PATH=${VITE_BASE_PATH}
RUN npm run build

FROM nginx:alpine AS runtime

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
