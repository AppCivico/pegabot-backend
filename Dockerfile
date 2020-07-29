FROM node:14.4.0

WORKDIR /home/node/app

COPY . .

RUN npm i

CMD [ "npm", "run", "start" ]