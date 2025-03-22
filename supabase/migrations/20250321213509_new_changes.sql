alter table "public"."questions" disable row level security;

alter table "public"."quizzes" alter column "title" set not null;

create policy "Enable insert for authenticated users only"
on "public"."quizzes"
as permissive
for insert
to authenticated
with check (true);



