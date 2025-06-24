# Multi-stage build for Next.js application
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN \
  if [ -f package-lock.json ]; then npm ci --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV ESLINT_NO_DEV_ERRORS=true
ENV SKIP_ENV_VALIDATION=true

# Real environment variables for build
ENV DATABASE_URL="postgresql://neondb_owner:npg_AV6g4SqMnDvo@ep-winter-cake-a4g3lm6n-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_Z2VuZXJvdXMtbXVsZS05NS5jbGVyay5hY2NvdW50cy5kZXYk"
ENV CLERK_SECRET_KEY="sk_test_gcy8ul51uJw22ebC9yFt6NwS25FzEUu5A78b9CEg4H"
ENV CLERK_WEBHOOK_KEY="whsec_w5ZjL3DiXyzUmu/nQYDv8jdVS14rEM6S"
ENV OPENROUTER_API_KEY="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"
ENV NEXT_PUBLIC_APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1"
ENV NEXT_PUBLIC_APPWRITE_PROJECT_ID="683946c4002d95fa0431"
ENV APPWRITE_API_KEY="standard_34ab6176138bbfd75a8685e1228575c56149f0fc28eeeb2a5ccf4c5ec835cf4c2b3166e7b40fcc7ab559d3003c1bf777c778810a8bc421e9c6eb42f0b143256e1cb1625e4d3b416fafbb0b80119420094085373770323d5a3eb0b1c62b6b8c57d67ef16b16b69af2165728f84360e72705d3f5ac0cf1e1a14a44d76d055ce3ad"
ENV NEXT_PUBLIC_APPWRITE_BUCKET_ID="683947d1003cec98d984"

# Create a dummy .env.local if it doesn't exist to prevent build errors
RUN touch .env.local

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Install curl for health checks (lighter than wget)
RUN apk add --no-cache curl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create nextjs user with specific UID/GID for better security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the public folder from the project as this is not included in the build process
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create a directory for runtime environment variables
RUN mkdir -p /app/config && chown nextjs:nodejs /app/config

USER nextjs

# Expose the port the app runs on
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Add health check using the app's health endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "server.js"] 