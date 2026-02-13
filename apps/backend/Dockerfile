# # FROM node:20-alpine
# # WORKDIR /app
# # COPY package*.json ./
# # RUN npm install
# # COPY . .
# # RUN npx prisma generate
# # EXPOSE 4000
# # CMD ["node", "src/server.js"]



# # FROM node:20-alpine
# # WORKDIR /app
# # COPY package*.json ./
# # RUN npm install
# # COPY . .
# # EXPOSE 4000
# # CMD ["node", "src/server.js"]


# FROM node:20-alpine
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .
# EXPOSE 4000
# CMD ["node", "src/server.js"]


FROM node:20-bookworm-slim

WORKDIR /app

# Prisma engines au nevoie de openssl
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4000
CMD ["node", "src/server.js"]
