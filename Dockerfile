# Temel imaj olarak Node.js 20 LTS sürümünü kullan
FROM node:20-alpine AS base

# Üretim için bağımlılıkları kur
FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Üretim imajı
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Üretim için gerekli bağımlılıkları kur
COPY --from=builder /app/package.json .
COPY --from=builder /app/package-lock.json .
RUN npm ci --only=production

# Derlenen uygulamayı kopyala
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Veritabanı şemasını derle ve migrasyon yap
RUN npx prisma generate

# TensorFlow.js modellerini kopyala
COPY --from=builder /app/models ./models

# Uygulama kullanıcısını oluştur
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME localhost

CMD ["npm", "start"]