revoke delete on table "public"."event_facts" from "anon";

revoke insert on table "public"."event_facts" from "anon";

revoke references on table "public"."event_facts" from "anon";

revoke select on table "public"."event_facts" from "anon";

revoke trigger on table "public"."event_facts" from "anon";

revoke truncate on table "public"."event_facts" from "anon";

revoke update on table "public"."event_facts" from "anon";

revoke delete on table "public"."event_facts" from "authenticated";

revoke insert on table "public"."event_facts" from "authenticated";

revoke references on table "public"."event_facts" from "authenticated";

revoke select on table "public"."event_facts" from "authenticated";

revoke trigger on table "public"."event_facts" from "authenticated";

revoke truncate on table "public"."event_facts" from "authenticated";

revoke update on table "public"."event_facts" from "authenticated";

revoke delete on table "public"."event_facts" from "service_role";

revoke insert on table "public"."event_facts" from "service_role";

revoke references on table "public"."event_facts" from "service_role";

revoke select on table "public"."event_facts" from "service_role";

revoke trigger on table "public"."event_facts" from "service_role";

revoke truncate on table "public"."event_facts" from "service_role";

revoke update on table "public"."event_facts" from "service_role";

alter table "public"."event_facts" drop constraint "event_facts_event_fkey";

alter table "public"."event_facts" drop constraint "events_id_key";

alter table "public"."event_facts" drop constraint "events_pkey";

drop index if exists "public"."events_event_category_idx";

drop index if exists "public"."events_event_idx";

drop index if exists "public"."events_id_key";

drop index if exists "public"."events_pkey";

drop index if exists "public"."events_userid_idx";

drop table "public"."event_facts";

create table "public"."documents" (
    "id" bigint generated always as identity not null,
    "content" text,
    "userid" text,
    "channelid" text,
    "category" text,
    "verified" boolean default false,
    "fts" tsvector generated always as (to_tsvector('english'::regconfig, content)) stored,
    "embedding" halfvec(1536),
    "meta" jsonb
);


alter table "public"."documents" enable row level security;

CREATE INDEX documents_channelid_userid_idx ON public.documents USING btree (channelid, userid);

CREATE INDEX documents_embedding_idx ON public.documents USING hnsw (embedding halfvec_ip_ops);

CREATE INDEX documents_fts_idx ON public.documents USING gin (fts);

CREATE UNIQUE INDEX documents_pkey ON public.documents USING btree (id);

CREATE INDEX profiles_userid_idx ON public.profiles USING btree (userid);

alter table "public"."documents" add constraint "documents_pkey" PRIMARY KEY using index "documents_pkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.hybrid_search(channel text, query_text text, query_embedding halfvec, match_count integer, full_text_weight double precision DEFAULT 1, semantic_weight double precision DEFAULT 1, rrf_k integer DEFAULT 50)
 RETURNS SETOF documents
 LANGUAGE sql
AS $function$
with full_text as (
  select
    id,
    -- Note: ts_rank_cd is not indexable but will only rank matches of the where clause
    -- which shouldn't be too big
    row_number() over(order by ts_rank_cd(fts, websearch_to_tsquery(query_text)) desc) as rank_ix
  from
    documents
  where
    channelid = channel AND
    fts @@ websearch_to_tsquery(query_text)
  order by rank_ix
  limit least(match_count, 30) * 2
),
semantic as (
  select
    id,
    row_number() over (order by embedding <#> query_embedding) as rank_ix
  from
    documents
  WHERE channelid = channel
  order by rank_ix
  limit least(match_count, 30) * 2
)
select
  documents.*
from
  full_text
  full outer join semantic
    on full_text.id = semantic.id
  join documents
    on coalesce(full_text.id, semantic.id) = documents.id
order by
  coalesce(1.0 / (rrf_k + full_text.rank_ix), 0.0) * full_text_weight +
  coalesce(1.0 / (rrf_k + semantic.rank_ix), 0.0) * semantic_weight
  desc
limit
  least(match_count, 30)
$function$
;

CREATE OR REPLACE FUNCTION public.hybrid_search(channel text, query_text text, query_embedding vector, match_count integer, full_text_weight double precision DEFAULT 1, semantic_weight double precision DEFAULT 1, rrf_k integer DEFAULT 50)
 RETURNS SETOF documents
 LANGUAGE sql
AS $function$
with full_text as (
  select
    id,
    -- Note: ts_rank_cd is not indexable but will only rank matches of the where clause
    -- which shouldn't be too big
    row_number() over(order by ts_rank_cd(fts, websearch_to_tsquery(query_text)) desc) as rank_ix
  from
    documents
  where
    channelid = channel AND
    fts @@ websearch_to_tsquery(query_text)
  order by rank_ix
  limit least(match_count, 30) * 2
),
semantic as (
  select
    id,
    row_number() over (order by embedding <#> query_embedding) as rank_ix
  from
    documents
  WHERE channelid = channel
  order by rank_ix
  limit least(match_count, 30) * 2
)
select
  documents.*
from
  full_text
  full outer join semantic
    on full_text.id = semantic.id
  join documents
    on coalesce(full_text.id, semantic.id) = documents.id
order by
  coalesce(1.0 / (rrf_k + full_text.rank_ix), 0.0) * full_text_weight +
  coalesce(1.0 / (rrf_k + semantic.rank_ix), 0.0) * semantic_weight
  desc
limit
  least(match_count, 30)
$function$
;

CREATE OR REPLACE FUNCTION public.hybrid_search(query_text text, query_embedding vector, match_count integer, full_text_weight double precision DEFAULT 1, semantic_weight double precision DEFAULT 1, rrf_k integer DEFAULT 50)
 RETURNS SETOF documents
 LANGUAGE sql
AS $function$
with full_text as (
  select
    id,
    -- Note: ts_rank_cd is not indexable but will only rank matches of the where clause
    -- which shouldn't be too big
    row_number() over(order by ts_rank_cd(fts, websearch_to_tsquery(query_text)) desc) as rank_ix
  from
    documents
  where
    fts @@ websearch_to_tsquery(query_text)
  order by rank_ix
  limit least(match_count, 30) * 2
),
semantic as (
  select
    id,
    row_number() over (order by embedding <#> query_embedding) as rank_ix
  from
    documents
  order by rank_ix
  limit least(match_count, 30) * 2
)
select
  documents.*
from
  full_text
  full outer join semantic
    on full_text.id = semantic.id
  join documents
    on coalesce(full_text.id, semantic.id) = documents.id
order by
  coalesce(1.0 / (rrf_k + full_text.rank_ix), 0.0) * full_text_weight +
  coalesce(1.0 / (rrf_k + semantic.rank_ix), 0.0) * semantic_weight
  desc
limit
  least(match_count, 30)
$function$
;

grant delete on table "public"."documents" to "anon";

grant insert on table "public"."documents" to "anon";

grant references on table "public"."documents" to "anon";

grant select on table "public"."documents" to "anon";

grant trigger on table "public"."documents" to "anon";

grant truncate on table "public"."documents" to "anon";

grant update on table "public"."documents" to "anon";

grant delete on table "public"."documents" to "authenticated";

grant insert on table "public"."documents" to "authenticated";

grant references on table "public"."documents" to "authenticated";

grant select on table "public"."documents" to "authenticated";

grant trigger on table "public"."documents" to "authenticated";

grant truncate on table "public"."documents" to "authenticated";

grant update on table "public"."documents" to "authenticated";

grant delete on table "public"."documents" to "service_role";

grant insert on table "public"."documents" to "service_role";

grant references on table "public"."documents" to "service_role";

grant select on table "public"."documents" to "service_role";

grant trigger on table "public"."documents" to "service_role";

grant truncate on table "public"."documents" to "service_role";

grant update on table "public"."documents" to "service_role";

create policy "Enable insert for authenticated users only"
on "public"."documents"
as permissive
for all
to authenticated
using (true);


create policy "admin"
on "public"."documents"
as permissive
for all
to service_role
using (true);



