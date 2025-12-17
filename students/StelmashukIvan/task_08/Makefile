# Makefile for Book Catalog Project
# Lab 8 - Quality and Deployment

.PHONY: help install dev build test lint docker deploy clean

# Colors for output
RED    = \033[0;31m
GREEN  = \033[0;32m
YELLOW = \033[0;33m
BLUE   = \033[0;34m
RESET  = \033[0m

# Default target
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo "$(BLUE)Book Catalog - Lab 8$(RESET)"
	@echo "$(YELLOW)Available commands:$(RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(RESET) %s\n", $$1, $$2}'

# Installation
install: ## Install dependencies
	@echo "$(BLUE)Installing dependencies...$(RESET)"
	npm ci

install-dev: ## Install development dependencies
	@echo "$(BLUE)Installing development dependencies...$(RESET)"
	npm install --include=dev

# Development
dev: ## Start development server
	@echo "$(BLUE)Starting development server...$(RESET)"
	npm run dev

dev-docker: ## Start development with Docker
	@echo "$(BLUE)Starting development with Docker...$(RESET)"
	docker-compose up

# Build
build: ## Build the application
	@echo "$(BLUE)Building application...$(RESET)"
	npm run build

build-docker: ## Build Docker image
	@echo "$(BLUE)Building Docker image...$(RESET)"
	docker build -t book-catalog .

build-prod: ## Build production Docker image
	@echo "$(BLUE)Building production Docker image...$(RESET)"
	docker build -f Dockerfile.prod -t book-catalog:prod .

# Testing
test: ## Run all tests
	@echo "$(BLUE)Running all tests...$(RESET)"
	npm test

test-unit: ## Run unit tests
	@echo "$(BLUE)Running unit tests...$(RESET)"
	npm run test:unit

test-integration: ## Run integration tests
	@echo "$(BLUE)Running integration tests...$(RESET)"
	npm run test:integration

test-e2e: ## Run E2E tests
	@echo "$(BLUE)Running E2E tests...$(RESET)"
	npm run test:e2e

test-coverage: ## Run tests with coverage
	@echo "$(BLUE)Running tests with coverage...$(RESET)"
	npm run test:coverage

test-ci: ## Run tests for CI
	@echo "$(BLUE)Running CI tests...$(RESET)"
	npm run test:ci

# Linting and formatting
lint: ## Run ESLint
	@echo "$(BLUE)Running ESLint...$(RESET)"
	npm run lint

lint-fix: ## Fix ESLint errors
	@echo "$(BLUE)Fixing ESLint errors...$(RESET)"
	npm run lint:fix

format: ## Format code with Prettier
	@echo "$(BLUE)Formatting code...$(RESET)"
	npm run format

type-check: ## Type check with TypeScript
	@echo "$(BLUE)Checking types...$(RESET)"
	npm run type-check

# Docker
docker-up: ## Start Docker containers
	@echo "$(BLUE)Starting Docker containers...$(RESET)"
	docker-compose up -d

docker-down: ## Stop Docker containers
	@echo "$(BLUE)Stopping Docker containers...$(RESET)"
	docker-compose down

docker-clean: ## Clean Docker resources
	@echo "$(BLUE)Cleaning Docker resources...$(RESET)"
	docker system prune -f

docker-logs: ## Show Docker logs
	@echo "$(BLUE)Showing Docker logs...$(RESET)"
	docker-compose logs -f

# Deployment
deploy-vercel: ## Deploy to Vercel
	@echo "$(BLUE)Deploying to Vercel...$(RESET)"
	vercel --prod

deploy-netlify: ## Deploy to Netlify
	@echo "$(BLUE)Deploying to Netlify...$(RESET)"
	netlify deploy --prod

deploy-docker: ## Deploy Docker image
	@echo "$(BLUE)Deploying Docker image...$(RESET)"
	docker push book-catalog:latest

# Quality
lighthouse: ## Run Lighthouse audit
	@echo "$(BLUE)Running Lighthouse audit...$(RESET)"
	npm run lighthouse

lighthouse-ci: ## Run Lighthouse CI
	@echo "$(BLUE)Running Lighthouse CI...$(RESET)"
	npm run lighthouse:ci

security: ## Run security scans
	@echo "$(BLUE)Running security scans...$(RESET)"
	npm audit --audit-level=high

health: ## Run health checks
	@echo "$(BLUE)Running health checks...$(RESET)"
	node scripts/health-check.js

# CI/CD
ci: ## Run CI pipeline locally
	@echo "$(BLUE)Running CI pipeline...$(RESET)"
	make lint
	make type-check
	make test-ci
	make build
	make lighthouse-ci

cd: ## Run CD pipeline locally
	@echo "$(BLUE)Running CD pipeline...$(RESET)"
	make ci
	make build-prod
	make deploy-docker

# Cleanup
clean: ## Clean project
	@echo "$(BLUE)Cleaning project...$(RESET)"
	rm -rf dist coverage .vite node_modules playwright-report lighthouse/reports

clean-docker: ## Clean Docker
	@echo "$(BLUE)Cleaning Docker...$(RESET)"
	docker-compose down -v
	docker system prune -f

# Setup
setup: ## Setup project
	@echo "$(BLUE)Setting up project...$(RESET)"
	node scripts/setup.js

# Database
db-start: ## Start JSON Server
	@echo "$(BLUE)Starting JSON Server...$(RESET)"
	json-server --watch db.json --port 3001

db-seed: ## Seed database with sample data
	@echo "$(BLUE)Seeding database...$(RESET)"
	cp db.example.json db.json

# Monitoring
monitor: ## Monitor application
	@echo "$(BLUE)Starting monitoring...$(RESET)"
	docker-compose -f docker-compose.prod.yml up prometheus grafana

# Backup
backup: ## Backup database
	@echo "$(BLUE)Backing up database...$(RESET)"
	cp db.json db.backup.$(shell date +%Y%m%d%H%M%S).json

restore: ## Restore database from backup
	@echo "$(BLUE)Restoring database...$(RESET)"
	@if [ -f db.json.backup ]; then \
		cp db.json.backup db.json; \
		echo "$(GREEN)Database restored$(RESET)"; \
	else \
		echo "$(RED)Backup file not found$(RESET)"; \
	fi

# Documentation
docs: ## Generate documentation
	@echo "$(BLUE)Generating documentation...$(RESET)"
	npm run docs

# Version
version: ## Show version
	@echo "$(BLUE)Version:$(RESET)"
	@node -p "require('./package.json').version"

# Status
status: ## Show project status
	@echo "$(BLUE)Project Status:$(RESET)"
	@echo "Node: $(shell node --version)"
	@echo "NPM: $(shell npm --version)"
	@echo "Docker: $(shell docker --version 2>/dev/null || echo 'Not installed')"
	@echo "Git: $(shell git --version)"
	@echo ""
	@echo "$(YELLOW)Services:$(RESET)"
	@docker-compose ps 2>/dev/null || echo "Docker Compose not running"