FROM node:20-bookworm-slim

# Install FFmpeg and Python (often required by yt-dlp for audio extraction)
RUN apt-get update && \
    apt-get install -y ffmpeg python3 && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all other project files shown in your directory
COPY . .

# Expose the port your Express server uses
EXPOSE 3000

CMD ["node", "server.js"]