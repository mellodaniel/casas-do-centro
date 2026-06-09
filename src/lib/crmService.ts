import { supabase } from './supabaseClient';

export const CRM_LEADS_TABLE = 'casas_centro_leads';

export type LeadStatus =
  | 'novo'
  | 'em_contacto'
  | 'orcamento_enviado'
  | 'em_negociacao'
  | 'fechado'
  | 'perdido';

export type CrmLead = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  location: string | null;
  project_type: string | null;
  has_land: string | null;
  desired_area: string | null;
  message: string | null;
  status: LeadStatus;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateCrmLeadInput = {
  name: string;
  phone: string;
  email?: string;
  location?: string;
  project_type?: string;
  has_land?: string;
  desired_area?: string;
  message?: string;
};

export type UpdateCrmLeadInput = {
  id: string;
  status?: LeadStatus;
  internal_notes?: string;
};

export const leadStatusLabels: Record<LeadStatus, string> = {
  novo: 'Novo',
  em_contacto: 'Em contacto',
  orcamento_enviado: 'Orçamento enviado',
  em_negociacao: 'Em negociação',
  fechado: 'Fechado',
  perdido: 'Perdido',
};

export const leadStatusOptions: Array<{
  value: LeadStatus | 'todos';
  label: string;
}> = [
  { value: 'todos', label: 'Todos' },
  { value: 'novo', label: 'Novo' },
  { value: 'em_contacto', label: 'Em contacto' },
  { value: 'orcamento_enviado', label: 'Orçamento enviado' },
  { value: 'em_negociacao', label: 'Em negociação' },
  { value: 'fechado', label: 'Fechado' },
  { value: 'perdido', label: 'Perdido' },
];

export async function listCrmLeads(status: LeadStatus | 'todos' = 'todos') {
  let query = supabase
    .from(CRM_LEADS_TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  if (status !== 'todos') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data || []) as CrmLead[];
}

export async function createCrmLead(input: CreateCrmLeadInput) {
  const { data, error } = await supabase
    .from(CRM_LEADS_TABLE)
    .insert({
      name: input.name.trim(),
      phone: input.phone.trim(),
      email: input.email?.trim() || null,
      location: input.location?.trim() || null,
      project_type: input.project_type?.trim() || null,
      has_land: input.has_land?.trim() || null,
      desired_area: input.desired_area?.trim() || null,
      message: input.message?.trim() || null,
      status: 'novo',
      internal_notes: null,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as CrmLead;
}

export async function updateCrmLead(input: UpdateCrmLeadInput) {
  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.status) {
    updatePayload.status = input.status;
  }

  if (typeof input.internal_notes === 'string') {
    updatePayload.internal_notes = input.internal_notes;
  }

  const { data, error } = await supabase
    .from(CRM_LEADS_TABLE)
    .update(updatePayload)
    .eq('id', input.id)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as CrmLead;
}