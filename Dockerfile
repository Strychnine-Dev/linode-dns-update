FROM node:18-slim

RUN mkdir /.npm && \
    chown -R 1000:0 /.npm && chmod -R ug+rwx /.npm

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm ci \
  && npm cache clean --force

COPY . .

RUN chown -R 1000:0 /usr/src/app && chmod -R ug+rwx /usr/src/app
USER 1000

CMD [ "node", "app" ]
