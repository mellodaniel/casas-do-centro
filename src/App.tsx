import { Menu, X, Phone, Mail, MapPin, MessageCircle, Leaf, Home, Hammer, Images, CheckCircle } from 'lucide-react';
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
            <a href="#galeria" onClick={closeMenu}>Galeria</a>
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
                Na <strong>Casas do Centro - Casas de Madeira</strong>, criamos soluções em madeira
                para habitação, lazer, turismo rural e projetos personalizados, com foco em conforto,
                qualidade e integração com a natureza.
              </p>

              <div className="hero-actions">
                <a href="#contacto" className="btn primary">Pedir orçamento</a>
                <a href="#modelos" className="btn secondary">Ver modelos</a>
              </div>
            </div>

            <div className="hero-card">
              <div className="hero-image-placeholder">
                <Home size={64} />
                <p>Imagem de casa de madeira</p>
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
            <div>
              <p>
                A <strong>Casas do Centro - Casas de Madeira</strong> nasce com o objetivo de oferecer
                soluções em madeira adaptadas às necessidades de cada cliente.
              </p>
              <p>
                Acompanhamos cada etapa do processo, desde a ideia inicial até à concretização do projeto,
                procurando sempre unir estética, resistência, conforto e sustentabilidade.
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
                Cada projeto é pensado de acordo com o espaço, o objetivo e o estilo de vida de cada cliente.
              </p>
            </div>

            <div className="cards-grid">
              <article className="card">
                <Home />
                <h3>Habitação permanente</h3>
                <p>Casas de madeira pensadas para viver com conforto durante todo o ano.</p>
              </article>

              <article className="card">
                <Leaf />
                <h3>Casas de férias</h3>
                <p>Soluções acolhedoras para descanso, lazer e contacto com a natureza.</p>
              </article>

              <article className="card">
                <Images />
                <h3>Turismo rural</h3>
                <p>Projetos ideais para alojamento local, turismo rural e investimento.</p>
              </article>

              <article className="card">
                <Hammer />
                <h3>Bungalows e anexos</h3>
                <p>Estruturas práticas, funcionais e adaptadas a diferentes necessidades.</p>
              </article>
            </div>
          </div>
        </section>

        <section id="vantagens" className="section">
          <div className="container">
            <div className="section-heading">
              <span className="section-label">Vantagens</span>
              <h2>Porquê escolher uma casa de madeira?</h2>
            </div>

            <div className="benefits-grid">
              {[
                'Conforto natural',
                'Construção eficiente',
                'Sustentabilidade',
                'Design personalizável',
                'Integração com a natureza',
                'Valorização do espaço',
              ].map((item) => (
                <div className="benefit" key={item}>
                  <CheckCircle size={22} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section process-section">
          <div className="container">
            <div className="section-heading">
              <span className="section-label">Processo</span>
              <h2>Da ideia à construção da sua casa de madeira.</h2>
            </div>

            <div className="process-grid">
              {[
                ['1', 'Primeiro contacto', 'Falamos consigo para perceber a sua ideia e objetivo.'],
                ['2', 'Análise', 'Avaliamos o tipo de casa, área, finalidade e localização.'],
                ['3', 'Proposta', 'Preparamos uma solução personalizada e objetiva.'],
                ['4', 'Planeamento', 'Organizamos os próximos passos do projeto.'],
                ['5', 'Construção', 'Avançamos com a execução com atenção ao detalhe.'],
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
                Veja exemplos de estilos, acabamentos, interiores e exteriores que podem servir de inspiração.
              </p>
            </div>

            <div className="gallery-grid">
              <div>Exterior</div>
              <div>Interior</div>
              <div>Projeto concluído</div>
              <div>Acabamentos</div>
            </div>
          </div>
        </section>

        <section id="contacto" className="section contact-section">
          <div className="container contact-grid">
            <div>
              <span className="section-label">Contacto</span>
              <h2>Pronto para começar o seu projeto?</h2>
              <p>
                Fale connosco e dê o primeiro passo para criar uma casa de madeira natural,
                confortável e feita à medida.
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
              <input type="text" placeholder="Nome" />
              <input type="tel" placeholder="Telefone" />
              <input type="email" placeholder="Email" />
              <input type="text" placeholder="Localidade" />
              <select>
                <option>Tipo de projeto</option>
                <option>Habitação permanente</option>
                <option>Casa de férias</option>
                <option>Turismo rural</option>
                <option>Bungalow ou anexo</option>
                <option>Projeto personalizado</option>
              </select>
              <textarea placeholder="Mensagem" rows={5}></textarea>
              <button type="submit">Enviar pedido</button>
            </form>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-content">
          <img src={logo} alt="Casas do Centro - Casas de Madeira" />
          <p>Casas de madeira feitas à medida em Portugal.</p>
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