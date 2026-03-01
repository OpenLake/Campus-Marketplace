# Use Node.js
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Vite dev server runs on 5173 by default
EXPOSE 4173

# Run dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]