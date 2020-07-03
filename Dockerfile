FROM node:14.4.0

WORKDIR /home/node/app

COPY . .

RUN yarn

CMD [ "npm", "run", "start" ]