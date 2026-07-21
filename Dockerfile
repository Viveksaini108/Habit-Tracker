# HabitFlow — all-in-one production image (Next.js + built-in SQLite)
#
#   docker build -t habitflow .
#   docker run -p 3000:3000 -v habitflow-data:/app/data habitflow
#
# The SQLite database lives in /app/data — mount a volume there (or let every
# container host do it for you) so your data survives restarts & redeploys.
# Works on Render (Docker runtime), Fly.io, Oracle Cloud VMs, Railway, Koyeb…

# ---------- deps: install node_modules once, cacheable ----------
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ---------- builder: compile the Next.js app ----------
FROM node:22-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- runner: tiny production image (standalone output) ----------
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000
    # SESSION_SECRET is NOT set here — pass it at runtime:
    #   docker run -e SESSION_SECRET="a-long-random-string" …

# Run as a non-root user; /app/data is the SQLite home.
RUN groupadd -r habitflow && useradd -r -g habitflow habitflow \
    && mkdir -p /app/data && chown -R habitflow:habitflow /app/data

COPY --from=builder --chown=habitflow:habitflow /app/.next/standalone ./
COPY --from=builder --chown=habitflow:habitflow /app/.next/static ./.next/static
COPY --from=builder --chown=habitflow:habitflow /app/public ./public

USER habitflow
EXPOSE 3000
VOLUME ["/app/data"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||3000)+'/login').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
