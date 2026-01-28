# Etapa 1: Construcción (Node.js)
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Argumentos de construcción (Vite necesita esto al hacer build)
ARG VITE_API_URL
ARG VITE_CHAT_URL
# Establecemos las variables de entorno
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_CHAT_URL=$VITE_CHAT_URL

RUN npm run build

# Etapa 2: Servidor Web (Nginx)
FROM nginx:alpine
# Copiamos los archivos construidos
COPY --from=build /app/dist /usr/share/nginx/html
# Copiamos la configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]