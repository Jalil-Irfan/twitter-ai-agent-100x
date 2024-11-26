FROM node:16

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libxcomposite1 \
    libxrandr2 \
    libxdamage1 \
    libgdk-pixbuf2.0-0 \
    libasound2 \
    libx11-xcb1 \
    libxcb-dri3-0 \
    libdrm2 \
    libgbm1 \
    libxshmfence1 \
    libxext6 \
    libxfixes3 \
    libnspr4 \
    fonts-liberation \
    libappindicator3-1 \
    libxss1 \
    xdg-utils \
    lsb-release \
    xdg-utils \
    libgbm-dev \
    libxshmfence-dev \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install Puppeteer and other project dependencies
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Install Puppeteer dependencies
RUN npm install puppeteer

# Expose port 3000 for your Express server
EXPOSE 3000

# Run the application
CMD ["npm", "start"]

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser