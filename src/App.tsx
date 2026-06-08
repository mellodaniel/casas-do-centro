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
import { useState } from 'react';
import './index.css';
import logo from './assets/logo.png';
import heroImage from './assets/hero-casa-madeira.jpeg';
import { siteContent } from './data/siteContent';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const whatsappMessage = encodeURIComponent(siteContent.contact.whatsappMessage);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="site">
      <header className="header">
        <div className="container header-content">
          <a href="#inicio" className="logo-area" onClick={closeMenu}>
            <img src={logo} alt={siteContent.company.name} />
          </a>

          <button
            className="menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menu"
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          <nav className={`nav ${menuOpen ? 'open' : ''}`}>
            {siteContent.navigation.map((item) => (
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
              <span className="eyebrow">{siteContent.hero.eyebrow}</span>

              <h1>{siteContent.hero.title}</h1>

              <h2>{siteContent.hero.subtitle}</h2>

              <p>{siteContent.hero.description}</p>

              <div className="hero-actions">
                <a href="#contacto" className="btn primary">
                  {siteContent.hero.primaryButton}
                </a>
                <a href="#modelos" className="btn secondary">
                  {siteContent.hero.secondaryButton}
                </a>
              </div>

              <div className="hero-highlights">
                {siteContent.hero.highlights.map((highlight) => (
                  <span key={highlight}>
                    <CheckCircle size={18} /> {highlight}
                  </span>
                ))}
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-image-card real-image-card">
                <img
                  src={heroImage}
                  alt={siteContent.hero.imageAlt}
                  className="hero-main-image"
                />

                <div className="floating-card">
                  <Leaf size={24} />
                  <div>
                    <strong>{siteContent.hero.floatingCardTitle}</strong>
                    <span>{siteContent.hero.floatingCardText}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="sobre" className="section">
          <div className="container two-columns">
            <div>
              <span className="section-label">{siteContent.about.label}</span>
              <h2>{siteContent.about.title}</h2>
            </div>

            <div className="text-block">
              {siteContent.about.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>

        <section id="modelos" className="section soft-bg">
          <div className="container">
            <div className="section-heading">
              <span className="section-label">{siteContent.modelsSection.label}</span>
              <h2>{siteContent.modelsSection.title}</h2>
              <p>{siteContent.modelsSection.description}</p>
            </div>

            <div className="cards-grid">
              {siteContent.models.map((model) => {
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
              <span className="section-label">{siteContent.benefitsSection.label}</span>
              <h2>{siteContent.benefitsSection.title}</h2>
              <p>{siteContent.benefitsSection.description}</p>
            </div>

            <div className="benefits-grid">
              {siteContent.benefits.map((benefit) => {
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
              <span className="section-label light">{siteContent.ideal.label}</span>
              <h2>{siteContent.ideal.title}</h2>
              <p>{siteContent.ideal.description}</p>
            </div>

            <div className="ideal-list">
              {siteContent.ideal.items.map((item) => (
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
              <span className="section-label light">{siteContent.process.label}</span>
              <h2>{siteContent.process.title}</h2>
            </div>

            <div className="process-grid">
              {siteContent.process.steps.map((step) => (
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
              <span className="section-label">{siteContent.gallery.label}</span>
              <h2>{siteContent.gallery.title}</h2>
              <p>{siteContent.gallery.description}</p>
            </div>

            <div className="gallery-grid">
              {siteContent.gallery.items.map((item, index) => (
                <div
                  className={`gallery-item ${index === 0 ? 'large' : ''} ${
                    index === siteContent.gallery.items.length - 1 ? 'wide' : ''
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
              <span className="section-label">{siteContent.faq.label}</span>
              <h2>{siteContent.faq.title}</h2>
              <p>{siteContent.faq.description}</p>
            </div>

            <div className="faq-list">
              {siteContent.faq.items.map((faq) => (
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
              <span className="section-label">{siteContent.contactSection.label}</span>
              <h2>{siteContent.contactSection.title}</h2>
              <p>{siteContent.contactSection.description}</p>

              <div className="contact-info">
                <p>
                  <Phone size={18} /> {siteContent.contact.phone}
                </p>
                <p>
                  <Mail size={18} /> {siteContent.contact.email}
                </p>
                <p>
                  <MapPin size={18} /> {siteContent.contact.location}
                </p>
              </div>

              <a
                className="whatsapp-link"
                href={`https://wa.me/${siteContent.contact.whatsappNumber}?text=${whatsappMessage}`}
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

              <small>{siteContent.contactSection.formNote}</small>
            </form>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-content">
          <img src={logo} alt={siteContent.company.name} />
          <p>{siteContent.company.slogan}</p>
          <div className="footer-links">
            {siteContent.navigation.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </div>
          <small>{siteContent.footer.copyright}</small>
        </div>
      </footer>

      <a
        className="floating-whatsapp"
        href={`https://wa.me/${siteContent.contact.whatsappNumber}?text=${whatsappMessage}`}
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