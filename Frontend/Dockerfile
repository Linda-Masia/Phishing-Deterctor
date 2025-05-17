# Install dependencies in a builder container
FROM node:20-alpine AS builder

WORKDIR /app

# Copy only the app source (not the outer Dockerfile folder)
COPY threatlens/package.json threatlens/package-lock.json ./threatlens/
WORKDIR /app/threatlens

RUN npm install

COPY threatlens/ ./

RUN npm run build

# Serve the app with Next.js production server
FROM node:20-alpine AS runner

WORKDIR /app

# Only copy built output and node_modules from builder
COPY --from=builder /app/threatlens/.next .next
COPY --from=builder /app/threatlens/public ./public
COPY --from=builder /app/threatlens/package.json ./
COPY --from=builder /app/threatlens/node_modules ./node_modules

ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
