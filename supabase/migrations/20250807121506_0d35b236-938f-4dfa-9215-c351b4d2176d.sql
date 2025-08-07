create or replace function prevent_role_escalation()
returns trigger as $$
begin
  if auth.role() != 'authenticated' then
    return new;
  end if;

  if new.role is distinct from old.role then
    raise exception 'Você não tem permissão para alterar o campo de role.';
  end if;

  return new;
end;
$$ language plpgsql;