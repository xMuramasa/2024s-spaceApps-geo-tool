VENV_DIR = venv

create:
	@if [ ! -d "$(VENV_DIR)" ]; then \
		echo "Creating virtual environment..."; \
		python3 -m venv $(VENV_DIR); \
		echo "Virtual environment created."; \
	else \
		echo "Virtual environment already exists."; \
	fi

activate:
	@if [ -d "$(VENV_DIR)" ]; then \
		echo "Run\n\n source ./$(VENV_DIR)/bin/activate \n\nto activate venv"; \
	else \
		echo "Virtual environment not found. Please run 'make create' first."; \
	fi

install:
	@echo "Installing dependencies..."
	pip install -r requirements.txt
	@echo "Dependencies installed."

run-dev:
	@echo "Running FastAPI app..."
	fastapi dev main.py

.PHONY: create activate install run
