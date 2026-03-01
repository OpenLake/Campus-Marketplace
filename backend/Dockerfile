FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev for nodemon)
RUN npm install

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p public/temp

EXPOSE 5000

# Start with nodemon for development
CMD ["npm", "run", "start"]
