FROM node:14.4.0

WORKDIR /home/node/app

COPY package.json package-lock.json* ./
RUN npm install && npm cache clean --force

COPY . .

RUN npx sequelize-cli db:migrate

CMD ["babel-node", "src/index.js" ]
