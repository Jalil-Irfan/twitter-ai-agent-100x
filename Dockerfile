# Base image
FROM node:16

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose port 3000 for your Express server
EXPOSE 3000

# Run the application
CMD ["npm", "start"]
