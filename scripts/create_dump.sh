#!/bin/bash

export CONTAINER_NAME=SixPIBroBot
export BOT_NAME=SixPIBroBot
mkdir -p ./dump
docker cp ${CONTAINER_NAME}:/usr/src/app/${BOT_NAME}/data/main.db ./dump/main.db

if [ $? -eq 0 ]; then
  echo "Dump successfully created."
else
  echo "Failed to create dump."
  exit 1
fi