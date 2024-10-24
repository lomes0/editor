#!/bin/bash -x

source .env

docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=$PGPASSWORD \
  -v ~/postgres:/var/lib/postgresql/data \
  -p $PGPORT:$PGPORT \
  postgres
