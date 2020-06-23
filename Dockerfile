FROM node:14.4.0

WORKDIR /home/node/app

COPY . .

EXPOSE 1337

RUN yarn

CMD [ "npm", "run", "start" ]