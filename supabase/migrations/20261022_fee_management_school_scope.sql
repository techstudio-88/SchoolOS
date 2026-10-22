-- School-scoped fee ledger and spreadsheet import support.
-- Existing fee tables are empty in the target project; backfill to the single configured school.
alter table public.classes add column if not exists school_id uuid references public.schools(id);
alter table public.students add column if not exists school_id uuid references public.schools(id);
alter table public.fee_invoices add column if not exists school_id uuid references public.schools(id);
alter table public.fee_payments add column if not exists school_id uuid references public.schools(id);
alter table public.fee_payments add column if not exists payment_method text not null default 'cash';
alter table public.fee_payments add column if not exists receipt_number text;
update public.classes set school_id=(select id from public.schools order by created_at limit 1) where school_id is null;
update public.students set school_id=coalesce((select p.school_id from public.profiles p where p.id=students.profile_id),(select id from public.schools order by created_at limit 1)) where school_id is null;
update public.fee_invoices i set school_id=s.school_id from public.students s where i.student_id=s.id and i.school_id is null;
update public.fee_payments p set school_id=i.school_id from public.fee_invoices i where p.invoice_id=i.id and p.school_id is null;
alter table public.classes alter column school_id set not null;
alter table public.students alter column school_id set not null;
alter table public.fee_invoices alter column school_id set not null;
alter table public.fee_payments alter column school_id set not null;
create index if not exists classes_school_id_idx on public.classes(school_id);
create index if not exists students_school_admission_idx on public.students(school_id, admission_number);
create index if not exists fee_invoices_school_student_idx on public.fee_invoices(school_id, student_id);
create index if not exists fee_payments_school_paid_at_idx on public.fee_payments(school_id, paid_at desc);
drop policy if exists fees_manage_office on public.fee_invoices;
drop policy if exists fees_read_student_parent_or_staff on public.fee_invoices;
create policy fees_read_school_staff on public.fee_invoices for select to authenticated using (
 school_id=(select p.school_id from public.profiles p where p.id=(select auth.uid()) and p.active=true)
 and (select p.role from public.profiles p where p.id=(select auth.uid()) and p.active=true) in ('developer','owner','manager','principal','fees_counter')
);
create policy fees_manage_school_office on public.fee_invoices for all to authenticated using (
 school_id=(select p.school_id from public.profiles p where p.id=(select auth.uid()) and p.active=true)
 and (select p.role from public.profiles p where p.id=(select auth.uid()) and p.active=true) in ('developer','owner','manager','principal','fees_counter')
) with check (
 school_id=(select p.school_id from public.profiles p where p.id=(select auth.uid()) and p.active=true)
 and (select p.role from public.profiles p where p.id=(select auth.uid()) and p.active=true) in ('developer','owner','manager','principal','fees_counter')
);
drop policy if exists payments_manage_office on public.fee_payments;
drop policy if exists payments_read_student_parent_or_staff on public.fee_payments;
create policy payments_read_school_office on public.fee_payments for select to authenticated using (
 school_id=(select p.school_id from public.profiles p where p.id=(select auth.uid()) and p.active=true)
 and (select p.role from public.profiles p where p.id=(select auth.uid()) and p.active=true) in ('developer','owner','manager','principal','fees_counter')
);
create policy payments_manage_school_office on public.fee_payments for all to authenticated using (
 school_id=(select p.school_id from public.profiles p where p.id=(select auth.uid()) and p.active=true)
 and (select p.role from public.profiles p where p.id=(select auth.uid()) and p.active=true) in ('developer','owner','manager','principal','fees_counter')
) with check (
 school_id=(select p.school_id from public.profiles p where p.id=(select auth.uid()) and p.active=true)
 and (select p.role from public.profiles p where p.id=(select auth.uid()) and p.active=true) in ('developer','owner','manager','principal','fees_counter')
);
drop policy if exists students_manage_staff on public.students;
drop policy if exists students_read_authorized on public.students;
create policy students_read_same_school_office on public.students for select to authenticated using (
 school_id=(select p.school_id from public.profiles p where p.id=(select auth.uid()) and p.active=true)
 and (select p.role from public.profiles p where p.id=(select auth.uid()) and p.active=true) in ('developer','owner','manager','principal','vice_principal','control_room','class_teacher','subject_teacher','fees_counter')
);
create policy students_manage_same_school_office on public.students for all to authenticated using (
 school_id=(select p.school_id from public.profiles p where p.id=(select auth.uid()) and p.active=true)
 and (select p.role from public.profiles p where p.id=(select auth.uid()) and p.active=true) in ('developer','owner','manager','principal','class_teacher','fees_counter')
) with check (
 school_id=(select p.school_id from public.profiles p where p.id=(select auth.uid()) and p.active=true)
 and (select p.role from public.profiles p where p.id=(select auth.uid()) and p.active=true) in ('developer','owner','manager','principal','class_teacher','fees_counter')
);
