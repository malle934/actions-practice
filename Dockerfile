FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --omit=dev
COPY app.js db.js server.js ./
EXPOSE 3000
CMD ["node", "server.js"]
