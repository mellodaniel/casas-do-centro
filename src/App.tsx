import {
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Leaf,
  Images,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import './index.css';
import logo from './assets/logo.png';
import heroImage from './assets/hero-casa-madeira.jpeg';
import { siteContent } from './data/siteContent';
import { loadSiteContent } from './lib/contentStorage';
import { AdminPanel } from './admin/AdminPanel';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdminPage = window.location.pathname === '/admin';

  const content = useMemo(() => loadSiteContent(siteContent), []);

  const whatsappMessage = encodeURIComponent(content.contact.whatsappMessage);

  const closeMenu = () => setMenuOpen(false);

  if (isAdminPage) {
    return <AdminPanel />;
  }

  return (
    <div className="site">
      <header className="header">
        <div className="container header-content">
          <a href="#inicio" className="logo-area" onClick={closeMenu}>
            <img src={logo} alt={content.company.name} />
          </a>

          <button
            className="menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menu"
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          <nav className={`nav ${menuOpen ? 'open' : ''}`}>
            {content.navigation.map((item) => (
              <a key={item.href} href={item.href} onClick={closeMenu}>
                {item.label}
              </a>
            ))}
            <a href="#contacto" className="nav-cta" onClick={closeMenu}>
              Pedir orçamento
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section id="inicio" className="hero">
          <div className="container hero-content">
            <div className="hero-text">
              <span className="eyebrow">{content.hero.eyebrow}</span>

              <h1>{content.hero.title}</h1>

              <h2>{content.hero.subtitle}</h2>

              <p>{content.hero.description}</p>

              <div className="hero-actions">
                <a href="#contacto" className="btn primary">
                  {content.hero.primaryButton}
                </a>
                <a href="#modelos" className="btn secondary">
                  {content.hero.secondaryButton}
                </a>
              </div>

              <div className="hero-highlights">
                {content.hero.highlights.map((highlight) => (
                  <span key={highlight}>
                    <CheckCircle size={18} /> {highlight}
                  </span>
                ))}
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-image-card real-image-card">
                <img
                  src={content.heroImageDataUrl || heroImage}
                  alt={content.hero.imageAlt}
                  className="hero-main-image"
                />

                <div className="floating-card">
                  <Leaf size={24} />
                  <div>
                    <strong>{content.hero.floatingCardTitle}</strong>
                    <span>{content.hero.floatingCardText}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="sobre" className="section">
          <div className="container two-columns">
            <div>
              <span className="section-label">{content.about.label}</span>
              <h2>{content.about.title}</h2>
            </div>

            <div className="text-block">
              {content.about.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>

        <section id="modelos" className="section soft-bg">
          <div className="container">
            <div className="section-heading">
              <span className="section-label">{content.modelsSection.label}</span>
              <h2>{content.modelsSection.title}</h2>
              <p>{content.modelsSection.description}</p>
            </div>

            <div className="cards-grid">
              {content.models.map((model) => {
                const Icon = model.icon;

                return (
                  <article className="card" key={model.title}>
                    <Icon />
                    <h3>{model.title}</h3>
                    <p>{model.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="vantagens" className="section">
          <div className="container">
            <div className="section-heading">
              <span className="section-label">{content.benefitsSection.label}</span>
              <h2>{content.benefitsSection.title}</h2>
              <p>{content.benefitsSection.description}</p>
            </div>

            <div className="benefits-grid">
              {content.benefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <div className="benefit-card" key={benefit.title}>
                    <div className="benefit-icon">
                      <Icon />
                    </div>
                    <h3>{benefit.title}</h3>
                    <p>{benefit.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section ideal-section">
          <div className="container ideal-content">
            <div>
              <span className="section-label light">{content.ideal.label}</span>
              <h2>{content.ideal.title}</h2>
              <p>{content.ideal.description}</p>
            </div>

            <div className="ideal-list">
              {content.ideal.items.map((item) => (
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
              <span className="section-label light">{content.process.label}</span>
              <h2>{content.process.title}</h2>
            </div>

            <div className="process-grid">
              {content.process.steps.map((step) => (
                <div className="process-card" key={step.number}>
                  <span>{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="galeria" className="section soft-bg">
          <div className="container">
            <div className="section-heading">
              <span className="section-label">{content.gallery.label}</span>
              <h2>{content.gallery.title}</h2>
              <p>{content.gallery.description}</p>
            </div>

            <div className="gallery-grid">
              {content.gallery.items.map((item, index) => (
                <div
                  className={`gallery-item ${index === 0 ? 'large' : ''} ${
                    index === content.gallery.items.length - 1 ? 'wide' : ''
                  }`}
                  key={item}
                >
                  <Images size={index === 0 ? 34 : 30} />
                  <strong>{item}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="section">
          <div className="container faq-layout">
            <div>
              <span className="section-label">{content.faq.label}</span>
              <h2>{content.faq.title}</h2>
              <p>{content.faq.description}</p>
            </div>

            <div className="faq-list">
              {content.faq.items.map((faq) => (
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
              <span className="section-label">{content.contactSection.label}</span>
              <h2>{content.contactSection.title}</h2>
              <p>{content.contactSection.description}</p>

              <div className="contact-info">
                <p>
                  <Phone size={18} /> {content.contact.phone}
                </p>
                <p>
                  <Mail size={18} /> {content.contact.email}
                </p>
                <p>
                  <MapPin size={18} /> {content.contact.location}
                </p>
              </div>

              <a
                className="whatsapp-link"
                href={`https://wa.me/${content.contact.whatsappNumber}?text=${whatsappMessage}`}
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
                <option value="" disabled>
                  Tipo de projeto
                </option>
                <option>Habitação permanente</option>
                <option>Casa de férias</option>
                <option>Turismo rural / alojamento local</option>
                <option>Bungalow ou anexo</option>
                <option>Projeto com ajustes</option>
              </select>

              <select defaultValue="">
                <option value="" disabled>
                  Já tem terreno?
                </option>
                <option>Sim, já tenho terreno</option>
                <option>Ainda estou à procura</option>
                <option>Quero apenas informações iniciais</option>
              </select>

              <input type="text" placeholder="Área aproximada pretendida" />

              <textarea placeholder="Mensagem" rows={5}></textarea>

              <button type="submit">Enviar pedido de orçamento</button>

              <small>{content.contactSection.formNote}</small>
            </form>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-content">
          <img src={logo} alt={content.company.name} />
          <p>{content.company.slogan}</p>
          <div className="footer-links">
            {content.navigation.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </div>
          <small>{content.footer.copyright}</small>
        </div>
      </footer>

      <a
        className="admin-access-link"
        href="/admin"
        aria-label="Abrir área administrativa"
      >
        Admin
      </a>

      <a
        className="floating-whatsapp"
        href={`https://wa.me/${content.contact.whatsappNumber}?text=${whatsappMessage}`}
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