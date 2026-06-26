FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production || npm install
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 10000
ENV PORT=10000
ENV NODE_ENV=production
CMD ["npm", "run", "start"]
