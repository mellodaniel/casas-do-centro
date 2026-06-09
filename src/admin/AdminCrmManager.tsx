import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  ClipboardList,
  Plus,
  RefreshCcw,
  Save,
  UserRound,
  Phone,
  Mail,
  MapPin,
  Search,
  MessageSquareText,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  createCrmFollowUp,
  createCrmLead,
  followUpContactTypeLabels,
  followUpContactTypeOptions,
  leadOriginLabels,
  leadStatusLabels,
  leadStatusOptions,
  listCrmFollowUps,
  listCrmLeads,
  updateCrmLead,
  type CrmFollowUp,
  type CrmLead,
  type FollowUpContactType,
  type LeadStatus,
} from '../lib/crmService';
import {
  getCurrentAdminProfile,
  type CurrentAdminProfile,
} from '../lib/adminUsersService';

type NewLeadForm = {
  name: string;
  phone: string;
  email: string;
  location: string;
  project_type: string;
  has_land: string;
  desired_area: string;
  message: string;
};

type FollowUpForm = {
  contact_type: FollowUpContactType;
  note: string;
  next_action: string;
};

const emptyLeadForm: NewLeadForm = {
  name: '',
  phone: '',
  email: '',
  location: '',
  project_type: '',
  has_land: '',
  desired_area: '',
  message: '',
};

const emptyFollowUpForm: FollowUpForm = {
  contact_type: 'nota',
  note: '',
  next_action: '',
};

const PAGE_SIZE = 8;

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-PT', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getLeadStatusClass(status: LeadStatus) {
  return `admin-crm-status admin-crm-status-${status}`;
}

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

function leadMatchesSearch(lead: CrmLead, searchValue: string) {
  const normalizedSearch = normalizeSearch(searchValue);

  if (!normalizedSearch) {
    return true;
  }

  const searchableText = [
    lead.name,
    lead.phone,
    lead.email,
    lead.location,
    lead.project_type,
    lead.has_land,
    lead.desired_area,
    lead.message,
    lead.status,
    lead.origin,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return searchableText.includes(normalizedSearch);
}

export function AdminCrmManager() {
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [followUpsByLeadId, setFollowUpsByLeadId] = useState<
    Record<string, CrmFollowUp[]>
  >({});
  const [currentProfile, setCurrentProfile] = useState<CurrentAdminProfile | null>(
    null
  );
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'todos'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState<NewLeadForm>(emptyLeadForm);
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
  const [followUpForms, setFollowUpForms] = useState<Record<string, FollowUpForm>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'warning' | 'info'>('info');

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => leadMatchesSearch(lead, searchTerm));
  }, [leads, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / PAGE_SIZE));

  const paginatedLeads = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * PAGE_SIZE;

    return filteredLeads.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, filteredLeads, totalPages]);

  const counters = useMemo(() => {
    return leads.reduce(
      (acc, lead) => {
        acc.total += 1;
        acc[lead.status] += 1;
        return acc;
      },
      {
        total: 0,
        novo: 0,
        em_contacto: 0,
        orcamento_enviado: 0,
        em_negociacao: 0,
        fechado: 0,
        perdido: 0,
      } as Record<LeadStatus | 'total', number>
    );
  }, [leads]);

  async function loadCurrentProfile() {
    const profile = await getCurrentAdminProfile();
    setCurrentProfile(profile);
    return profile;
  }

  async function loadLeads(filter = statusFilter) {
    setIsLoading(true);
    setStatusMessage('');

    try {
      const [data] = await Promise.all([
        listCrmLeads(filter),
        currentProfile ? Promise.resolve(currentProfile) : loadCurrentProfile(),
      ]);

      setLeads(data);
      setCurrentPage(1);
    } catch {
      setStatusType('warning');
      setStatusMessage('Não foi possível carregar os pedidos do CRM.');
    } finally {
      setIsLoading(false);
    }
  }

  async function loadFollowUps(leadId: string) {
    try {
      const followUps = await listCrmFollowUps(leadId);

      setFollowUpsByLeadId((current) => ({
        ...current,
        [leadId]: followUps,
      }));
    } catch {
      setStatusType('warning');
      setStatusMessage('Não foi possível carregar o histórico deste contacto.');
    }
  }

  useEffect(() => {
    loadLeads();
  }, []);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  function updateFormField<K extends keyof NewLeadForm>(
    field: K,
    value: NewLeadForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateFollowUpFormField<K extends keyof FollowUpForm>(
    leadId: string,
    field: K,
    value: FollowUpForm[K]
  ) {
    setFollowUpForms((current) => ({
      ...current,
      [leadId]: {
        ...(current[leadId] || emptyFollowUpForm),
        [field]: value,
      },
    }));
  }

  async function handleFilterChange(value: LeadStatus | 'todos') {
    setStatusFilter(value);
    setCurrentPage(1);
    await loadLeads(value);
  }

  function handleSearchChange(value: string) {
    setSearchTerm(value);
    setCurrentPage(1);
  }

  async function handleCreateLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSaving(true);
    setStatusMessage('');

    try {
      await createCrmLead({
        ...form,
        origin: 'manual',
      });

      setForm(emptyLeadForm);
      await loadLeads(statusFilter);
      setStatusType('success');
      setStatusMessage('Pedido criado com sucesso.');
    } catch {
      setStatusType('warning');
      setStatusMessage('Erro ao criar pedido.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleChangeStatus(lead: CrmLead, status: LeadStatus) {
    setIsSaving(true);
    setStatusMessage('');

    try {
      await updateCrmLead({
        id: lead.id,
        status,
      });

      await loadLeads(statusFilter);
      setStatusType('success');
      setStatusMessage('Estado do pedido atualizado.');
    } catch {
      setStatusType('warning');
      setStatusMessage('Erro ao atualizar o estado do pedido.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleLeadDetails(lead: CrmLead) {
    const nextExpandedLeadId = expandedLeadId === lead.id ? null : lead.id;

    setExpandedLeadId(nextExpandedLeadId);

    if (nextExpandedLeadId && !followUpsByLeadId[lead.id]) {
      await loadFollowUps(lead.id);
    }
  }

  async function handleCreateFollowUp(lead: CrmLead) {
    const followUpForm = followUpForms[lead.id] || emptyFollowUpForm;

    if (!followUpForm.note.trim()) {
      setStatusType('warning');
      setStatusMessage('Escreve uma nota antes de guardar o follow-up.');
      return;
    }

    setIsSaving(true);
    setStatusMessage('');

    try {
      await createCrmFollowUp({
        lead_id: lead.id,
        contact_type: followUpForm.contact_type,
        note: followUpForm.note,
        next_action: followUpForm.next_action,
        created_by: currentProfile
          ? `${currentProfile.name} (@${currentProfile.username})`
          : 'Utilizador admin',
        created_by_user_id: currentProfile?.auth_user_id,
      });

      setFollowUpForms((current) => ({
        ...current,
        [lead.id]: emptyFollowUpForm,
      }));

      await loadFollowUps(lead.id);
      setStatusType('success');
      setStatusMessage('Follow-up registado com sucesso.');
    } catch {
      setStatusType('warning');
      setStatusMessage('Erro ao guardar follow-up.');
    } finally {
      setIsSaving(false);
    }
  }

  function goToPreviousPage() {
    setCurrentPage((current) => Math.max(1, current - 1));
  }

  function goToNextPage() {
    setCurrentPage((current) => Math.min(totalPages, current + 1));
  }

  return (
    <div id="crm" className="admin-card admin-crm-card">
      <div className="admin-card-heading admin-crm-heading">
        <ClipboardList size={22} />
        <div>
          <h3>CRM / Pedidos</h3>
          <p>Gerir pedidos de contacto e oportunidades recebidas pelo website.</p>
        </div>
      </div>

      {statusMessage && (
        <div
          className={
            statusType === 'success'
              ? 'admin-alert admin-alert-success'
              : statusType === 'warning'
                ? 'admin-alert admin-alert-warning'
                : 'admin-alert admin-alert-info'
          }
        >
          {statusMessage}
        </div>
      )}

      <div className="admin-crm-summary">
        <div>
          <strong>{counters.total}</strong>
          <span>Total</span>
        </div>
        <div>
          <strong>{counters.novo}</strong>
          <span>Novos</span>
        </div>
        <div>
          <strong>{counters.em_contacto}</strong>
          <span>Em contacto</span>
        </div>
        <div>
          <strong>{counters.orcamento_enviado}</strong>
          <span>Orçamentos</span>
        </div>
        <div>
          <strong>{counters.fechado}</strong>
          <span>Fechados</span>
        </div>
      </div>

      <form className="admin-crm-form" onSubmit={handleCreateLead}>
        <div className="admin-users-form-heading">
          <div>
            <strong>Novo pedido manual</strong>
            <p>Regista manualmente um contacto recebido por telefone, WhatsApp ou email.</p>
          </div>
          <Plus size={22} />
        </div>

        <div className="admin-two-fields">
          <label>
            Nome
            <input
              value={form.name}
              onChange={(event) => updateFormField('name', event.target.value)}
              placeholder="Nome do cliente"
              required
            />
          </label>

          <label>
            Telefone
            <input
              value={form.phone}
              onChange={(event) => updateFormField('phone', event.target.value)}
              placeholder="Telefone ou WhatsApp"
              required
            />
          </label>
        </div>

        <div className="admin-two-fields">
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateFormField('email', event.target.value)}
              placeholder="Email do cliente"
            />
          </label>

          <label>
            Localidade
            <input
              value={form.location}
              onChange={(event) => updateFormField('location', event.target.value)}
              placeholder="Ex: Leiria, Pombal, Coimbra"
            />
          </label>
        </div>

        <div className="admin-two-fields">
          <label>
            Tipo de projeto
            <input
              value={form.project_type}
              onChange={(event) => updateFormField('project_type', event.target.value)}
              placeholder="Ex: Casa T2, T3, turismo, anexo"
            />
          </label>

          <label>
            Já tem terreno?
            <select
              value={form.has_land}
              onChange={(event) => updateFormField('has_land', event.target.value)}
            >
              <option value="">Não indicado</option>
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
              <option value="Em análise">Em análise</option>
            </select>
          </label>
        </div>

        <label>
          Área pretendida
          <input
            value={form.desired_area}
            onChange={(event) => updateFormField('desired_area', event.target.value)}
            placeholder="Ex: 80m², 100m², ainda não sabe"
          />
        </label>

        <label>
          Mensagem
          <textarea
            rows={4}
            value={form.message}
            onChange={(event) => updateFormField('message', event.target.value)}
            placeholder="Resumo do pedido"
          />
        </label>

        <button type="submit" className="admin-save-button" disabled={isSaving}>
          <Save size={20} />
          {isSaving ? 'A guardar...' : 'Criar pedido'}
        </button>
      </form>

      <div className="admin-users-list-header">
        <div>
          <strong>Pedidos existentes</strong>
          <p>Lista de contactos e oportunidades comerciais.</p>
        </div>

        <div className="admin-crm-actions">
          <div className="admin-crm-search">
            <Search size={18} />
            <input
              value={searchTerm}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Pesquisar por nome, telefone, email, localidade..."
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              handleFilterChange(event.target.value as LeadStatus | 'todos')
            }
          >
            {leadStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="admin-secondary-button"
            onClick={() => loadLeads(statusFilter)}
            disabled={isLoading}
          >
            <RefreshCcw size={18} />
            Atualizar
          </button>
        </div>
      </div>

      <div className="admin-crm-pagination-info">
        <span>
          A mostrar {paginatedLeads.length} de {filteredLeads.length} contactos
        </span>
        <span>
          Página {Math.min(currentPage, totalPages)} de {totalPages}
        </span>
      </div>

      {isLoading ? (
        <div className="admin-empty-state">A carregar pedidos...</div>
      ) : filteredLeads.length === 0 ? (
        <div className="admin-empty-state">
          Não existem contactos para este filtro ou pesquisa.
        </div>
      ) : (
        <>
          <div className="admin-crm-list">
            {paginatedLeads.map((lead) => {
              const isExpanded = expandedLeadId === lead.id;
              const followUps = followUpsByLeadId[lead.id] || [];
              const currentFollowUpForm = followUpForms[lead.id] || emptyFollowUpForm;

              return (
                <div className="admin-crm-lead" key={lead.id}>
                  <div className="admin-crm-lead-header">
                    <div className="admin-crm-lead-main">
                      <div className="admin-user-avatar">
                        <UserRound size={22} />
                      </div>

                      <div>
                        <strong>{lead.name}</strong>
                        <span>{formatDate(lead.created_at)}</span>
                      </div>
                    </div>

                    <div className="admin-crm-lead-controls">
                      <span className={getLeadStatusClass(lead.status)}>
                        {leadStatusLabels[lead.status]}
                      </span>

                      <span className="admin-crm-origin">
                        {leadOriginLabels[lead.origin] || 'Origem desconhecida'}
                      </span>

                      <select
                        value={lead.status}
                        onChange={(event) =>
                          handleChangeStatus(lead, event.target.value as LeadStatus)
                        }
                        disabled={isSaving}
                      >
                        {leadStatusOptions
                          .filter((option) => option.value !== 'todos')
                          .map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                      </select>

                      <button
                        type="button"
                        className="admin-secondary-button"
                        onClick={() => handleToggleLeadDetails(lead)}
                      >
                        {isExpanded ? 'Fechar' : 'Detalhes'}
                      </button>
                    </div>
                  </div>

                  <div className="admin-crm-lead-info">
                    <span>
                      <Phone size={15} />
                      {lead.phone}
                    </span>

                    {lead.email && (
                      <span>
                        <Mail size={15} />
                        {lead.email}
                      </span>
                    )}

                    {lead.location && (
                      <span>
                        <MapPin size={15} />
                        {lead.location}
                      </span>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="admin-crm-lead-details">
                      <div className="admin-crm-detail-grid">
                        <div>
                          <strong>Tipo de projeto</strong>
                          <span>{lead.project_type || 'Não indicado'}</span>
                        </div>

                        <div>
                          <strong>Tem terreno?</strong>
                          <span>{lead.has_land || 'Não indicado'}</span>
                        </div>

                        <div>
                          <strong>Área pretendida</strong>
                          <span>{lead.desired_area || 'Não indicado'}</span>
                        </div>

                        <div>
                          <strong>Última atualização</strong>
                          <span>{formatDate(lead.updated_at)}</span>
                        </div>
                      </div>

                      <div className="admin-crm-message-box">
                        <strong>Mensagem do cliente</strong>
                        <p>{lead.message || 'Sem mensagem.'}</p>
                      </div>

                      <div className="admin-crm-followup-box">
                        <div className="admin-crm-followup-title">
                          <MessageSquareText size={20} />
                          <div>
                            <strong>Novo follow-up</strong>
                            <p>
                              Regista cada contacto feito com este cliente. O histórico
                              fica guardado com data, hora e utilizador.
                            </p>
                          </div>
                        </div>

                        <div className="admin-two-fields">
                          <label>
                            Tipo de contacto
                            <select
                              value={currentFollowUpForm.contact_type}
                              onChange={(event) =>
                                updateFollowUpFormField(
                                  lead.id,
                                  'contact_type',
                                  event.target.value as FollowUpContactType
                                )
                              }
                            >
                              {followUpContactTypeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label>
                            Próxima ação
                            <input
                              value={currentFollowUpForm.next_action}
                              onChange={(event) =>
                                updateFollowUpFormField(
                                  lead.id,
                                  'next_action',
                                  event.target.value
                                )
                              }
                              placeholder="Ex: Ligar amanhã, enviar orçamento, aguardar resposta"
                            />
                          </label>
                        </div>

                        <label>
                          Nota do follow-up
                          <textarea
                            rows={5}
                            value={currentFollowUpForm.note}
                            onChange={(event) =>
                              updateFollowUpFormField(lead.id, 'note', event.target.value)
                            }
                            placeholder="Ex: Contacto realizado. Cliente demonstrou interesse em casa T3..."
                          />
                        </label>

                        <button
                          type="button"
                          className="admin-save-button"
                          onClick={() => handleCreateFollowUp(lead)}
                          disabled={isSaving}
                        >
                          <Save size={18} />
                          Guardar follow-up
                        </button>
                      </div>

                      <div className="admin-crm-history">
                        <div className="admin-crm-history-heading">
                          <Clock size={20} />
                          <div>
                            <strong>Histórico de follow-ups</strong>
                            <p>
                              {followUps.length === 0
                                ? 'Ainda não existem follow-ups registados.'
                                : `${followUps.length} ${
                                    followUps.length === 1
                                      ? 'registo encontrado'
                                      : 'registos encontrados'
                                  }`}
                            </p>
                          </div>
                        </div>

                        {followUps.length > 0 && (
                          <div className="admin-crm-history-list">
                            {followUps.map((followUp) => (
                              <div className="admin-crm-history-item" key={followUp.id}>
                                <div className="admin-crm-history-meta">
                                  <span>
                                    {followUpContactTypeLabels[followUp.contact_type]}
                                  </span>
                                  <small>{formatDate(followUp.created_at)}</small>
                                </div>

                                <p>{followUp.note}</p>

                                {followUp.next_action && (
                                  <div className="admin-crm-next-action">
                                    <strong>Próxima ação:</strong>{' '}
                                    {followUp.next_action}
                                  </div>
                                )}

                                <small>
                                  Registado por:{' '}
                                  {followUp.created_by || 'Utilizador não identificado'}
                                </small>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="admin-crm-pagination">
            <button
              type="button"
              className="admin-secondary-button"
              onClick={goToPreviousPage}
              disabled={currentPage <= 1}
            >
              <ChevronLeft size={18} />
              Anterior
            </button>

            <span>
              Página {Math.min(currentPage, totalPages)} de {totalPages}
            </span>

            <button
              type="button"
              className="admin-secondary-button"
              onClick={goToNextPage}
              disabled={currentPage >= totalPages}
            >
              Seguinte
              <ChevronRight size={18} />
            </button>
          </div>
        </>
      )}

      <div className="admin-note">
        <strong>Nota importante:</strong>
        <p>
          Esta área serve para acompanhar oportunidades comerciais. Os estados e
          follow-ups ajudam a perceber em que fase está cada contacto.
        </p>
      </div>
    </div>
  );
}