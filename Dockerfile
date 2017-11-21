# development docker file, see README instructions

# FROM nodesource/xenial
FROM ubuntu:16.04


RUN apt-get update && \
    apt-get -y install curl apt-transport-https build-essential ca-certificates git openjdk-8-jre-headless && \
    rm -rf /var/lib/apt/lists/*

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    curl -sL https://deb.nodesource.com/setup_9.x | bash - && \
    apt-get update && \
    apt-get -y install yarn nodejs && \
    rm -rf /var/lib/apt/lists/*

RUN useradd -ms /bin/bash santa
ENV SANTA_ROOT /home/santa/src/santatracker
RUN mkdir -p $SANTA_ROOT
WORKDIR $SANTA_ROOT

RUN yarn global add bower
RUN npm -g install gulp http-server

ADD . $SANTA_ROOT
RUN chown -R santa:santa $SANTA_ROOT

USER santa
WORKDIR $SANTA_ROOT

RUN yarn install

EXPOSE 8080

CMD ["http-server", ".", "-s", "-p", "8080"]
