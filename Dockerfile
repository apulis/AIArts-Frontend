FROM node:12

RUN mkdir -p /home/AIArts
WORKDIR /home/AIArts

ADD package.json .
RUN yarn config set registry 'https://registry.npm.taobao.org'
RUN yarn

COPY . /home/AIArts

RUN yarn build

EXPOSE 3084

CMD ["node", "server.js"]