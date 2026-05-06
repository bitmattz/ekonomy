.PHONY: setup dev build clean logs dev

setup:
	chmod +x setup.sh && ./setup.sh

dev:
	chmod +x dev.sh && ./dev.sh

dev-db:
	docker compose up postgres -d

dev-api:
	cd ekonomy-api && ./mvnw quarkus:dev

dev-ui:
	cd ekonomy-ui && npm install && npm start

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

clean:
	docker compose down -v
	rm -rf ekonomy-api/target
	rm -rf ekonomy-ui/node_modules ekonomy-ui/dist
