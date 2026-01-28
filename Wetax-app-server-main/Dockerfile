# Step 1: Use an official Node.js runtime as a base
FROM node:24-slim

# Step 2: Set working directory
WORKDIR /usr/src/app

# Step 3: Install system dependencies (needed for pdf-poppler and other tools)
RUN apt-get update && apt-get install -y \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Step 4: Copy package.json and lock files first (for caching)
COPY package*.json ./

# Step 5: Install dependencies
RUN npm install --legacy-peer-deps

# Step 6: Copy the rest of the app
COPY . .

# Step 7: Build the app (runs tsoa + tsc)
RUN npm run build

# Step 8: Start the app
CMD ["npm", "start"]
