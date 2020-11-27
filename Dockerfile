# Copyright 2020 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

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
