# Base image
FROM node:16

# Install required libraries for Puppeteer
RUN apt-get update && apt-get install -y \
    libnss3 \
    libxss1 \
    libasound2 \
    fonts-liberation \
    libappindicator3-1 \
    lsb-release \
    xdg-utils \
    libgbm-dev \
    libxshmfence-dev \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Install Puppeteer dependencies
RUN npm install puppeteer

# Expose port 3000 for your Express server
EXPOSE 3000

# Run the application
CMD ["npm", "start"]
