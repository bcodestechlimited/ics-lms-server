FROM node:20-alpine

WORKDIR /app

COPY package*.json .

RUN npm install --force

# I am using volumes no need to copy, I am mapping the container and my root directory
# COPY . /app/

EXPOSE 5500

CMD ["npm", "run", "dev"]
