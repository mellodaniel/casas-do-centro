import {
  ClipboardList,
  FilePenLine,
  Users,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Image,
  MessageSquareText,
  Handshake,
  BarChart3,
  MousePointerClick,
} from 'lucide-react';

type AdminHomeProps = {
  onNavigate: (path: string) => void;
};

const dailyMessages = [
  {
    title: 'Mensagem do dia',
    text: 'Vender bem começa por ouvir melhor. Cada contacto é uma oportunidade para criar confiança.',
  },
  {
    title: 'Mensagem do dia',
    text: 'Um bom follow-up não pressiona o cliente. Ajuda o cliente a avançar com mais segurança.',
  },
  {
    title: 'Mensagem do dia',
    text: 'Quem acompanha bem hoje, constrói o cliente de amanhã.',
  },
  {
    title: 'Mensagem do dia',
    text: 'O cliente não compra apenas uma casa. Compra confiança, clareza e tranquilidade.',
  },
  {
    title: 'Mensagem do dia',
    text: 'Cada pedido registado é uma oportunidade que não fica perdida no WhatsApp ou na memória.',
  },
  {
    title: 'Mensagem do dia',
    text: 'A melhor venda é aquela em que o cliente sente que foi bem orientado.',
  },
  {
    title: 'Mensagem do dia',
    text: 'Organização comercial transforma contactos em oportunidades reais.',
  },
  {
    title: 'Mensagem do dia',
    text: 'Responder rápido é importante. Responder com clareza é o que cria confiança.',
  },
  {
    title: 'Mensagem do dia',
    text: 'Um cliente bem acompanhado lembra-se de quem o ajudou desde o primeiro contacto.',
  },
  {
    title: 'Mensagem do dia',
    text: 'Marketing atrai. Atendimento aproxima. Follow-up converte.',
  },
];

function getDailyMessage() {
  const today = new Date();
  const daySeed =
    today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

  return dailyMessages[daySeed % dailyMessages.length];
}

export function AdminHome({ onNavigate }: AdminHomeProps) {
  const dailyMessage = getDailyMessage();

  return (
    <div className="admin-home-page">
      <section className="admin-home-hero">
        <div>
          <span className="admin-kicker">Painel administrativo</span>
          <h2>Gestão Chalés do Centro</h2>
          <p>
            Gestão centralizada do website, contactos comerciais e acessos ao painel.
            Escolhe abaixo o módulo que queres administrar.
          </p>
        </div>

        <div className="admin-home-hero-badge">
          <Sparkles size={22} />
          <div>
            <strong>{dailyMessage.title}</strong>
            <span>{dailyMessage.text}</span>
          </div>
        </div>
      </section>

      <div className="admin-home-grid">
        <button
          type="button"
          className="admin-home-card admin-home-card-content"
          onClick={() => onNavigate('/admin/conteudo')}
        >
          <div className="admin-home-card-top">
            <div className="admin-home-card-icon admin-home-card-icon-content">
              <FilePenLine size={30} />
            </div>

            <span className="admin-home-card-tag">Website</span>
          </div>

          <div className="admin-home-card-body">
            <h3>Conteúdo do Website</h3>
            <p>
              Editar textos, imagem principal, modelos, vantagens, galeria, FAQ
              e contactos públicos.
            </p>

            <div className="admin-home-card-features">
              <span>
                <Image size={15} />
                Imagens
              </span>
              <span>
                <MessageSquareText size={15} />
                Textos
              </span>
            </div>
          </div>

          <div className="admin-home-card-footer">
            <strong>Abrir módulo</strong>
            <ArrowRight size={19} />
          </div>
        </button>

        <button
          type="button"
          className="admin-home-card admin-home-card-crm"
          onClick={() => onNavigate('/admin/crm')}
        >
          <div className="admin-home-card-top">
            <div className="admin-home-card-icon admin-home-card-icon-crm">
              <ClipboardList size={30} />
            </div>

            <span className="admin-home-card-tag">Comercial</span>
          </div>

          <div className="admin-home-card-body">
            <h3>CRM / Pedidos</h3>
            <p>
              Gerir contactos, oportunidades comerciais, estados de follow-up
              e notas internas.
            </p>

            <div className="admin-home-card-features">
              <span>
                <MessageSquareText size={15} />
                Leads
              </span>
              <span>
                <Handshake size={15} />
                Follow-up
              </span>
            </div>
          </div>

          <div className="admin-home-card-footer">
            <strong>Abrir módulo</strong>
            <ArrowRight size={19} />
          </div>
        </button>

        <button
          type="button"
          className="admin-home-card admin-home-card-observability"
          onClick={() => onNavigate('/admin/observabilidade')}
        >
          <div className="admin-home-card-top">
            <div className="admin-home-card-icon admin-home-card-icon-observability">
              <BarChart3 size={30} />
            </div>

            <span className="admin-home-card-tag">Análise</span>
          </div>

          <div className="admin-home-card-body">
            <h3>Observabilidade</h3>
            <p>
              Acompanhar visitas, páginas, cliques, pedidos enviados e atividade
              recente do website.
            </p>

            <div className="admin-home-card-features">
              <span>
                <MousePointerClick size={15} />
                Eventos
              </span>
              <span>
                <BarChart3 size={15} />
                Métricas
              </span>
            </div>
          </div>

          <div className="admin-home-card-footer">
            <strong>Abrir módulo</strong>
            <ArrowRight size={19} />
          </div>
        </button>

        <button
          type="button"
          className="admin-home-card admin-home-card-users"
          onClick={() => onNavigate('/admin/utilizadores')}
        >
          <div className="admin-home-card-top">
            <div className="admin-home-card-icon admin-home-card-icon-users">
              <Users size={30} />
            </div>

            <span className="admin-home-card-tag">Acessos</span>
          </div>

          <div className="admin-home-card-body">
            <h3>Utilizadores</h3>
            <p>
              Criar utilizadores, gerir perfis, permissões e acessos ao painel
              administrativo.
            </p>

            <div className="admin-home-card-features">
              <span>
                <ShieldCheck size={15} />
                Admin
              </span>
              <span>
                <Users size={15} />
                Editor
              </span>
            </div>
          </div>

          <div className="admin-home-card-footer">
            <strong>Abrir módulo</strong>
            <ArrowRight size={19} />
          </div>
        </button>
      </div>
    </div>
  );
}