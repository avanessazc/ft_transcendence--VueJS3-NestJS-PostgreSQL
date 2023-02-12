# Base image
FROM node:17-alpine

# Create app directory
WORKDIR /usr/src/app/back

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN apk add vim

# Install app dependencies
RUN npm install

# COPY Prisma files
COPY prisma/ /prisma/

# COPY ENV variable
COPY .env ./

# COPY tsconfig.json file
COPY tsconfig.json ./

# Bundle app source
COPY . .
