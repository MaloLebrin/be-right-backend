FROM node:22-alpine

# Installer les dépendances système nécessaires
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-liberation \
    git

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json pnpm-lock.yaml ./

# Installer pnpm et les dépendances
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile

# Copier les fichiers de configuration
COPY tsconfig.json ./
COPY ormconfig.ts ./

# Copier le code source
COPY ./src ./src

# Compiler TypeScript
RUN pnpm run tsc

# Copier les vues
COPY ./src/views ./build/src/views

# Créer le répertoire uploads avec les bonnes permissions
RUN mkdir -p /app/build/src/uploads && \
    chown -R nodejs:nodejs /app

# Définir les variables d'environnement
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Changer vers l'utilisateur non-root
USER nodejs

# Exposer le port
EXPOSE 3000

# Point d'entrée
CMD ["node", "/app/build/src/index.js"]
