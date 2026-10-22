-- SchoolOS finance workflow: reconciliation, parent payment confirmation, audit, scoped permissions.
-- Applied to project noaeychhtmtybzpkmgut on 2026-10-22. Keep this file as deployment history.

alter table public.audit_logs add column if not exists school_id uuid references public.schools(id);

create table if not exists public.cash_closings (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id),
  business_date date not null default current_date,
  shift_name text not null default 'Daily close',
  cash_counted numeric(12,2) not null default 0 check (cash_counted >= 0),
  upi_counted numeric(12,2) not null default 0 check (upi_counted >= 0),
  bank_counted numeric(12,2) not null default 0 check (bank_counted >= 0),
  expected_cash numeric(12,2) not null default 0,
  expected_upi numeric(12,2) not null default 0,
  expected_bank numeric(12,2) not null default 0,
  notes text not null default '',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
alter table public.cash_closings enable row level security;
grant select, insert, update, delete on public.cash_closings to authenticated;
drop policy if exists cash_closings_read_school on public.cash_closings;
create policy cash_closings_read_school on public.cash_closings for select to authenticated
using (school_id = (select p.school_id from public.profiles p where p.id=(select auth.uid()) and p.active=true)
and (select p.role from public.profiles p where p.id=(select auth.uid()) and p.active=true) = any(array['developer','owner','manager','principal','fees_counter']));
drop policy if exists cash_closings_create_school on public.cash_closings;
create policy cash_closings_create_school on public.cash_closings for insert to authenticated
with check (school_id = (select p.school_id from public.profiles p where p.id=(select auth.uid()) and p.active=true)
and created_by=(select auth.uid())
and (select p.role from public.profiles p where p.id=(select auth.uid()) and p.active=true) = any(array['developer','owner','manager','fees_counter']));
drop policy if exists cash_closings_correct_school on public.cash_closings;
create policy cash_closings_correct_school on public.cash_closings for update to authenticated
using (school_id = (select p.school_id from public.profiles p where p.id=(select auth.uid()) and p.active=true)
and (select p.role from public.profiles p where p.id=(select auth.uid()) and p.active=true) = any(array['developer','owner','manager']))
with check (school_id = (select p.school_id from public.profiles p where p.id=(select auth.uid()) and p.active=true)
and (select p.role from public.profiles p where p.id=(select auth.uid()) and p.active=true) = any(array['developer','owner','manager']));
drop policy if exists cash_closings_delete_school on public.cash_closings;
create policy cash_closings_delete_school on public.cash_closings for delete to authenticated
using (school_id = (select p.school_id from public.profiles p where p.id=(select auth.uid()) and p.active=true)
and (select p.role from public.profiles p where p.id=(select auth.uid()) and p.active=true) = any(array['developer','owner']));

drop policy if exists students_read_linked_parent on public.students;
create policy students_read_linked_parent on public.students for select to authenticated
using (exists (
 select 1 from public.parent_student ps join public.profiles pp on pp.id=ps.parent_id
 where ps.student_id=students.id and ps.parent_id=(select auth.uid())
 and pp.active=true and pp.role='parent' and pp.school_id=students.school_id
));

drop policy if exists payments_read_linked_parent on public.fee_payments;
create policy payments_read_linked_parent on public.fee_payments for select to authenticated
using (exists (
 select 1 from public.fee_invoices i
 join public.parent_student ps on ps.student_id=i.student_id
 join public.profiles p on p.id=ps.parent_id
 where i.id=fee_payments.invoice_id and ps.parent_id=(select auth.uid())
 and i.school_id=fee_payments.school_id and p.active=true and p.role='parent'
 and p.school_id=fee_payments.school_id
));

drop policy if exists fees_manage_school_office on public.fee_invoices;
drop policy if exists fees_read_school_staff on public.fee_invoices;
create policy fees_read_school_staff on public.fee_invoices for select to authenticated
using (school_id=(select p.school_id from public.profiles p where p.id=(select auth.uid()) and p.active=true)
and (select p.role from public.profiles p where p.id=(select auth.uid()) and p.active=true)
= any(array['developer','owner','manager','principal','vice_principal','fees_counter']));
create policy fees_create_school_office on public.fee_invoices for insert to authenticated
with check (school_id=(select p.school_id from public.profiles p where p.id=(select auth.uid()) and p.active=true)
and (select p.role from public.profiles p where p.id=(select auth.uid()) and p.active=true)
= any(array['developer','owner','manager','fees_counter']));
create policy fees_correct_school_leadership on public.fee_invoices for update to authenticated
using (school_id=(select p.school_id from public.profiles p where p.id=(select auth.uid()) and p.active=true)
and (select p.role from public.profiles p where p.id=(select auth.uid()) and p.active=true)=any(array['developer','owner','manager']))
with check (school_id=(select p.school_id from public.profiles p where p.id=(select auth.uid()) and p.active=true)
and (select p.role from public.profiles p where p.id=(select auth.uid()) and p.active=true)=any(array['developer','owner','manager']));
create policy fees_delete_school_leadership on public.fee_invoices for delete to authenticated
using (school_id=(select p.school_id from public.profiles p where p.id=(select auth.uid()) and p.active=true)
and (select p.role from public.profiles p where p.id=(select auth.uid()) and p.active=true)=any(array['developer','owner']));

drop policy if exists payments_manage_school_office on public.fee_payments;
drop policy if exists payments_read_school_office on public.fee_payments;
create policy payments_read_school_office on public.fee_payments for select to authenticated
using (school_id=(select p.school_id from public.profiles p where p.id=(select auth.uid()) and p.active=true)
and (select p.role from public.profiles p where p.id=(select auth.uid()) and p.active=true)
=any(array['developer','owner','manager','principal','vice_principal','fees_counter']));
create policy payments_create_school_office on public.fee_payments for insert to authenticated
with check (school_id=(select p.school_id from public.profiles p where p.id=(select auth.uid()) and p.active=true)
and received_by=(select auth.uid())
and (select p.role from public.profiles p where p.id=(select auth.uid()) and p.active=true)
=any(array['developer','owner','manager','fees_counter']));
create policy payments_correct_school_leadership on public.fee_payments for update to authenticated
using (school_id=(select p.school_id from public.profiles p where p.id=(select auth.uid()) and p.active=true)
and (select p.role from public.profiles p where p.id=(select auth.uid()) and p.active=true)=any(array['developer','owner','manager']))
with check (school_id=(select p.school_id from public.profiles p where p.id=(select auth.uid()) and p.active=true)
and (select p.role from public.profiles p where p.id=(select auth.uid()) and p.active=true)=any(array['developer','owner','manager']));
create policy payments_delete_school_leadership on public.fee_payments for delete to authenticated
using (school_id=(select p.school_id from public.profiles p where p.id=(select auth.uid()) and p.active=true)
and (select p.role from public.profiles p where p.id=(select auth.uid()) and p.active=true)=any(array['developer','owner']));

drop policy if exists audit_read_leadership on public.audit_logs;
drop policy if exists audit_read_financial_school on public.audit_logs;
create policy audit_read_financial_school on public.audit_logs for select to authenticated
using (school_id=(select p.school_id from public.profiles p where p.id=(select auth.uid()) and p.active=true)
and (select p.role from public.profiles p where p.id=(select auth.uid()) and p.active=true)=any(array['developer','owner','manager']));
drop policy if exists audit_insert_authenticated_actor on public.audit_logs;
create policy audit_insert_authenticated_actor on public.audit_logs for insert to authenticated
with check (actor_id=(select auth.uid()) and school_id=(select p.school_id from public.profiles p where p.id=(select auth.uid()) and p.active=true));

create or replace function private.log_school_fee_change()
returns trigger language plpgsql security definer
set search_path = pg_catalog, public, private
as $$
declare v_school uuid; v_entity text; v_id text; v_details jsonb; v_action text;
begin
  v_entity := case when tg_table_name='fee_invoices' then 'fee_invoice' else 'fee_payment' end;
  if tg_op='DELETE' then
    v_school := old.school_id; v_id := old.id::text;
    v_details := jsonb_build_object('before',to_jsonb(old)); v_action := 'delete';
    insert into public.audit_logs(actor_id,school_id,action,entity_type,entity_id,details,created_at)
    values(auth.uid(),v_school,v_action,v_entity,v_id,v_details,now());
    return old;
  elsif tg_op='UPDATE' then
    v_school := new.school_id; v_id := new.id::text;
    v_details := jsonb_build_object('before',to_jsonb(old),'after',to_jsonb(new)); v_action := 'update';
  else
    v_school := new.school_id; v_id := new.id::text;
    v_details := jsonb_build_object('after',to_jsonb(new)); v_action := 'create';
  end if;
  insert into public.audit_logs(actor_id,school_id,action,entity_type,entity_id,details,created_at)
  values(auth.uid(),v_school,v_action,v_entity,v_id,v_details,now());
  return new;
end;
$$;
revoke all on function private.log_school_fee_change() from public, anon, authenticated;
drop trigger if exists fee_invoices_audit_change on public.fee_invoices;
create trigger fee_invoices_audit_change after insert or update or delete on public.fee_invoices
for each row execute function private.log_school_fee_change();
drop trigger if exists fee_payments_audit_change on public.fee_payments;
create trigger fee_payments_audit_change after insert or update or delete on public.fee_payments
for each row execute function private.log_school_fee_change();

create table if not exists public.parent_payment_submissions (
 id uuid primary key default gen_random_uuid(),
 school_id uuid not null references public.schools(id),
 student_id uuid not null references public.students(id),
 invoice_id uuid not null references public.fee_invoices(id),
 parent_id uuid not null references public.profiles(id),
 amount numeric(12,2) not null check (amount > 0),
 payment_method text not null default 'upi' check (payment_method in ('upi','bank transfer','cash')),
 payment_reference text not null,
 status text not null default 'pending' check (status in ('pending','verified','rejected')),
 created_at timestamptz not null default now(),
 reviewed_by uuid references auth.users(id),
 reviewed_at timestamptz,
 review_note text not null default ''
);
alter table public.parent_payment_submissions enable row level security;
grant select, insert on public.parent_payment_submissions to authenticated;
drop policy if exists parent_submissions_read_own_or_staff on public.parent_payment_submissions;
create policy parent_submissions_read_own_or_staff on public.parent_payment_submissions for select to authenticated
using (
 (parent_id=(select auth.uid()) and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.active=true and p.role='parent' and p.school_id=parent_payment_submissions.school_id))
 or (school_id=(select p.school_id from public.profiles p where p.id=(select auth.uid()) and p.active=true) and (select p.role from public.profiles p where p.id=(select auth.uid()) and p.active=true)=any(array['developer','owner','manager','fees_counter']))
);
drop policy if exists parent_submissions_create_own on public.parent_payment_submissions;
create policy parent_submissions_create_own on public.parent_payment_submissions for insert to authenticated
with check (
 parent_id=(select auth.uid()) and status='pending' and reviewed_by is null and reviewed_at is null
 and exists(select 1 from public.parent_student ps join public.profiles p on p.id=ps.parent_id
 join public.students s on s.id=ps.student_id where ps.parent_id=(select auth.uid())
 and ps.student_id=parent_payment_submissions.student_id and s.school_id=parent_payment_submissions.school_id
 and p.active=true and p.role='parent' and p.school_id=parent_payment_submissions.school_id)
 and exists(select 1 from public.fee_invoices i where i.id=parent_payment_submissions.invoice_id and i.student_id=parent_payment_submissions.student_id and i.school_id=parent_payment_submissions.school_id)
);
drop policy if exists parent_submissions_review_staff on public.parent_payment_submissions;
revoke update on public.parent_payment_submissions from authenticated;

create or replace function public.confirm_parent_payment_submission(p_submission_id uuid, p_approve boolean, p_note text default '')
returns jsonb language plpgsql security definer set search_path = pg_catalog, public, private
as $$
declare v_profile public.profiles%rowtype; v_sub public.parent_payment_submissions%rowtype; v_invoice public.fee_invoices%rowtype; v_paid numeric(12,2); v_receipt text;
begin
 select * into v_profile from public.profiles where id=auth.uid() and active=true;
 if not found or v_profile.role not in ('developer','owner','manager','fees_counter') then raise exception 'Not authorized to review parent payment confirmations'; end if;
 select * into v_sub from public.parent_payment_submissions where id=p_submission_id and school_id=v_profile.school_id for update;
 if not found then raise exception 'Payment confirmation not found in your school'; end if;
 if v_sub.status<>'pending' then raise exception 'This confirmation has already been reviewed'; end if;
 if p_approve then
  select * into v_invoice from public.fee_invoices where id=v_sub.invoice_id and school_id=v_profile.school_id for update;
  if not found or v_invoice.student_id<>v_sub.student_id then raise exception 'Invoice/student mismatch'; end if;
  select coalesce(sum(amount),0) into v_paid from public.fee_payments where invoice_id=v_invoice.id;
  if v_sub.amount<=0 or v_sub.amount>greatest(0,v_invoice.amount-v_paid) then raise exception 'Submitted amount exceeds the current balance'; end if;
  v_receipt:='SS-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,10));
  insert into public.fee_payments(school_id,invoice_id,amount,payment_method,payment_reference,received_by,paid_at,receipt_number)
  values(v_profile.school_id,v_invoice.id,v_sub.amount,v_sub.payment_method,v_sub.payment_reference,v_profile.id,now(),v_receipt);
  update public.fee_invoices set status=case when v_paid+v_sub.amount>=v_invoice.amount then 'paid' else 'partial' end where id=v_invoice.id;
  update public.parent_payment_submissions set status='verified',reviewed_by=v_profile.id,reviewed_at=now(),review_note=coalesce(p_note,'') where id=v_sub.id;
  return jsonb_build_object('status','verified','receipt_number',v_receipt);
 else
  update public.parent_payment_submissions set status='rejected',reviewed_by=v_profile.id,reviewed_at=now(),review_note=coalesce(p_note,'') where id=v_sub.id;
  return jsonb_build_object('status','rejected');
 end if;
end;
$$;
revoke all on function public.confirm_parent_payment_submission(uuid,boolean,text) from public, anon;
grant execute on function public.confirm_parent_payment_submission(uuid,boolean,text) to authenticated;

create or replace function public.import_school_fee_rows(p_rows jsonb)
returns jsonb language plpgsql security definer set search_path = pg_catalog, public, private
as $$
declare
 v_profile public.profiles%rowtype; v_row jsonb; v_admission text; v_name text; v_class text; v_section text; v_description text;
 v_amount numeric(12,2); v_paid numeric(12,2); v_due date; v_method text; v_ref text; v_student public.students%rowtype;
 v_class_id uuid; v_invoice public.fee_invoices%rowtype; v_receipt text; v_new_students integer:=0; v_existing_students integer:=0;
 v_new_invoices integer:=0; v_new_payments integer:=0; v_seen text[]:=array[]::text[]; v_row_no integer:=0;
begin
 select * into v_profile from public.profiles where id=auth.uid() and active=true;
 if not found or v_profile.school_id is null or v_profile.role not in ('developer','owner','manager','fees_counter') then raise exception 'Not authorized to import school fee data'; end if;
 if jsonb_typeof(p_rows)<>'array' or jsonb_array_length(p_rows)=0 or jsonb_array_length(p_rows)>2000 then raise exception 'Import must contain between 1 and 2000 rows'; end if;
 for v_row in select value from jsonb_array_elements(p_rows) loop
  v_row_no:=v_row_no+1; v_admission:=btrim(coalesce(v_row->>'admission','')); v_name:=btrim(coalesce(v_row->>'name',''));
  v_class:=btrim(coalesce(v_row->>'class','')); v_section:=coalesce(nullif(btrim(v_row->>'section'),''),'A');
  v_description:=coalesce(nullif(btrim(v_row->>'description'),''),'School fee'); v_method:=lower(coalesce(nullif(btrim(v_row->>'method'),''),'cash')); v_ref:=nullif(btrim(coalesce(v_row->>'reference','')),'');
  begin v_amount:=coalesce(nullif(v_row->>'amount','')::numeric,0); v_paid:=coalesce(nullif(v_row->>'paid','')::numeric,0); v_due:=nullif(v_row->>'due','')::date;
  exception when others then raise exception 'Row % has an invalid amount or date',v_row_no; end;
  if v_admission='' or v_name='' or v_class='' then raise exception 'Row % needs admission number, student name, and class',v_row_no; end if;
  if v_amount<0 or v_paid<0 or v_paid>v_amount then raise exception 'Row % has an invalid fee or paid amount',v_row_no; end if;
  if lower(v_method) not in ('cash','upi','bank transfer','card','cheque','other') then raise exception 'Row % has an unsupported payment method',v_row_no; end if;
  if lower(v_admission)=any(v_seen) then raise exception 'Duplicate admission number in row %',v_row_no; end if; v_seen:=array_append(v_seen,lower(v_admission));
  if v_ref is not null and exists(select 1 from public.fee_payments where payment_reference=v_ref) then raise exception 'Transaction reference already exists (row %)',v_row_no; end if;
  select id into v_class_id from public.classes where school_id=v_profile.school_id and regexp_replace(lower(name),'^class\\s*','')=regexp_replace(lower(v_class),'^class\\s*','') and lower(coalesce(section,'A'))=lower(v_section) limit 1;
  select * into v_student from public.students where school_id=v_profile.school_id and lower(admission_number)=lower(v_admission) limit 1;
  if not found then insert into public.students(school_id,admission_number,full_name,class_id,status) values(v_profile.school_id,v_admission,v_name,v_class_id,'active') returning * into v_student; v_new_students:=v_new_students+1;
  else v_existing_students:=v_existing_students+1; if v_student.full_name is distinct from v_name or (v_class_id is not null and v_student.class_id is distinct from v_class_id) then raise exception 'Existing student data differs for admission %; resolve it before importing',v_admission; end if; end if;
  if v_amount>0 then
   insert into public.fee_invoices(school_id,student_id,invoice_number,description,amount,due_date,status) values(v_profile.school_id,v_student.id,'IMP-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)),v_description,v_amount,v_due,case when v_paid>=v_amount then 'paid' when v_paid>0 then 'partial' else 'unpaid' end) returning * into v_invoice;
   v_new_invoices:=v_new_invoices+1;
   if v_paid>0 then v_receipt:='IMP-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)); insert into public.fee_payments(school_id,invoice_id,amount,payment_method,payment_reference,received_by,paid_at,receipt_number) values(v_profile.school_id,v_invoice.id,v_paid,v_method,v_ref,v_profile.id,now(),v_receipt); v_new_payments:=v_new_payments+1; end if;
  end if;
 end loop;
 return jsonb_build_object('new_students',v_new_students,'existing_students',v_existing_students,'new_invoices',v_new_invoices,'new_payments',v_new_payments,'rows',v_row_no);
end;
$$;
revoke all on function public.import_school_fee_rows(jsonb) from public, anon;
grant execute on function public.import_school_fee_rows(jsonb) to authenticated;
