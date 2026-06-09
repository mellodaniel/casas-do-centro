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
} from 'lucide-react';
import {
  createCrmLead,
  leadStatusLabels,
  leadStatusOptions,
  listCrmLeads,
  updateCrmLead,
  type CrmLead,
  type LeadStatus,
} from '../lib/crmService';

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

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-PT', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getLeadStatusClass(status: LeadStatus) {
  return `admin-crm-status admin-crm-status-${status}`;
}

export function AdminCrmManager() {
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'todos'>('todos');
  const [form, setForm] = useState<NewLeadForm>(emptyLeadForm);
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

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

  async function loadLeads(filter = statusFilter) {
    setIsLoading(true);
    setStatusMessage('');

    try {
      const data = await listCrmLeads(filter);
      setLeads(data);

      const notes = data.reduce<Record<string, string>>((acc, lead) => {
        acc[lead.id] = lead.internal_notes || '';
        return acc;
      }, {});

      setNotesDraft(notes);
    } catch {
      setStatusMessage('Não foi possível carregar os pedidos do CRM.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadLeads();
  }, []);

  function updateFormField<K extends keyof NewLeadForm>(
    field: K,
    value: NewLeadForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleFilterChange(value: LeadStatus | 'todos') {
    setStatusFilter(value);
    await loadLeads(value);
  }

  async function handleCreateLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSaving(true);
    setStatusMessage('');

    try {
      await createCrmLead(form);
      setForm(emptyLeadForm);
      await loadLeads(statusFilter);
      setStatusMessage('Pedido criado com sucesso.');
    } catch {
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
      setStatusMessage('Estado do pedido atualizado.');
    } catch {
      setStatusMessage('Erro ao atualizar o estado do pedido.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveNotes(lead: CrmLead) {
    setIsSaving(true);
    setStatusMessage('');

    try {
      await updateCrmLead({
        id: lead.id,
        internal_notes: notesDraft[lead.id] || '',
      });

      await loadLeads(statusFilter);
      setStatusMessage('Notas internas guardadas.');
    } catch {
      setStatusMessage('Erro ao guardar notas internas.');
    } finally {
      setIsSaving(false);
    }
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

      {statusMessage && <div className="admin-alert">{statusMessage}</div>}

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

      {isLoading ? (
        <div className="admin-empty-state">A carregar pedidos...</div>
      ) : leads.length === 0 ? (
        <div className="admin-empty-state">
          Ainda não existem pedidos para este filtro.
        </div>
      ) : (
        <div className="admin-crm-list">
          {leads.map((lead) => {
            const isExpanded = expandedLeadId === lead.id;

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
                      onClick={() =>
                        setExpandedLeadId(isExpanded ? null : lead.id)
                      }
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

                    <label>
                      Notas internas
                      <textarea
                        rows={5}
                        value={notesDraft[lead.id] || ''}
                        onChange={(event) =>
                          setNotesDraft((current) => ({
                            ...current,
                            [lead.id]: event.target.value,
                          }))
                        }
                        placeholder="Notas internas sobre este pedido"
                      />
                    </label>

                    <button
                      type="button"
                      className="admin-save-button"
                      onClick={() => handleSaveNotes(lead)}
                      disabled={isSaving}
                    >
                      <Save size={18} />
                      Guardar notas
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="admin-note">
        <strong>Nota importante:</strong>
        <p>
          Esta área serve para acompanhar oportunidades comerciais. Os estados ajudam a
          perceber em que fase está cada contacto.
        </p>
      </div>
    </div>
  );
}