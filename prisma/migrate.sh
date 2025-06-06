#!/bin/bash

PATHS=(
20220828045946_init
20230615210049_added_document_is_public
20230716233903_rename_document_user_id_to_document_author_id
20230716235833_add_document_base_id
20230723225901_add_nextauth
20230813082118_add_user_handle
20230819052127_add_document_handle
20230917200543_normalize_document_data
20230928083635_add_document_coauthers
20230930163939_add_head_not_null
20231002172336_change_schema_naming_to_camel_case
20231002180010_rename_document_coauthors_created_at_column
20231006173531_add_user_last_login
20240204073952_add_document_collab
20240207163534_add_document_private
)

for m in ${PATHS[*]} ; do
	psql $POSTGRES_URL -f ./prisma/migrations/${m}/migration.sql
done
