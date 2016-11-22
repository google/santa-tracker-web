# development docker file, see README instructions

FROM nodesource/trusty:6.3.0

RUN apt-get update && \
    apt-get -y install build-essential ca-certificates git openjdk-7-jre-headless && \
    rm -rf /var/lib/apt/lists/*

RUN npm -g install bower gulp http-server

RUN useradd -ms /bin/bash santa
ENV SANTA_ROOT /home/santa/src/santatracker

RUN mkdir -p $SANTA_ROOT
ADD . $SANTA_ROOT
RUN chown -R santa:santa $SANTA_ROOT

USER santa
WORKDIR $SANTA_ROOT

RUN unset NODE_ENV && \
    npm install

EXPOSE 8080

CMD ["http-server", ".", "-s", "-p", "8080"]
