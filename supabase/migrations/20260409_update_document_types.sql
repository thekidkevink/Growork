alter type public.document_type rename value 'certificate' to 'qualification';

alter type public.document_type add value if not exists 'national_id';
alter type public.document_type add value if not exists 'drivers_licence';
