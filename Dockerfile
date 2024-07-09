FROM python:3.11-slim

RUN apt-get update && apt-get install -y ffmpeg

ARG BOT_NAME
ENV BOT_NAME=${BOT_NAME}

WORKDIR /usr/src/app/${BOT_NAME}

COPY requirements.txt /usr/src/app/${BOT_NAME}/
RUN pip install -r requirements.txt

COPY . /usr/src/app/${BOT_NAME}/
