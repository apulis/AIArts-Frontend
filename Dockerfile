FROM node:12

RUN mkdir -p /home/AIArts
WORKDIR /home/AIArts
ADD package.json .
ADD yarn.lock .
RUN yarn config set registry 'https://registry.npm.taobao.org'
RUN yarn install

COPY . /home/AIArts

RUN yarn build


FROM node:14-alpine
RUN mkdir -p /home/app/dist && mkdir -p /home/app/server
WORKDIR /home/app/server
COPY --from=0 /home/AIArts/dist ../dist
COPY --from=0 /home/AIArts/server .
RUN yarn config set registry 'https://registry.npm.taobao.org'
RUN yarn

EXPOSE 3084

CMD ["node", "index"]
