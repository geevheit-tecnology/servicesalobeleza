# syntax=docker/dockerfile:1
# Multi-stage Dockerfile otimizado para produção (API Go BelezaPura)

# --- Estágio 1: Build da aplicação ---
FROM golang:1.24-alpine AS builder

WORKDIR /app

ENV GOTOOLCHAIN=auto

# Dependências do sistema para o build
RUN apk add --no-cache ca-certificates git tzdata

# Cache de módulos Go
COPY go.mod go.sum ./
RUN go mod download && go mod verify

# Código-fonte
COPY . .

# Compilação estática dos binários principais
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w -extldflags '-static'" -o /app/belezapura_api main.go
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w -extldflags '-static'" -o /app/migrate cmd/migrate/main.go
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w -extldflags '-static'" -o /app/seed cmd/seed/main.go

# --- Estágio 2: Imagem final de execução ---
FROM alpine:3.21 AS runner

RUN apk add --no-cache ca-certificates tzdata wget

# Criação de usuário sem privilégios de root por segurança
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

ENV GOTOOLCHAIN=auto

# Copia os binários compilados
COPY --from=builder /app/belezapura_api /app/belezapura_api
COPY --from=builder /app/migrate /app/migrate
COPY --from=builder /app/seed /app/seed

# Permissões do usuário
RUN chown -R appuser:appgroup /app
USER appuser

# Porta padrão da API
EXPOSE 3050

# Verificação de saúde nativa da API
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3050/health || exit 1

ENTRYPOINT ["/app/belezapura_api"]

