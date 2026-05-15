FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including tsx for running typescript)
RUN npm ci

# Copy source code
COPY . .

# Ensure output directory exists and has right permissions
RUN mkdir -p output && chown -R node:node output

# Switch to non-root user
USER node

# Run the agent
CMD ["npm", "start"]
