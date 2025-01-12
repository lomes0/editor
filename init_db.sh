#!/bin/bash -x

set -o allexport
source .env
set +o allexport

psql -h $PGHOST -U $PGUSER -d postgres -c "CREATE DATABASE $PGDATABASE;"

./prisma/migrate.sh
