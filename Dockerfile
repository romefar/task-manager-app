FROM node:14-alpine3.10
WORKDIR /task-manager-app
COPY package.json /task-manager-app
RUN npm i
COPY . /task-manager-app

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait

CMD /wait && npm start