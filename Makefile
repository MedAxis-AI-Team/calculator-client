.DEFAULT_GOAL := help
.PHONY: help install dev build serve lint format typecheck \
        test test-watch test-coverage test-e2e test-all smoke \
        docker-build docker-up docker-down docker-clean clean

IMAGE_NAME ?= calculator-client
PORT       ?= 3000

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
	  | sort \
	  | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install all npm dependencies (including playwright browsers)
	npm ci
	npx playwright install --with-deps chromium

dev: ## Start Next.js dev server on port 3000
	npm run dev

build: typecheck ## Typecheck then build static export to out/
	npm run build

serve: ## Serve the out/ static export locally
	npx serve out -l $(PORT)

lint: ## Run ESLint over the codebase
	npm run lint

lint-fix: ## Run ESLint with --fix to auto-correct violations
	npx eslint --fix .

format: lint-fix ## Alias for lint-fix (ESLint handles formatting in this project)

typecheck: ## Run TypeScript compiler check (no emit)
	npm run typecheck

test: ## Run unit + component tests (vitest)
	npm run test

test-watch: ## Run vitest in interactive watch mode
	npm run test:watch

test-coverage: ## Run tests with v8 coverage (≥90% lines required)
	npm run test:coverage

test-e2e: build ## Build then run Playwright E2E tests (requires playwright install)
	npm run test:e2e

test-all: lint typecheck test test-coverage smoke ## Run full quality gate: lint → typecheck → unit → coverage → smoke

smoke: build ## Build then run post-build smoke checks
	npm run smoke

docker-build: ## Build the Docker image (multi-stage: build → serve)
	docker build -t $(IMAGE_NAME) .

docker-up: ## Build image and start container on port $(PORT)
	docker compose up --build

docker-up-detached: ## Start container in background
	docker compose up --build -d

docker-down: ## Stop and remove containers
	docker compose down

docker-clean: docker-down ## Stop containers and remove image
	docker rmi $(IMAGE_NAME) 2>/dev/null || true

docker-run: docker-build ## Build image then run it locally (no compose)
	docker run --rm \
	  -p $(PORT):3000 \
	  -e NEXT_PUBLIC_POSTHOG_KEY=$${NEXT_PUBLIC_POSTHOG_KEY:-} \
	  -e NEXT_PUBLIC_POSTHOG_HOST=$${NEXT_PUBLIC_POSTHOG_HOST:-} \
	  $(IMAGE_NAME)

clean: ## Remove build artifacts (out/, .next/, coverage/)
	rm -rf out .next coverage tsconfig.tsbuildinfo
