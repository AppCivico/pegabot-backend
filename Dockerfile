FROM node:14.4.0

WORKDIR /home/node/app

COPY . .

RUN npm i
RUN npx sequelize-cli db:migrate

CMD [ "npm", "run", "start" ]