# Scrum Board Backend

Detta är backend-API:t för Scrum Board projektet. API:t hanterar tasks och members som används av frontend-applikationen.

## Installation

1. Klona projektet

git clone https://github.com/salmaharastani/FE25-JS2-slutprojekt-back-salma.git

2. Gå in i projektmappen

cd backend

3. Installera dependencies

npm install

## Starta utvecklingsserver

npm run dev

Servern startar på:

http://localhost:3000

## Bygga projektet för production

npm run build

Detta skapar en **dist-mapp** med transpilerad JavaScript-kod.

## Starta production-version

npm start

## API Endpoints

GET /assignments
Hämtar alla tasks

POST /assignments
Skapar en ny task

PATCH /assignments/:id/status
Ändrar status på en task

PATCH /assignments/:id/assign
Tilldelar en medlem

DELETE /assignments/:id
Tar bort en task

GET /members
Hämtar alla medlemmar
