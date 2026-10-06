# ==========================================
# Stage 1: Build React Frontend (Vite)
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci || npm install

COPY frontend/ ./
RUN npm run build

# ==========================================
# Stage 2: Production Backend (FastAPI + Solver)
# ==========================================
FROM python:3.10-slim

RUN apt-get update && apt-get install -y \
    libpq-dev \
    glpk-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
# Copy compiled frontend dist into container
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

EXPOSE 8000
ENV PORT=8000

CMD ["sh", "-c", "alembic upgrade head 2>&1 || true; uvicorn app.api.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
