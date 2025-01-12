#!/bin/bash -x

export NODE_TLS_REJECT_UNAUTHORIZED=0

source .env

npm run dev
