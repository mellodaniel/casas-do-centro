import {
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Instagram,
  Leaf,
  Images,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import './index.css';
import logo from './assets/logo.png';
import heroImage from './assets/hero-casa-madeira.jpeg';
import { siteContent } from './data/siteContent';
import { AdminPanel } from './admin/AdminPanel';
import {
  buildSiteContent,
  getSiteContentPatch,
  type ContentPatch,
} from './lib/siteContentService';
import { createCrmLead } from './lib/crmService';

type ContactFormState = {
  firstName: string;
  lastName: string;
  countryCode: string;
  phone: string;
  email: string;
  district: string;
  county: string;
  projectType: string;
  hasLand: string;
  desiredArea: string;
  message: string;
};

type DistrictCountyOption = {
  district: string;
  counties: string[];
};

const INSTAGRAM_URL = 'https://www.instagram.com/casasdocentro/';

const emptyContactForm: ContactFormState = {
  firstName: '',
  lastName: '',
  countryCode: '+351',
  phone: '',
  email: '',
  district: '',
  county: '',
  projectType: '',
  hasLand: '',
  desiredArea: '',
  message: '',
};

const countryPhoneRules: Record<
  string,
  {
    label: string;
    minDigits: number;
    maxDigits: number;
    example: string;
  }
> = {
  '+351': {
    label: 'Portugal',
    minDigits: 9,
    maxDigits: 9,
    example: '912345678',
  },
  '+55': {
    label: 'Brasil',
    minDigits: 10,
    maxDigits: 11,
    example: '11999999999',
  },
  '+33': {
    label: 'França',
    minDigits: 9,
    maxDigits: 9,
    example: '612345678',
  },
  '+34': {
    label: 'Espanha',
    minDigits: 9,
    maxDigits: 9,
    example: '612345678',
  },
  '+352': {
    label: 'Luxemburgo',
    minDigits: 8,
    maxDigits: 9,
    example: '621123456',
  },
};

const centerPortugalLocations: DistrictCountyOption[] = [
  {
    district: 'Aveiro',
    counties: [
      'Águeda',
      'Albergaria-a-Velha',
      'Anadia',
      'Arouca',
      'Aveiro',
      'Castelo de Paiva',
      'Espinho',
      'Estarreja',
      'Ílhavo',
      'Mealhada',
      'Murtosa',
      'Oliveira de Azeméis',
      'Oliveira do Bairro',
      'Ovar',
      'Santa Maria da Feira',
      'São João da Madeira',
      'Sever do Vouga',
      'Vagos',
      'Vale de Cambra',
    ],
  },
  {
    district: 'Castelo Branco',
    counties: [
      'Belmonte',
      'Castelo Branco',
      'Covilhã',
      'Fundão',
      'Idanha-a-Nova',
      'Oleiros',
      'Penamacor',
      'Proença-a-Nova',
      'Sertã',
      'Vila de Rei',
      'Vila Velha de Ródão',
    ],
  },
  {
    district: 'Coimbra',
    counties: [
      'Arganil',
      'Cantanhede',
      'Coimbra',
      'Condeixa-a-Nova',
      'Figueira da Foz',
      'Góis',
      'Lousã',
      'Mira',
      'Miranda do Corvo',
      'Montemor-o-Velho',
      'Oliveira do Hospital',
      'Pampilhosa da Serra',
      'Penacova',
      'Penela',
      'Soure',
      'Tábua',
      'Vila Nova de Poiares',
    ],
  },
  {
    district: 'Guarda',
    counties: [
      'Aguiar da Beira',
      'Almeida',
      'Celorico da Beira',
      'Figueira de Castelo Rodrigo',
      'Fornos de Algodres',
      'Gouveia',
      'Guarda',
      'Manteigas',
      'Mêda',
      'Pinhel',
      'Sabugal',
      'Seia',
      'Trancoso',
      'Vila Nova de Foz Côa',
    ],
  },
  {
    district: 'Leiria',
    counties: [
      'Alcobaça',
      'Alvaiázere',
      'Ansião',
      'Batalha',
      'Bombarral',
      'Caldas da Rainha',
      'Castanheira de Pera',
      'Figueiró dos Vinhos',
      'Leiria',
      'Marinha Grande',
      'Nazaré',
      'Óbidos',
      'Pedrógão Grande',
      'Peniche',
      'Pombal',
      'Porto de Mós',
    ],
  },
  {
    district: 'Santarém',
    counties: [
      'Abrantes',
      'Alcanena',
      'Constância',
      'Entroncamento',
      'Ferreira do Zêzere',
      'Mação',
      'Ourém',
      'Sardoal',
      'Tomar',
      'Torres Novas',
      'Vila Nova da Barquinha',
    ],
  },
  {
    district: 'Viseu',
    counties: [
      'Aguiar da Beira',
      'Carregal do Sal',
      'Castro Daire',
      'Lamego',
      'Mangualde',
      'Mortágua',
      'Nelas',
      'Oliveira de Frades',
      'Penalva do Castelo',
      'Santa Comba Dão',
      'São Pedro do Sul',
      'Sátão',
      'Tondela',
      'Vila Nova de Paiva',
      'Viseu',
      'Vouzela',
    ],
  },
];

function normalizeGalleryImagesBySection(patch: ContentPatch, sectionCount: number) {
  if (Array.isArray(patch.galleryImagesUrlsBySection)) {
    return Array.from({ length: sectionCount }, (_, sectionIndex) => {
      const sectionImages = patch.galleryImagesUrlsBySection[sectionIndex];

      if (!Array.isArray(sectionImages)) {
        return [];
      }

      return sectionImages.filter(Boolean).slice(0, 5);
    });
  }

  if (Array.isArray(patch.galleryImagesDataUrlsBySection)) {
    return Array.from({ length: sectionCount }, (_, sectionIndex) => {
      const sectionImages = patch.galleryImagesDataUrlsBySection[sectionIndex];

      if (!Array.isArray(sectionImages)) {
        return [];
      }

      return sectionImages.filter(Boolean).slice(0, 5);
    });
  }

  return Array.from({ length: sectionCount }, () => []);
}

function hasOnlyDigits(value: string) {
  return /^[0-9]+$/.test(value);
}

function isValidEmail(email: string) {
  const normalizedEmail = email.trim();

  if (!normalizedEmail) {
    return true;
  }

  if (normalizedEmail.includes(' ')) {
    return false;
  }

  if (normalizedEmail.includes('..')) {
    return false;
  }

  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

  if (!emailRegex.test(normalizedEmail)) {
    return false;
  }

  const emailParts = normalizedEmail.split('@');

  if (emailParts.length !== 2) {
    return false;
  }

  const [localPart, domainPart] = emailParts;

  if (!localPart || !domainPart) {
    return false;
  }

  if (
    localPart.startsWith('.') ||
    localPart.endsWith('.') ||
    domainPart.startsWith('.') ||
    domainPart.endsWith('.')
  ) {
    return false;
  }

  const domainParts = domainPart.split('.');

  if (domainParts.length < 2) {
    return false;
  }

  return domainParts.every((part) => {
    return part.length > 0 && !part.startsWith('-') && !part.endsWith('-');
  });
}

function isValidPhone(countryCode: string, phone: string) {
  const normalizedPhone = phone.trim();
  const rule = countryPhoneRules[countryCode];

  if (!normalizedPhone) {
    return false;
  }

  if (!hasOnlyDigits(normalizedPhone)) {
    return false;
  }

  if (!rule) {
    return normalizedPhone.length >= 8 && normalizedPhone.length <= 15;
  }

  return (
    normalizedPhone.length >= rule.minDigits &&
    normalizedPhone.length <= rule.maxDigits
  );
}

function isValidDesiredArea(value: string) {
  if (!value.trim()) {
    return true;
  }

  const normalizedValue = value.trim().toLowerCase();

  return /^\d{1,4}\s?(m2|m²|metros quadrados)$/.test(normalizedValue);
}

function formatPhoneForStorage(countryCode: string, phone: string) {
  return `${countryCode} ${phone.trim()}`;
}

function formatLocationForStorage(district: string, county: string) {
  if (!district && !county) {
    return '';
  }

  if (district && county) {
    return `${district} / ${county}`;
  }

  return district || county;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [contentPatch, setContentPatch] = useState<ContentPatch>({});
  const [contactForm, setContactForm] =
    useState<ContactFormState>(emptyContactForm);
  const [contactStatusMessage, setContactStatusMessage] = useState('');
  const [contactStatusType, setContactStatusType] =
    useState<'success' | 'error' | ''>('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  const isAdminPage = window.location.pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdminPage) {
      return;
    }

    async function loadContent() {
      const patch = await getSiteContentPatch();
      setContentPatch(patch);
    }

    loadContent();
  }, [isAdminPage]);

  const content = useMemo(
    () => buildSiteContent(siteContent, contentPatch),
    [contentPatch]
  );

  const galleryImagesBySection = useMemo(
    () => normalizeGalleryImagesBySection(contentPatch, content.gallery.items.length),
    [contentPatch, content.gallery.items.length]
  );

  const selectedDistrict = centerPortugalLocations.find(
    (item) => item.district === contactForm.district
  );

  const phoneRule = countryPhoneRules[contactForm.countryCode];

  const whatsappMessage = encodeURIComponent(content.contact.whatsappMessage);

  const closeMenu = () => setMenuOpen(false);

  function updateContactFormField<K extends keyof ContactFormState>(
    field: K,
    value: ContactFormState[K]
  ) {
    setContactForm((current) => ({
      ...current,
      [field]: value,
      ...(field === 'district' ? { county: '' } : {}),
    }));
  }

  function validateContactForm() {
    if (!contactForm.firstName.trim()) {
      return 'Por favor, indique o nome.';
    }

    if (!contactForm.lastName.trim()) {
      return 'Por favor, indique o apelido.';
    }

    if (!contactForm.phone.trim()) {
      return 'Por favor, indique o telefone.';
    }

    if (!isValidPhone(contactForm.countryCode, contactForm.phone)) {
      const exampleText = phoneRule
        ? phoneRule.minDigits === phoneRule.maxDigits
          ? ` Para ${phoneRule.label}, o número deve ter exatamente ${phoneRule.minDigits} dígitos. Exemplo: ${phoneRule.example}.`
          : ` Para ${phoneRule.label}, o número deve ter entre ${phoneRule.minDigits} e ${phoneRule.maxDigits} dígitos. Exemplo: ${phoneRule.example}.`
        : ' Confirme se o número tem entre 8 e 15 dígitos.';

      return `O telefone deve conter apenas números, sem letras, espaços ou símbolos.${exampleText}`;
    }

    if (!isValidEmail(contactForm.email)) {
      return 'O email não é válido. Confirme se tem o formato correto, por exemplo: nome@email.com';
    }

    if (!contactForm.district.trim()) {
      return 'Por favor, selecione o distrito.';
    }

    if (!contactForm.county.trim()) {
      return 'Por favor, selecione o concelho.';
    }

    if (!isValidDesiredArea(contactForm.desiredArea)) {
      return 'A área aproximada deve seguir o formato: 80 m², 100 m² ou 120 m2.';
    }

    return '';
  }

  async function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setContactStatusMessage('');
    setContactStatusType('');

    const validationMessage = validateContactForm();

    if (validationMessage) {
      setContactStatusType('error');
      setContactStatusMessage(validationMessage);
      return;
    }

    setIsSubmittingContact(true);

    try {
      await createCrmLead({
        name: `${contactForm.firstName.trim()} ${contactForm.lastName.trim()}`,
        phone: formatPhoneForStorage(contactForm.countryCode, contactForm.phone),
        email: contactForm.email.trim(),
        location: formatLocationForStorage(contactForm.district, contactForm.county),
        project_type: contactForm.projectType,
        has_land: contactForm.hasLand,
        desired_area: contactForm.desiredArea,
        message: contactForm.message,
        origin: 'website',
      });

      setContactForm(emptyContactForm);
      setContactStatusType('success');
      setContactStatusMessage(
        'Pedido enviado com sucesso. Os seus dados foram recebidos e entraremos em contacto brevemente.'
      );
    } catch {
      setContactStatusType('error');
      setContactStatusMessage(
        'Não foi possível enviar o pedido neste momento. Pode tentar novamente ou contactar por WhatsApp.'
      );
    } finally {
      setIsSubmittingContact(false);
    }
  }

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
                  src={content.heroImageUrl || heroImage}
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

            <div className="gallery-sections-grid">
              {content.gallery.items.map((item, sectionIndex) => {
                const images = galleryImagesBySection[sectionIndex] || [];

                return (
                  <article
                    className="gallery-section-card"
                    key={`${item}-${sectionIndex}`}
                  >
                    <div className="gallery-section-heading">
                      <div>
                        <span>Galeria</span>
                        <h3>{item}</h3>
                      </div>

                      {images.length > 0 && (
                        <small>
                          {images.length} {images.length === 1 ? 'foto' : 'fotos'}
                        </small>
                      )}
                    </div>

                    {images.length > 0 ? (
                      <div className={`gallery-photo-grid photos-${images.length}`}>
                        {images.map((image, imageIndex) => (
                          <div
                            className="gallery-photo"
                            key={`${item}-${imageIndex}`}
                            style={{ backgroundImage: `url(${image})` }}
                            aria-label={`${item} ${imageIndex + 1}`}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="gallery-empty-state">
                        <Images size={32} />
                        <strong>{item}</strong>
                        <span>Imagens a adicionar brevemente</span>
                      </div>
                    )}
                  </article>
                );
              })}
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

              <a
                className="whatsapp-link"
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer"
              >
                <Instagram size={22} />
                Seguir no Instagram
              </a>
            </div>

            <form className="contact-form" onSubmit={handleContactSubmit}>
              {contactStatusMessage && (
                <div
                  className={
                    contactStatusType === 'success'
                      ? 'contact-form-message contact-form-message-success'
                      : 'contact-form-message contact-form-message-error'
                  }
                >
                  {contactStatusMessage}
                </div>
              )}

              <div className="form-row">
                <input
                  type="text"
                  placeholder="Nome"
                  value={contactForm.firstName}
                  onChange={(event) =>
                    updateContactFormField('firstName', event.target.value)
                  }
                  required
                />

                <input
                  type="text"
                  placeholder="Apelido"
                  value={contactForm.lastName}
                  onChange={(event) =>
                    updateContactFormField('lastName', event.target.value)
                  }
                  required
                />
              </div>

              <div className="form-row">
                <select
                  value={contactForm.countryCode}
                  onChange={(event) =>
                    updateContactFormField('countryCode', event.target.value)
                  }
                >
                  {Object.entries(countryPhoneRules).map(([code, rule]) => (
                    <option key={code} value={code}>
                      {code} — {rule.label}
                    </option>
                  ))}
                </select>

                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder={
                    phoneRule
                      ? `Telefone. Ex: ${phoneRule.example}`
                      : 'Telefone'
                  }
                  value={contactForm.phone}
                  onChange={(event) =>
                    updateContactFormField(
                      'phone',
                      event.target.value.replace(/\D/g, '')
                    )
                  }
                  required
                />
              </div>

              <input
                type="email"
                placeholder="Email. Ex: nome@email.com"
                value={contactForm.email}
                onChange={(event) =>
                  updateContactFormField('email', event.target.value)
                }
              />

              <div className="form-row">
                <select
                  value={contactForm.district}
                  onChange={(event) =>
                    updateContactFormField('district', event.target.value)
                  }
                  required
                >
                  <option value="" disabled>
                    Distrito
                  </option>
                  {centerPortugalLocations.map((item) => (
                    <option key={item.district} value={item.district}>
                      {item.district}
                    </option>
                  ))}
                </select>

                <select
                  value={contactForm.county}
                  onChange={(event) =>
                    updateContactFormField('county', event.target.value)
                  }
                  required
                  disabled={!contactForm.district}
                >
                  <option value="" disabled>
                    Concelho
                  </option>
                  {selectedDistrict?.counties.map((county) => (
                    <option key={county} value={county}>
                      {county}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={contactForm.projectType}
                onChange={(event) =>
                  updateContactFormField('projectType', event.target.value)
                }
              >
                <option value="" disabled>
                  Tipo de projeto
                </option>
                <option>Habitação permanente</option>
                <option>Casa de férias</option>
                <option>Turismo rural / alojamento local</option>
                <option>Bungalow ou anexo</option>
                <option>Projeto com ajustes</option>
              </select>

              <select
                value={contactForm.hasLand}
                onChange={(event) =>
                  updateContactFormField('hasLand', event.target.value)
                }
              >
                <option value="" disabled>
                  Já tem terreno?
                </option>
                <option>Sim, já tenho terreno</option>
                <option>Ainda estou à procura</option>
                <option>Quero apenas informações iniciais</option>
              </select>

              <input
                type="text"
                placeholder="Área aproximada pretendida. Ex: 80 m²"
                value={contactForm.desiredArea}
                onChange={(event) =>
                  updateContactFormField('desiredArea', event.target.value)
                }
              />

              <textarea
                placeholder="Mensagem"
                rows={5}
                value={contactForm.message}
                onChange={(event) =>
                  updateContactFormField('message', event.target.value)
                }
              />

              <button type="submit" disabled={isSubmittingContact}>
                {isSubmittingContact
                  ? 'A enviar...'
                  : 'Enviar pedido de orçamento'}
              </button>

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

            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
              Instagram
            </a>
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
        className="floating-instagram"
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="Seguir no Instagram"
        title="Seguir no Instagram"
      >
        <Instagram size={28} />
      </a>

      <a
        className="floating-whatsapp"
        href={`https://wa.me/${content.contact.whatsappNumber}?text=${whatsappMessage}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Falar pelo WhatsApp"
        title="Falar pelo WhatsApp"
      >
        <MessageCircle size={28} />
      </a>
    </div>
  );
}

export default App;
