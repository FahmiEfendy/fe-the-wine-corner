# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --include=dev
COPY . .
RUN npm run build

# Production stage
FROM nginx:stable-alpine
# Copy build files into nginx root so the site is served correctly.
COPY --from=build /app/dist /usr/share/nginx/html
# Add nginx configuration to handle SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
