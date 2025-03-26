# Use an official Node runtime as the base image
FROM node:20

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the application code
COPY . .

# Build the application
RUN npm run build

# Create a directory for the database if it doesn't exist
RUN mkdir -p /app/db

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]
