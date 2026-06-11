import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Activity,
  BarChart3,
  Clock,
  ExternalLink,
  Instagram,
  MousePointerClick,
  RefreshCw,
  Smartphone,
  TrendingUp,
  MessageCircle,
  AlertTriangle,
} from 'lucide-react';
import {
  getAnalyticsDashboard,
  type AnalyticsDashboard,
  type AnalyticsEvent,
} from '../lib/analyticsService';

const eventTypeLabels: Record<string, string> = {
  page_view: 'Visita de página',
  whatsapp_click: 'Clique WhatsApp',
  instagram_click: 'Clique Instagram',
  cta_click: 'Clique em CTA',
  contact_form_submit: 'Pedido enviado',
  contact_form_error: 'Erro no formulário',
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatEventType(eventType: string) {
  return eventTypeLabels[eventType] || eventType;
}

function getEventIcon(eventType: string) {
  if (eventType === 'whatsapp_click') {
    return <MessageCircle size={17} />;
  }

  if (eventType === 'instagram_click') {
    return <Instagram size={17} />;
  }

  if (eventType === 'contact_form_error') {
    return <AlertTriangle size={17} />;
  }

  if (eventType === 'page_view') {
    return <ExternalLink size={17} />;
  }

  return <MousePointerClick size={17} />;
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="admin-observability-summary-card">
      {icon}
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function DistributionList({
  items,
  emptyLabel,
}: {
  items: Array<{ label: string; count: number }>;
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return <div className="admin-empty-state">{emptyLabel}</div>;
  }

  return (
    <div className="admin-observability-list">
      {items.map((item) => (
        <div className="admin-observability-row" key={item.label}>
          <strong>{item.label}</strong>
          <span>{item.count}</span>
        </div>
      ))}
    </div>
  );
}

function EventRow({ event }: { event: AnalyticsEvent }) {
  return (
    <article className="admin-observability-event">
      <div className="admin-observability-event-header">
        <span className="admin-observability-event-type">
          {getEventIcon(event.event_type)}
          {formatEventType(event.event_type)}
        </span>

        <span className="admin-observability-event-date">
          {formatDateTime(event.created_at)}
        </span>
      </div>

      <div className="admin-observability-event-main">
        <span>Página: {event.page_path}</span>
        {event.device_type && <span>Dispositivo: {event.device_type}</span>}
        {event.browser && <span>Browser: {event.browser}</span>}
      </div>
    </article>
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
        'Não foi possível carregar os dados de observabilidade. Confirma se a tabela casas_centro_analytics_events foi criada no Supabase.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const recentEvents = useMemo(() => {
    return dashboard?.events.slice(0, 30) || [];
  }, [dashboard]);

  return (
    <section className="admin-card admin-observability-card">
      <div className="admin-card-heading admin-observability-heading">
        <BarChart3 size={24} />
        <div>
          <h3>Observabilidade do website</h3>
          <p>
            Acompanhe visitas, páginas, cliques importantes, pedidos enviados e
            eventos recentes registados no site.
          </p>
        </div>
      </div>

      <div className="admin-observability-refresh">
        <button
          type="button"
          className="admin-secondary-button"
          onClick={loadDashboard}
          disabled={isLoading}
        >
          <RefreshCw size={18} />
          {isLoading ? 'A atualizar...' : 'Atualizar dados'}
        </button>
      </div>

      {errorMessage && <div className="admin-alert">{errorMessage}</div>}

      {isLoading && !dashboard ? (
        <div className="admin-empty-state">A carregar estatísticas...</div>
      ) : dashboard ? (
        <>
          <div className="admin-observability-summary">
            <SummaryCard
              icon={<Activity size={22} />}
              value={dashboard.pageViewsToday}
              label="Visitas hoje"
            />
            <SummaryCard
              icon={<TrendingUp size={22} />}
              value={dashboard.pageViews7Days}
              label="Visitas nos últimos 7 dias"
            />
            <SummaryCard
              icon={<BarChart3 size={22} />}
              value={dashboard.pageViews30Days}
              label="Visitas nos últimos 30 dias"
            />
            <SummaryCard
              icon={<MessageCircle size={22} />}
              value={dashboard.whatsappClicks30Days}
              label="Cliques no WhatsApp"
            />
            <SummaryCard
              icon={<Instagram size={22} />}
              value={dashboard.instagramClicks30Days}
              label="Cliques no Instagram"
            />
            <SummaryCard
              icon={<MousePointerClick size={22} />}
              value={`${dashboard.conversionRate30Days}%`}
              label="Conversão visita / pedido"
            />
          </div>

          <div className="admin-observability-summary">
            <SummaryCard
              icon={<MousePointerClick size={22} />}
              value={dashboard.contactFormSubmits30Days}
              label="Pedidos enviados"
            />
            <SummaryCard
              icon={<AlertTriangle size={22} />}
              value={dashboard.contactFormErrors30Days}
              label="Erros no formulário"
            />
            <SummaryCard
              icon={<Clock size={22} />}
              value={recentEvents.length}
              label="Eventos recentes listados"
            />
            <SummaryCard
              icon={<Smartphone size={22} />}
              value={dashboard.deviceDistribution[0]?.label || '-'}
              label="Dispositivo mais comum"
            />
            <SummaryCard
              icon={<ExternalLink size={22} />}
              value={dashboard.topPages[0]?.label || '-'}
              label="Página mais visitada"
            />
            <SummaryCard
              icon={<Activity size={22} />}
              value={dashboard.eventDistribution[0]?.label || '-'}
              label="Evento mais comum"
            />
          </div>

          <div className="admin-observability-grid">
            <div className="admin-observability-panel">
              <h4>Páginas mais visitadas</h4>
              <DistributionList
                items={dashboard.topPages}
                emptyLabel="Ainda não há visitas registadas."
              />
            </div>

            <div className="admin-observability-panel">
              <h4>Eventos por tipo</h4>
              <DistributionList
                items={dashboard.eventDistribution.map((item) => ({
                  ...item,
                  label: formatEventType(item.label),
                }))}
                emptyLabel="Ainda não há eventos registados."
              />
            </div>

            <div className="admin-observability-panel">
              <h4>Dispositivos</h4>
              <DistributionList
                items={dashboard.deviceDistribution}
                emptyLabel="Ainda não há dados de dispositivos."
              />
            </div>

            <div className="admin-observability-panel">
              <h4>Leitura rápida</h4>
              <div className="admin-alert admin-alert-info">
                Estes dados são internos e anónimos. O objetivo é perceber a
                utilização do site, cliques importantes e conversão comercial,
                sem guardar dados pessoais dos visitantes.
              </div>
            </div>
          </div>

          <div className="admin-observability-panel">
            <h4>Últimos eventos</h4>

            {recentEvents.length === 0 ? (
              <div className="admin-empty-state">
                Ainda não há eventos registados. Depois de visitar o site público,
                esta área começará a apresentar dados.
              </div>
            ) : (
              <div className="admin-observability-events">
                {recentEvents.map((event) => (
                  <EventRow event={event} key={event.id} />
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </section>
  );
}
