#!/bin/bash -x

source .env

psql -h $PGHOST -U $PGUSER -d postgres -c "CREATE DATABASE $PGDATABASE;"

./prisma/migrate.sh
