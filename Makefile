PYTHON := python3.11
VENV := .venv
BIN := $(VENV)/bin

.PHONY: setup test abstract-check seed demo-offline demo up api web build reset e2e publish-bad lint

setup:
	$(PYTHON) -m venv $(VENV)
	$(BIN)/python -m pip install --upgrade pip
	$(BIN)/pip install -e . pytest
	cd web && npm install

test:
	$(BIN)/pytest

abstract-check:
	$(BIN)/python scripts/check_abstract.py

seed:
	$(BIN)/vouch seed

api:
	PYTHONPATH=agent $(BIN)/uvicorn api.main:app --host 127.0.0.1 --port 8787

web:
	cd web && npm run dev -- --hostname 127.0.0.1 --port 3000

up:
	@echo "Run these in two terminals:"
	@echo "  make api"
	@echo "  make web"

demo-offline: seed
	@echo "Offline demo seeded."
	@echo "API:       make api"
	@echo "Dashboard: make web"
	@echo "URL:       http://127.0.0.1:3000"

demo: demo-offline

publish-bad:
	$(BIN)/vouch audit color-tones@2.3.1
	$(BIN)/vouch audit date-fmt-lite@0.5.0

e2e:
	$(BIN)/vouch check fixtures/demo-app/package-lock.clean.json
	! $(BIN)/vouch check fixtures/demo-app/package-lock.compromised.json

build:
	cd web && npm run build

reset:
	rm -rf data

lint:
	$(BIN)/python -m compileall agent api scripts

