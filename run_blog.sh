#!/bin/bash -x

if [ $# -ne 1 ] ; then
	echo "missing db.."
	exit 0
fi

PGDATABASE=${1}

source .env

npm run dev
