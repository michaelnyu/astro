serve:
	node index.js

up:
	docker-compose -f docker-compose.yml up

build:
	docker-compose build

down:
	docker-compose down