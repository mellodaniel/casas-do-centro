import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  ExternalLink,
  Globe2,
  Instagram,
  MapPin,
  MessageCircle,
  MousePointerClick,
  RefreshCw,
  Smartphone,
  TrendingUp,
} from 'lucide-react';
import {
  getAnalyticsDashboard,
  type AnalyticsDashboard,
  type AnalyticsEvent,
} from '../lib/analyticsService';

const eventTypeLabels: Record<string, string> = {
  page_view: 'Visita',
  whatsapp_click: 'WhatsApp',
  instagram_click: 'Instagram',
  cta_click: 'CTA',
  contact_form_submit: 'Pedido',
  contact_form_error: 'Erro',
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatEventType(eventType: string) {
  return eventTypeLabels[eventType] || eventType;
}

function formatLocation(event: AnalyticsEvent) {
  const locationParts = [event.city, event.region, event.country].filter(Boolean);

  if (locationParts.length === 0) {
    return 'Não identificado';
  }

  return locationParts.join(' / ');
}

function getEventIcon(eventType: string) {
  if (eventType === 'whatsapp_click') {
    return <MessageCircle size={15} />;
  }

  if (eventType === 'instagram_click') {
    return <Instagram size={15} />;
  }

  if (eventType === 'contact_form_error') {
    return <AlertTriangle size={15} />;
  }

  if (eventType === 'page_view') {
    return <ExternalLink size={15} />;
  }

  return <MousePointerClick size={15} />;
}

function MetricCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="admin-observability-metric">
      <div className="admin-observability-metric-icon">{icon}</div>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
        {hint && <small>{hint}</small>}
      </div>
    </div>
  );
}

function CompactList({
  items,
  emptyLabel,
  limit = 5,
}: {
  items: Array<{ label: string; count: number }>;
  emptyLabel: string;
  limit?: number;
}) {
  const visibleItems = items.slice(0, limit);
  const maxCount = Math.max(...visibleItems.map((item) => item.count), 1);

  if (visibleItems.length === 0) {
    return <div className="admin-observability-empty">{emptyLabel}</div>;
  }

  return (
    <div className="admin-observability-compact-list">
      {visibleItems.map((item) => (
        <div className="admin-observability-compact-row" key={item.label}>
          <div className="admin-observability-compact-row-main">
            <span>{item.label}</span>
            <strong>{item.count}</strong>
          </div>
          <div className="admin-observability-bar">
            <span style={{ width: `${Math.max((item.count / maxCount) * 100, 7)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function EventTable({ events }: { events: AnalyticsEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="admin-observability-empty">
        Ainda não há eventos registados. Depois de visitar o site público, esta
        área começará a apresentar dados.
      </div>
    );
  }

  return (
    <div className="admin-observability-table-wrap">
      <table className="admin-observability-table">
        <thead>
          <tr>
            <th>Evento</th>
            <th>Página</th>
            <th>Origem</th>
            <th>Dispositivo</th>
            <th>Hora</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id}>
              <td>
                <span className="admin-observability-event-pill">
                  {getEventIcon(event.event_type)}
                  {formatEventType(event.event_type)}
                </span>
              </td>
              <td>{event.page_path}</td>
              <td>{formatLocation(event)}</td>
              <td>
                {[event.device_type, event.browser].filter(Boolean).join(' / ') ||
                  'Desconhecido'}
              </td>
              <td>{formatDateTime(event.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminObservabilityManager() {
  const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  async function loadDashboard() {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await getAnalyticsDashboard();
      setDashboard(data);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        'Não foi possível carregar os dados de observabilidade. Confirma se a tabela casas_centro_analytics_events foi criada no Supabase e se as colunas country, region e city existem.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const recentEvents = useMemo(() => {
    return dashboard?.events.slice(0, 12) || [];
  }, [dashboard]);

  const mainLocation = useMemo(() => {
    if (!dashboard) {
      return '-';
    }

    return (
      dashboard.cityDistribution[0]?.label ||
      dashboard.regionDistribution[0]?.label ||
      dashboard.countryDistribution[0]?.label ||
      '-'
    );
  }, [dashboard]);

  return (
    <section className="admin-card admin-observability-card">
      <div className="admin-observability-top">
        <div className="admin-card-heading admin-observability-heading">
          <BarChart3 size={24} />
          <div>
            <h3>Observabilidade do website</h3>
            <p>
              Visão simples dos acessos, cliques, conversão e origem geográfica
              dos visitantes.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="admin-secondary-button"
          onClick={loadDashboard}
          disabled={isLoading}
        >
          <RefreshCw size={18} />
          {isLoading ? 'A atualizar...' : 'Atualizar'}
        </button>
      </div>

      {errorMessage && <div className="admin-alert">{errorMessage}</div>}

      {isLoading && !dashboard ? (
        <div className="admin-empty-state">A carregar estatísticas...</div>
      ) : dashboard ? (
        <>
          <div className="admin-observability-metrics">
            <MetricCard
              icon={<Activity size={20} />}
              value={dashboard.pageViewsToday}
              label="Hoje"
              hint="visitas"
            />
            <MetricCard
              icon={<TrendingUp size={20} />}
              value={dashboard.pageViews7Days}
              label="7 dias"
              hint="visitas"
            />
            <MetricCard
              icon={<BarChart3 size={20} />}
              value={dashboard.pageViews30Days}
              label="30 dias"
              hint="visitas"
            />
            <MetricCard
              icon={<MessageCircle size={20} />}
              value={dashboard.whatsappClicks30Days}
              label="WhatsApp"
              hint="cliques"
            />
            <MetricCard
              icon={<MousePointerClick size={20} />}
              value={dashboard.contactFormSubmits30Days}
              label="Pedidos"
              hint={`${dashboard.conversionRate30Days}% conversão`}
            />
            <MetricCard
              icon={<MapPin size={20} />}
              value={mainLocation}
              label="Origem principal"
            />
          </div>

          <div className="admin-observability-dashboard-grid">
            <div className="admin-observability-panel admin-observability-panel-large">
              <div className="admin-observability-panel-title">
                <h4>Páginas e eventos</h4>
                <span>Últimos 30 dias</span>
              </div>

              <div className="admin-observability-split">
                <div>
                  <h5>Páginas mais visitadas</h5>
                  <CompactList
                    items={dashboard.topPages}
                    emptyLabel="Ainda não há visitas registadas."
                  />
                </div>

                <div>
                  <h5>Eventos por tipo</h5>
                  <CompactList
                    items={dashboard.eventDistribution.map((item) => ({
                      ...item,
                      label: formatEventType(item.label),
                    }))}
                    emptyLabel="Ainda não há eventos registados."
                  />
                </div>
              </div>
            </div>

            <div className="admin-observability-panel">
              <div className="admin-observability-panel-title">
                <h4>Origem geográfica</h4>
                <Globe2 size={18} />
              </div>

              <div className="admin-observability-tabs-grid">
                <div>
                  <h5>Países</h5>
                  <CompactList
                    items={dashboard.countryDistribution}
                    emptyLabel="Ainda não há países identificados."
                    limit={4}
                  />
                </div>

                <div>
                  <h5>Cidades</h5>
                  <CompactList
                    items={dashboard.cityDistribution}
                    emptyLabel="Ainda não há cidades identificadas."
                    limit={4}
                  />
                </div>
              </div>
            </div>

            <div className="admin-observability-panel">
              <div className="admin-observability-panel-title">
                <h4>Dispositivos</h4>
                <Smartphone size={18} />
              </div>

              <CompactList
                items={dashboard.deviceDistribution}
                emptyLabel="Ainda não há dados de dispositivos."
                limit={4}
              />

              <div className="admin-observability-mini-note">
                <Instagram size={15} />
                Instagram: <strong>{dashboard.instagramClicks30Days}</strong>
                <span />
                Erros: <strong>{dashboard.contactFormErrors30Days}</strong>
              </div>
            </div>
          </div>

          <div className="admin-observability-panel">
            <div className="admin-observability-panel-title">
              <h4>Eventos recentes</h4>
              <span>Mostramos apenas os 12 mais recentes para manter a leitura limpa</span>
            </div>

            <EventTable events={recentEvents} />
          </div>

          <div className="admin-observability-footnote">
            A localização vem dos headers da Vercel e só aparece quando estiver
            disponível em produção. Não guardamos IP completo nem dados pessoais
            dos visitantes.
          </div>
        </>
      ) : null}
    </section>
  );
}
