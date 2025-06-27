
create function increment_reported_count(q_id uuid) returns void as $$
  update questions
  set reported_count = reported_count + 1
  where id = q_id;
$$ language sql;
