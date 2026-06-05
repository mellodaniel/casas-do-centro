import {
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Leaf,
  Home,
  Hammer,
  Images,
  CheckCircle,
  Trees,
  Building2,
  BadgeEuro,
  Clock,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import { useState } from 'react';
import './index.css';
import logo from './assets/logo.png';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const whatsappNumber = '351912345678';
  const whatsappMessage = encodeURIComponent(
    'Olá, gostaria de pedir informações sobre casas de madeira.'
  );

  const closeMenu = () => setMenuOpen(false);

  const models = [
    {
      icon: <Home />,
      title: 'Habitação permanente',
      text: 'Casas de madeira pensadas para viver com conforto, funcionalidade e qualidade durante todo o ano.',
    },
    {
      icon: <Leaf />,
      title: 'Casas de férias',
      text: 'Soluções acolhedoras para descanso, lazer, fins de semana e contacto direto com a natureza.',
    },
    {
      icon: <Building2 />,
      title: 'Turismo rural',
      text: 'Projetos ideais para alojamento local, turismo rural, glamping e investimento em experiências diferenciadas.',
    },
    {
      icon: <Hammer />,
      title: 'Bungalows e anexos',
      text: 'Estruturas versáteis para apoio habitacional, escritórios, arrumos, estúdios ou zonas de lazer.',
    },
  ];

  const benefits = [
    {
      icon: <Trees />,
      title: 'Integração com a natureza',
      text: 'A madeira cria ambientes acolhedores e combina naturalmente com espaços verdes e terrenos rurais.',
    },
    {
      icon: <Clock />,
      title: 'Construção eficiente',
      text: 'Processos mais organizados e soluções pensadas para reduzir complexidade na execução do projeto.',
    },
    {
      icon: <Leaf />,
      title: 'Sustentabilidade',
      text: 'Uma solução com forte ligação ao ambiente, ideal para quem procura uma construção mais natural.',
    },
    {
      icon: <ShieldCheck />,
      title: 'Conforto e resistência',
      text: 'Projetos pensados para oferecer bem-estar, qualidade construtiva e utilização durante todo o ano.',
    },
    {
      icon: <BadgeEuro />,
      title: 'Solução ajustável',
      text: 'Cada projeto pode ser pensado de acordo com a finalidade, área, orçamento e necessidades do cliente.',
    },
    {
      icon: <CheckCircle />,
      title: 'Projeto personalizado',
      text: 'Do conceito à execução, a casa pode ser adaptada ao estilo de vida e objetivo de cada cliente.',
    },
  ];

  const idealFor = [
    'Habitação própria',
    'Casa de férias',
    'Turismo rural',
    'Alojamento local',
    'Bungalows',
    'Anexos e estúdios',
    'Escritórios de jardim',
    'Investimento imobiliário',
  ];

  const faqs = [
    {
      question: 'Uma casa de madeira precisa de licenciamento?',
      answer:
        'Na maioria dos casos, sim. Em Portugal, uma casa destinada a habitação ou utilização permanente normalmente deve cumprir regras urbanísticas e procedimentos junto da Câmara Municipal. Cada caso deve ser analisado de acordo com o terreno e finalidade do projeto.',
    },
    {
      question: 'É possível personalizar o projeto?',
      answer:
        'Sim. O objetivo é desenvolver soluções adaptadas à necessidade de cada cliente, considerando área, finalidade, estilo, orçamento e características do terreno.',
    },
    {
      question: 'As casas podem ser usadas para habitação permanente?',
      answer:
        'Sim. As casas de madeira podem ser pensadas para habitação permanente, casas de férias, turismo rural, alojamento local ou outros fins, desde que o projeto seja adequado à finalidade pretendida.',
    },
    {
      question: 'O orçamento é personalizado?',
      answer:
        'Sim. Nesta fase, o orçamento deve ser preparado de acordo com o tipo de casa, área aproximada, localização, acabamentos pretendidos e nível de personalização.',
    },
  ];

  return (
    <div className="site">
      <header className="header">
        <div className="container header-content">
          <a href="#inicio" className="logo-area" onClick={closeMenu}>
            <img src={logo} alt="Casas do Centro - Casas de Madeira" />
          </a>

          <button
            className="menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menu"
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          <nav className={`nav ${menuOpen ? 'open' : ''}`}>
            <a href="#inicio" onClick={closeMenu}>Início</a>
            <a href="#sobre" onClick={closeMenu}>Sobre Nós</a>
            <a href="#modelos" onClick={closeMenu}>Modelos</a>
            <a href="#vantagens" onClick={closeMenu}>Vantagens</a>
            <a href="#faq" onClick={closeMenu}>FAQ</a>
            <a href="#contacto" onClick={closeMenu}>Contacto</a>
            <a href="#contacto" className="nav-cta" onClick={closeMenu}>Pedir orçamento</a>
          </nav>
        </div>
      </header>

      <main>
        <section id="inicio" className="hero">
          <div className="container hero-content">
            <div className="hero-text">
              <span className="eyebrow">Casas de madeira em Portugal</span>

              <h1>A sua casa de madeira começa aqui.</h1>

              <h2>Natural, confortável e feita à medida em Portugal.</h2>

              <p>
                Na <strong>Casas do Centro - Casas de Madeira</strong>, criamos soluções
                em madeira para habitação, lazer, turismo rural e projetos personalizados,
                com foco em conforto, qualidade e integração com a natureza.
              </p>

              <div className="hero-actions">
                <a href="#contacto" className="btn primary">Pedir orçamento</a>
                <a href="#modelos" className="btn secondary">Ver modelos</a>
              </div>

              <div className="hero-highlights">
                <span><CheckCircle size={18} /> Projetos personalizados</span>
                <span><CheckCircle size={18} /> Portugal Continental</span>
                <span><CheckCircle size={18} /> Soluções em madeira</span>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-image-card">
                <div className="image-placeholder main-placeholder">
                  <Home size={70} />
                  <strong>Imagem principal</strong>
                  <small>Casa de madeira em ambiente natural</small>
                </div>

                <div className="floating-card">
                  <Leaf size={24} />
                  <div>
                    <strong>Conforto natural</strong>
                    <span>Projetos integrados com a natureza</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="sobre" className="section">
          <div className="container two-columns">
            <div>
              <span className="section-label">Sobre nós</span>
              <h2>Construímos casas de madeira com qualidade, proximidade e confiança.</h2>
            </div>

            <div className="text-block">
              <p>
                A <strong>Casas do Centro - Casas de Madeira</strong> nasce com o objetivo
                de oferecer soluções em madeira adaptadas às necessidades de cada cliente.
              </p>
              <p>
                Acompanhamos cada etapa do processo, desde a ideia inicial até à concretização
                do projeto, procurando unir estética, resistência, conforto e sustentabilidade.
              </p>
              <p>
                Este website está em fase piloto e será atualizado com informações oficiais,
                fotografias reais, contactos e detalhes comerciais da empresa.
              </p>
            </div>
          </div>
        </section>

        <section id="modelos" className="section soft-bg">
          <div className="container">
            <div className="section-heading">
              <span className="section-label">Modelos</span>
              <h2>Soluções em madeira para diferentes estilos de vida.</h2>
              <p>
                Cada projeto é pensado de acordo com o espaço, objetivo e estilo de vida
                de cada cliente.
              </p>
            </div>

            <div className="cards-grid">
              {models.map((model) => (
                <article className="card" key={model.title}>
                  {model.icon}
                  <h3>{model.title}</h3>
                  <p>{model.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="vantagens" className="section">
          <div className="container">
            <div className="section-heading">
              <span className="section-label">Vantagens</span>
              <h2>Porquê escolher uma casa de madeira?</h2>
              <p>
                Uma casa de madeira pode ser uma solução confortável, versátil e diferenciadora
                para vários tipos de projeto.
              </p>
            </div>

            <div className="benefits-grid">
              {benefits.map((benefit) => (
                <div className="benefit-card" key={benefit.title}>
                  <div className="benefit-icon">{benefit.icon}</div>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section ideal-section">
          <div className="container ideal-content">
            <div>
              <span className="section-label light">Ideal para</span>
              <h2>Projetos para viver, investir ou criar o seu refúgio.</h2>
              <p>
                As casas de madeira adaptam-se a diferentes necessidades, desde habitação
                permanente até turismo rural, lazer ou investimento.
              </p>
            </div>

            <div className="ideal-list">
              {idealFor.map((item) => (
                <span key={item}>
                  <CheckCircle size={18} />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="section process-section">
          <div className="container">
            <div className="section-heading">
              <span className="section-label light">Processo</span>
              <h2>Da ideia à construção da sua casa de madeira.</h2>
            </div>

            <div className="process-grid">
              {[
                ['1', 'Primeiro contacto', 'Falamos consigo para perceber a sua ideia, objetivo e localização.'],
                ['2', 'Análise', 'Avaliamos tipo de casa, área, finalidade e características pretendidas.'],
                ['3', 'Proposta', 'Preparamos uma solução ajustada ao projeto e às necessidades.'],
                ['4', 'Planeamento', 'Organizamos os próximos passos para transformar a ideia num projeto.'],
                ['5', 'Construção', 'Avançamos com a execução, acompanhamento e atenção ao detalhe.'],
              ].map(([number, title, text]) => (
                <div className="process-card" key={number}>
                  <span>{number}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="galeria" className="section soft-bg">
          <div className="container">
            <div className="section-heading">
              <span className="section-label">Galeria</span>
              <h2>Inspire-se para a sua futura casa de madeira.</h2>
              <p>
                Área preparada para receber fotografias reais de exteriores, interiores,
                obras e projetos concluídos.
              </p>
            </div>

            <div className="gallery-grid">
              <div className="gallery-item large">
                <Images size={34} />
                <strong>Exterior</strong>
              </div>
              <div className="gallery-item">
                <Images size={30} />
                <strong>Interior</strong>
              </div>
              <div className="gallery-item">
                <Images size={30} />
                <strong>Obra em andamento</strong>
              </div>
              <div className="gallery-item">
                <Images size={30} />
                <strong>Acabamentos</strong>
              </div>
              <div className="gallery-item wide">
                <Images size={30} />
                <strong>Projeto concluído</strong>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="section">
          <div className="container faq-layout">
            <div>
              <span className="section-label">Perguntas frequentes</span>
              <h2>Dúvidas comuns antes de começar.</h2>
              <p>
                Algumas respostas iniciais para ajudar o cliente a perceber melhor
                o processo antes de pedir orçamento.
              </p>
            </div>

            <div className="faq-list">
              {faqs.map((faq) => (
                <details key={faq.question} className="faq-item">
                  <summary>
                    <HelpCircle size={20} />
                    {faq.question}
                  </summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="contacto" className="section contact-section">
          <div className="container contact-grid">
            <div>
              <span className="section-label">Contacto</span>
              <h2>Pronto para começar o seu projeto?</h2>
              <p>
                Fale connosco e dê o primeiro passo para criar uma casa de madeira
                natural, confortável e feita à medida.
              </p>

              <div className="contact-info">
                <p><Phone size={18} /> +351 912 345 678</p>
                <p><Mail size={18} /> geral@casasdocentro.pt</p>
                <p><MapPin size={18} /> Leiria, Portugal</p>
              </div>

              <a
                className="whatsapp-link"
                href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={22} />
                Falar pelo WhatsApp
              </a>
            </div>

            <form className="contact-form">
              <div className="form-row">
                <input type="text" placeholder="Nome" />
                <input type="tel" placeholder="Telefone" />
              </div>

              <input type="email" placeholder="Email" />
              <input type="text" placeholder="Localidade do projeto" />

              <select defaultValue="">
                <option value="" disabled>Tipo de projeto</option>
                <option>Habitação permanente</option>
                <option>Casa de férias</option>
                <option>Turismo rural / alojamento local</option>
                <option>Bungalow ou anexo</option>
                <option>Projeto personalizado</option>
              </select>

              <select defaultValue="">
                <option value="" disabled>Já tem terreno?</option>
                <option>Sim, já tenho terreno</option>
                <option>Ainda estou à procura</option>
                <option>Quero apenas informações iniciais</option>
              </select>

              <input type="text" placeholder="Área aproximada pretendida" />

              <textarea placeholder="Mensagem" rows={5}></textarea>

              <button type="submit">Enviar pedido de orçamento</button>

              <small>
                Dados fictícios para versão piloto. Contactos e formulário serão ajustados
                quando forem enviados os dados oficiais.
              </small>
            </form>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-content">
          <img src={logo} alt="Casas do Centro - Casas de Madeira" />
          <p>Casas de madeira feitas à medida em Portugal.</p>
          <div className="footer-links">
            <a href="#inicio">Início</a>
            <a href="#modelos">Modelos</a>
            <a href="#vantagens">Vantagens</a>
            <a href="#faq">FAQ</a>
            <a href="#contacto">Contacto</a>
          </div>
          <small>© 2026 Casas do Centro - Casas de Madeira. Todos os direitos reservados.</small>
        </div>
      </footer>

      <a
        className="floating-whatsapp"
        href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Falar pelo WhatsApp"
      >
        <MessageCircle size={28} />
      </a>
    </div>
  );
}

export default App;