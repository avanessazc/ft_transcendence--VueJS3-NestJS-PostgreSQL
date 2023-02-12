FROM alpine:3.16

WORKDIR /usr/src/app/front

RUN apk add vim && \
	apk add --update nodejs npm

# # COPY package.json and package-lock.json files
COPY package*.json ./

# # Install package.json dependencies.
RUN npm install

COPY .env ./
COPY tsconfig.json ./
COPY . .

# Comment to come back to Dev Mode
# RUN npm run build
# RUN npm install -g serve
# "serve": "vue-cli-service serve",
# Pls put this command in line 6 of Vue package.json file: "serve": "serve -s -d -p 8080 dist",
