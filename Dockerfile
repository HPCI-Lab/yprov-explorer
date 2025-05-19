FROM node:18-alpine
WORKDIR /app

# Copia i file di configurazione e installa le dipendenze
COPY package.json package-lock.json ./
RUN npm install

# Copia tutto il codice sorgente
COPY . .

# Esegui la build in modalità produzione
RUN npm run build

# Espone la porta usata dal server proxy
EXPOSE 3000

# Avvia il server proxy
CMD ["node", "src/server/server.mjs"]


