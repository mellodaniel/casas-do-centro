import { supabase } from './supabaseClient';

export const CRM_LEADS_TABLE = 'casas_centro_leads';
export const CRM_FOLLOWUPS_TABLE = 'casas_centro_lead_followups';
export const CRM_STATUS_HISTORY_TABLE = 'casas_centro_lead_status_history';

export type LeadStatus =
  | 'novo'
  | 'em_contacto'
  | 'orcamento_enviado'
  | 'em_negociacao'
  | 'fechado'
  | 'cliente_fechado'
  | 'pedido_executado'
  | 'perdido';

export type LeadOrigin =
  | 'website'
  | 'manual'
  | 'whatsapp'
  | 'telefone'
  | 'email'
  | 'outro';

export type FollowUpContactType =
  | 'nota'
  | 'telefone'
  | 'whatsapp'
  | 'email'
  | 'reuniao'
  | 'orcamento'
  | 'outro';

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
  origin: LeadOrigin;
  internal_notes: string | null;
  next_follow_up_at: string | null;
  closed_at: string | null;
  executed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CrmFollowUp = {
  id: string;
  lead_id: string;
  note: string;
  contact_type: FollowUpContactType;
  next_action: string | null;
  next_action_date: string | null;
  created_by: string | null;
  created_by_user_id: string | null;
  created_at: string;
};

export type CrmStatusHistory = {
  id: string;
  lead_id: string;
  previous_status: LeadStatus | null;
  new_status: LeadStatus;
  changed_by: string | null;
  changed_by_user_id: string | null;
  created_at: string;
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
  origin?: LeadOrigin;
};

export type UpdateCrmLeadInput = {
  id: string;
  status?: LeadStatus;
  internal_notes?: string;
  next_follow_up_at?: string | null;
};

export type CreateCrmFollowUpInput = {
  lead_id: string;
  note: string;
  contact_type: FollowUpContactType;
  next_action?: string;
  next_action_date?: string | null;
  created_by?: string;
  created_by_user_id?: string;
};

export type CreateCrmStatusHistoryInput = {
  lead_id: string;
  previous_status?: LeadStatus | null;
  new_status: LeadStatus;
  changed_by?: string;
  changed_by_user_id?: string;
};

export const leadStatusLabels: Record<LeadStatus, string> = {
  novo: 'Novo',
  em_contacto: 'Em contacto',
  orcamento_enviado: 'Orçamento enviado',
  em_negociacao: 'Em negociação',
  fechado: 'Cliente fechado',
  cliente_fechado: 'Cliente fechado',
  pedido_executado: 'Pedido executado',
  perdido: 'Perdido',
};

export const leadOriginLabels: Record<LeadOrigin, string> = {
  website: 'Website',
  manual: 'Manual',
  whatsapp: 'WhatsApp',
  telefone: 'Telefone',
  email: 'Email',
  outro: 'Outro',
};

export const followUpContactTypeLabels: Record<FollowUpContactType, string> = {
  nota: 'Nota',
  telefone: 'Telefone',
  whatsapp: 'WhatsApp',
  email: 'Email',
  reuniao: 'Reunião',
  orcamento: 'Orçamento',
  outro: 'Outro',
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
  { value: 'cliente_fechado', label: 'Cliente fechado' },
  { value: 'pedido_executado', label: 'Pedido executado' },
  { value: 'perdido', label: 'Perdido' },
];

export const followUpContactTypeOptions: Array<{
  value: FollowUpContactType;
  label: string;
}> = [
  { value: 'nota', label: 'Nota' },
  { value: 'telefone', label: 'Telefone' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
  { value: 'reuniao', label: 'Reunião' },
  { value: 'orcamento', label: 'Orçamento' },
  { value: 'outro', label: 'Outro' },
];

export async function listCrmLeads(status: LeadStatus | 'todos' = 'todos') {
  let query = supabase
    .from(CRM_LEADS_TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  if (status !== 'todos') {
    if (status === 'cliente_fechado') {
      query = query.in('status', ['cliente_fechado', 'fechado']);
    } else {
      query = query.eq('status', status);
    }
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data || []) as CrmLead[];
}

export async function createCrmLead(input: CreateCrmLeadInput) {
  const { error } = await supabase.from(CRM_LEADS_TABLE).insert({
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim() || null,
    location: input.location?.trim() || null,
    project_type: input.project_type?.trim() || null,
    has_land: input.has_land?.trim() || null,
    desired_area: input.desired_area?.trim() || null,
    message: input.message?.trim() || null,
    status: 'novo',
    origin: input.origin || 'manual',
    internal_notes: null,
    next_follow_up_at: null,
    closed_at: null,
    executed_at: null,
  });

  if (error) {
    throw error;
  }
}

export async function updateCrmLead(input: UpdateCrmLeadInput) {
  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.status) {
    updatePayload.status = input.status;

    if (input.status === 'cliente_fechado' || input.status === 'fechado') {
      updatePayload.closed_at = new Date().toISOString();
    }

    if (input.status === 'pedido_executado') {
      updatePayload.executed_at = new Date().toISOString();
      updatePayload.next_follow_up_at = null;
    }

    if (input.status === 'perdido') {
      updatePayload.next_follow_up_at = null;
    }
  }

  if (typeof input.internal_notes === 'string') {
    updatePayload.internal_notes = input.internal_notes;
  }

  if ('next_follow_up_at' in input) {
    updatePayload.next_follow_up_at = input.next_follow_up_at || null;
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

export async function listCrmFollowUps(leadId: string) {
  const { data, error } = await supabase
    .from(CRM_FOLLOWUPS_TABLE)
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []) as CrmFollowUp[];
}

export async function createCrmFollowUp(input: CreateCrmFollowUpInput) {
  const { data, error } = await supabase
    .from(CRM_FOLLOWUPS_TABLE)
    .insert({
      lead_id: input.lead_id,
      note: input.note.trim(),
      contact_type: input.contact_type,
      next_action: input.next_action?.trim() || null,
      next_action_date: input.next_action_date || null,
      created_by: input.created_by?.trim() || null,
      created_by_user_id: input.created_by_user_id || null,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  if (input.next_action_date) {
    await updateCrmLead({
      id: input.lead_id,
      next_follow_up_at: input.next_action_date,
    });
  }

  return data as CrmFollowUp;
}

export async function listCrmStatusHistory(leadId: string) {
  const { data, error } = await supabase
    .from(CRM_STATUS_HISTORY_TABLE)
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []) as CrmStatusHistory[];
}

export async function createCrmStatusHistory(input: CreateCrmStatusHistoryInput) {
  const { data, error } = await supabase
    .from(CRM_STATUS_HISTORY_TABLE)
    .insert({
      lead_id: input.lead_id,
      previous_status: input.previous_status || null,
      new_status: input.new_status,
      changed_by: input.changed_by?.trim() || null,
      changed_by_user_id: input.changed_by_user_id || null,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as CrmStatusHistory;
}