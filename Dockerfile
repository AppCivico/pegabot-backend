FROM node:latest
ENV NPM_CONFIG_LOGLEVEL warn

EXPOSE 1337

USER root
RUN mkdir src
RUN chown -R node:node /src
RUN apt-get update
RUN apt-get install -y runit

USER node
ADD package.json /src/
WORKDIR /src

RUN npm install
ADD . /src

USER root
COPY services/ /etc/service/
RUN chmod +x /etc/service/*/run

ENTRYPOINT ["runsvdir"]
CMD ["/etc/service/"]
