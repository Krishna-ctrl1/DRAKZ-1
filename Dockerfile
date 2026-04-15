FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application
COPY . .

# Build the frontend (since it's a Vite + Express project, the frontend needs building)
# If frontend build is failing due to devDependencies, we might need full install
RUN npm install
RUN npm run build

# Expose the API port
EXPOSE 3001

# Command to run the application
CMD ["npm", "run", "server-prod"]
