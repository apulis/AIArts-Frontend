FROM node:12

RUN mkdir -p /home/AIArts
WORKDIR /home/AIArts

ADD package.json .
ADD yarn.lock .
RUN yarn config set registry 'https://registry.npm.taobao.org'
RUN yarn install --frozen-lockfile 

COPY . /home/AIArts

RUN yarn build

EXPOSE 3084

CMD ["node", "server.js"]