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
  ArrowRight,
} from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import './index.css';
import heroImage from './assets/hero-casa-madeira.jpeg';
import { siteContent } from './data/siteContent';
import { AdminPanel } from './admin/AdminPanel';
import {
  buildSiteContent,
  getSiteContentPatch,
  type ContentPatch,
} from './lib/siteContentService';
import { createCrmLead } from './lib/crmService';
import { logAnalyticsEvent } from './lib/analyticsService';

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

type PublicPage = 'home' | 'galeria' | 'duvidas' | 'contacto';

const INSTAGRAM_URL = 'https://www.instagram.com/casasdocentro/';
const logo = '/logo-chales-do-centro.png';

const DEFAULT_HOMEPAGE_SETTINGS = {
  modelsCount: 4,
  benefitsCount: 4,
  processStepsCount: 3,
  gallerySectionsCount: 2,
  selectedModelIndexes: [0, 1, 2, 3],
  selectedBenefitIndexes: [0, 1, 2, 3],
  selectedProcessStepIndexes: [0, 1, 2],
  selectedGallerySectionIndexes: [0, 1],
  showQuestionsCard: true,
};

function normalizeHomepageCount(value: unknown, fallback: number, max: number) {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  return Math.min(Math.max(Math.round(parsedValue), 0), max);
}

function normalizeHomepageBoolean(value: unknown, fallback: boolean) {
  if (typeof value === 'boolean') {
    return value;
  }

  return fallback;
}

function buildSequentialIndexes(count: number, max: number) {
  return Array.from({ length: Math.min(Math.max(count, 0), max) }, (_, index) => index);
}

function normalizeHomepageIndexes(
  value: unknown,
  max: number,
  fallbackIndexes: number[]
) {
  if (!Array.isArray(value)) {
    return fallbackIndexes;
  }

  const uniqueIndexes = Array.from(
    new Set(
      value
        .map((item) => Number(item))
        .filter((item) => Number.isInteger(item) && item >= 0 && item < max)
    )
  );

  return uniqueIndexes.length > 0 ? uniqueIndexes : fallbackIndexes;
}

function pickItemsByIndexes<T>(items: T[], indexes: number[]) {
  return indexes
    .map((index) => items[index])
    .filter((item): item is T => Boolean(item));
}

const publicNavigation: Array<{ label: string; href: string }> = [
  { label: 'Início', href: '/' },
  { label: 'Modelos', href: '/#modelos' },
  { label: 'Vantagens', href: '/#vantagens' },
  { label: 'Galeria', href: '/galeria' },
  { label: 'Dúvidas', href: '/duvidas' },
  { label: 'Contacto', href: '/contacto' },
];

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

function getCurrentPublicPage(): PublicPage {
  const pathname = window.location.pathname;

  if (pathname.startsWith('/galeria')) {
    return 'galeria';
  }

  if (pathname.startsWith('/duvidas')) {
    return 'duvidas';
  }

  if (pathname.startsWith('/contacto')) {
    return 'contacto';
  }

  return 'home';
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
  const currentPage = getCurrentPublicPage();

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

  useEffect(() => {
    if (isAdminPage) {
      return;
    }

    void logAnalyticsEvent('page_view', {
      page: currentPage,
      path: window.location.pathname,
    });
  }, [currentPage, isAdminPage]);

  useEffect(() => {
    if (isAdminPage) {
      return;
    }

    function handleDocumentClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const anchorElement = target?.closest('a');

      if (!anchorElement) {
        return;
      }

      const href = anchorElement.getAttribute('href') || '';
      const label = anchorElement.textContent?.trim() || '';

      if (href.includes('wa.me')) {
        void logAnalyticsEvent('whatsapp_click', {
          page: currentPage,
          label,
        });
        return;
      }

      if (href.includes('instagram.com')) {
        void logAnalyticsEvent('instagram_click', {
          page: currentPage,
          label,
        });
        return;
      }

      if (
        anchorElement.classList.contains('btn') ||
        anchorElement.classList.contains('nav-cta') ||
        anchorElement.classList.contains('section-action-link') ||
        anchorElement.classList.contains('home-questions-highlight-card')
      ) {
        void logAnalyticsEvent('cta_click', {
          page: currentPage,
          label,
          href,
        });
      }
    }

    document.addEventListener('click', handleDocumentClick);

    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [currentPage, isAdminPage]);

  const galleryImagesBySection = useMemo(
    () => normalizeGalleryImagesBySection(contentPatch, content.gallery.items.length),
    [contentPatch, content.gallery.items.length]
  );

  const homepageSettings = useMemo(() => {
    const rawSettings = contentPatch.homepageSettings || {};

    const modelsCount = normalizeHomepageCount(
      rawSettings.modelsCount,
      DEFAULT_HOMEPAGE_SETTINGS.modelsCount,
      content.models.length
    );
    const benefitsCount = normalizeHomepageCount(
      rawSettings.benefitsCount,
      DEFAULT_HOMEPAGE_SETTINGS.benefitsCount,
      content.benefits.length
    );
    const processStepsCount = normalizeHomepageCount(
      rawSettings.processStepsCount,
      DEFAULT_HOMEPAGE_SETTINGS.processStepsCount,
      content.process.steps.length
    );
    const gallerySectionsCount = normalizeHomepageCount(
      rawSettings.gallerySectionsCount,
      DEFAULT_HOMEPAGE_SETTINGS.gallerySectionsCount,
      content.gallery.items.length
    );

    return {
      modelsCount,
      benefitsCount,
      processStepsCount,
      gallerySectionsCount,
      selectedModelIndexes: normalizeHomepageIndexes(
        rawSettings.selectedModelIndexes,
        content.models.length,
        buildSequentialIndexes(modelsCount, content.models.length)
      ),
      selectedBenefitIndexes: normalizeHomepageIndexes(
        rawSettings.selectedBenefitIndexes,
        content.benefits.length,
        buildSequentialIndexes(benefitsCount, content.benefits.length)
      ),
      selectedProcessStepIndexes: normalizeHomepageIndexes(
        rawSettings.selectedProcessStepIndexes,
        content.process.steps.length,
        buildSequentialIndexes(processStepsCount, content.process.steps.length)
      ),
      selectedGallerySectionIndexes: normalizeHomepageIndexes(
        rawSettings.selectedGallerySectionIndexes,
        content.gallery.items.length,
        buildSequentialIndexes(gallerySectionsCount, content.gallery.items.length)
      ),
      showQuestionsCard: normalizeHomepageBoolean(
        rawSettings.showQuestionsCard,
        DEFAULT_HOMEPAGE_SETTINGS.showQuestionsCard
      ),
    };
  }, [content, contentPatch.homepageSettings]);

  const selectedDistrict = centerPortugalLocations.find(
    (item) => item.district === contactForm.district
  );

  const phoneRule = countryPhoneRules[contactForm.countryCode];

  const whatsappMessage = encodeURIComponent(content.contact.whatsappMessage);

  const modelsPreview = pickItemsByIndexes(
    content.models,
    homepageSettings.selectedModelIndexes
  );
  const galleryPreviewIndexes = homepageSettings.selectedGallerySectionIndexes;
  const processPreviewSteps = pickItemsByIndexes(
    content.process.steps,
    homepageSettings.selectedProcessStepIndexes
  );
  const benefitsPreview = pickItemsByIndexes(
    content.benefits,
    homepageSettings.selectedBenefitIndexes
  );

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
      void logAnalyticsEvent('contact_form_error', {
        page: currentPage,
        reason: validationMessage,
      });
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

      void logAnalyticsEvent('contact_form_submit', {
        page: currentPage,
        projectType: contactForm.projectType || 'Não indicado',
        hasLand: contactForm.hasLand || 'Não indicado',
        district: contactForm.district || 'Não indicado',
        county: contactForm.county || 'Não indicado',
      });

      setContactForm(emptyContactForm);
      setContactStatusType('success');
      setContactStatusMessage(
        'Pedido enviado com sucesso. Os seus dados foram recebidos e entraremos em contacto brevemente.'
      );
    } catch {
      void logAnalyticsEvent('contact_form_error', {
        page: currentPage,
        reason: 'Erro ao enviar pedido para o CRM',
      });

      setContactStatusType('error');
      setContactStatusMessage(
        'Não foi possível enviar o pedido neste momento. Pode tentar novamente ou contactar por WhatsApp.'
      );
    } finally {
      setIsSubmittingContact(false);
    }
  }

  function renderGalleryBlock(isFullPage = false) {
    const indexesToRender = isFullPage
      ? content.gallery.items.map((_, index) => index)
      : galleryPreviewIndexes;

    return (
      <div className="gallery-sections-grid">
        {indexesToRender.map((originalIndex) => {
          const item = content.gallery.items[originalIndex];
          const images = galleryImagesBySection[originalIndex] || [];

          if (!item) {
            return null;
          }

          return (
            <article
              className="gallery-section-card"
              key={`${item}-${originalIndex}`}
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
                    <a
                      className="gallery-photo"
                      key={`${item}-${imageIndex}`}
                      style={{ backgroundImage: `url(${image})` }}
                      aria-label={`${item} ${imageIndex + 1}`}
                      href={image}
                      target="_blank"
                      rel="noreferrer"
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
    );
  }

  function renderContactBlock() {
    return (
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

          <div className="contact-action-list">
            <a
              className="whatsapp-link"
              href={`https://wa.me/${content.contact.whatsappNumber}?text=${whatsappMessage}`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={22} />
              Falar connosco
            </a>

            <a
              className="whatsapp-link instagram-contact-link"
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
            >
              <Instagram size={22} />
              Ver Instagram
            </a>
          </div>

          <div className="contact-next-step">
            <strong>O que acontece depois?</strong>
            <span>
              Após o envio do pedido, analisamos a informação recebida e entramos
              em contacto para perceber melhor o tipo de casa, localização,
              objetivo e próximos passos.
            </span>
          </div>
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
                phoneRule ? `Telefone. Ex: ${phoneRule.example}` : 'Telefone'
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
            {isSubmittingContact ? 'A enviar...' : 'Pedir informações gratuitas'}
          </button>

          <small>{content.contactSection.formNote}</small>
        </form>
      </div>
    );
  }

  function renderHomePage() {
    return (
      <>
        <section id="inicio" className="hero hero-compact">
          <div className="container hero-content">
            <div className="hero-text">
              <span className="eyebrow">{content.hero.eyebrow}</span>

              <h1>{content.hero.title}</h1>

              <h2>{content.hero.subtitle}</h2>

              <p>{content.hero.description}</p>

              <div className="hero-actions">
                <a href="/contacto" className="btn primary">
                  {content.hero.primaryButton}
                </a>
                <a href="#modelos" className="btn secondary">
                  {content.hero.secondaryButton}
                </a>
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

        <section className="home-trust-strip">
          <div className="container home-trust-grid">
            {content.hero.highlights.map((highlight) => (
              <span key={highlight}>
                <CheckCircle size={18} /> {highlight}
              </span>
            ))}
          </div>
        </section>

        <section id="modelos" className="section compact-section">
          <div className="container home-models-benefits-layout">
            <div>
              <span className="section-label">{content.modelsSection.label}</span>
              <h2>{content.modelsSection.title}</h2>
              <p className="home-section-intro">{content.modelsSection.description}</p>

              <div className="home-mini-about">
                <strong>{content.about.title}</strong>
                <span>{content.about.paragraphs[0]}</span>
              </div>

              <a href="/contacto" className="section-action-link inline-action">
                Pedir proposta personalizada <ArrowRight size={18} />
              </a>
            </div>

            <div className="home-models-grid">
              {modelsPreview.map((model) => {
                const Icon = model.icon;

                return (
                  <article className="home-model-card" key={model.title}>
                    <Icon size={24} />
                    <div>
                      <h3>{model.title}</h3>
                      <p>{model.text}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="vantagens" className="section soft-bg compact-section">
          <div className="container">
            <div className="section-heading section-heading-with-action">
              <div>
                <span className="section-label">{content.benefitsSection.label}</span>
                <h2>{content.benefitsSection.title}</h2>
                <p>{content.benefitsSection.description}</p>
              </div>

              {homepageSettings.showQuestionsCard && (
                <a href="/duvidas" className="home-questions-highlight-card">
                  <span className="home-questions-highlight-icon">
                    <HelpCircle size={26} />
                  </span>
                  <span>
                    <strong>Dúvidas sobre licenciamento, modelos ou orçamento?</strong>
                    <small>Veja as respostas principais antes de avançar.</small>
                  </span>
                  <ArrowRight size={20} />
                </a>
              )}
            </div>

            <div className="home-benefits-row">
              {benefitsPreview.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <div className="home-benefit-pill" key={benefit.title}>
                    <Icon size={22} />
                    <div>
                      <strong>{benefit.title}</strong>
                      <span>{benefit.text}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section process-section compact-section">
          <div className="container home-process-layout">
            <div>
              <span className="section-label light">{content.process.label}</span>
              <h2>{content.process.title}</h2>
            </div>

            <div className="process-grid process-grid-compact">
              {processPreviewSteps.map((step) => (
                <div className="process-card" key={step.number}>
                  <span>{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section compact-section">
          <div className="container">
            <div className="home-preview-card home-gallery-feature-card">
              <div className="section-heading section-heading-with-action">
                <div>
                  <span className="section-label">{content.gallery.label}</span>
                  <h2>Inspire-se para o seu futuro chalé.</h2>
                  <p>{content.gallery.description}</p>
                </div>

                <a href="/galeria" className="section-action-link">
                  Ver galeria completa <ArrowRight size={18} />
                </a>
              </div>

              {renderGalleryBlock(false)}
            </div>
          </div>
        </section>

        <section className="section home-final-cta">
          <div className="container home-final-cta-card">
            <div>
              <span className="section-label light">Próximo passo</span>
              <h2>Quer avaliar um chalé para o seu terreno ou projeto?</h2>
              <p>
                Envie o pedido e receba um contacto para analisar modelo, área,
                localização e possibilidades disponíveis.
              </p>
            </div>

            <a href="/contacto" className="btn primary">
              Pedir orçamento
            </a>
          </div>
        </section>
      </>
    );
  }

  function renderGalleryPage() {
    return (
      <>
        <section className="page-hero">
          <div className="container page-hero-content">
            <span className="section-label">{content.gallery.label}</span>
            <h1>{content.gallery.title}</h1>
            <p>{content.gallery.description}</p>
          </div>
        </section>

        <section className="section soft-bg">
          <div className="container">
            {renderGalleryBlock(true)}
          </div>
        </section>

        <section className="section home-final-cta">
          <div className="container home-final-cta-card">
            <div>
              <span className="section-label light">Gostou do que viu?</span>
              <h2>Peça uma proposta personalizada.</h2>
              <p>
                Partilhe connosco o tipo de casa, localização e objetivo do
                projeto para avaliarmos a solução mais adequada.
              </p>
            </div>

            <a href="/contacto" className="btn primary">
              Pedir orçamento
            </a>
          </div>
        </section>
      </>
    );
  }

  function renderFaqPage() {
    return (
      <>
        <section className="page-hero">
          <div className="container page-hero-content">
            <span className="section-label">{content.faq.label}</span>
            <h1>{content.faq.title}</h1>
            <p>{content.faq.description}</p>
          </div>
        </section>

        <section className="section">
          <div className="container faq-page-layout">
            <div className="faq-page-intro">
              <h2>Informação clara antes de avançar.</h2>
              <p>
                Reunimos aqui as perguntas mais comuns sobre casas de madeira,
                licenciamento, modelos, ajustes e pedido de orçamento.
              </p>

              <a href="/contacto" className="section-action-link inline-action">
                Falar connosco <ArrowRight size={18} />
              </a>
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
      </>
    );
  }

  function renderContactPage() {
    return (
      <>
        <section className="page-hero contact-page-hero">
          <div className="container page-hero-content">
            <span className="section-label">{content.contactSection.label}</span>
            <h1>{content.contactSection.title}</h1>
            <p>{content.contactSection.description}</p>
          </div>
        </section>

        <section id="contacto" className="section contact-section">
          {renderContactBlock()}
        </section>
      </>
    );
  }

  function renderPublicPage() {
    if (currentPage === 'galeria') {
      return renderGalleryPage();
    }

    if (currentPage === 'duvidas') {
      return renderFaqPage();
    }

    if (currentPage === 'contacto') {
      return renderContactPage();
    }

    return renderHomePage();
  }

  if (isAdminPage) {
    return <AdminPanel />;
  }

  return (
    <div className="site">
      <header className="header">
        <div className="container header-content">
          <a href="/" className="logo-area" onClick={closeMenu}>
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
            {publicNavigation.map((item) => (
              <a key={item.href} href={item.href} onClick={closeMenu}>
                {item.label}
              </a>
            ))}

            <a href="/contacto" className="nav-cta" onClick={closeMenu}>
              Pedir orçamento
            </a>
          </nav>
        </div>
      </header>

      <main>{renderPublicPage()}</main>

      <footer className="footer">
        <div className="container footer-content">
          <img src={logo} alt={content.company.name} />
          <p>{content.company.slogan}</p>

          <div className="footer-links">
            {publicNavigation.map((item) => (
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
        aria-label="Ver Instagram"
        title="Ver Instagram"
      >
        <Instagram size={28} />
      </a>

      <a
        className="floating-whatsapp"
        href={`https://wa.me/${content.contact.whatsappNumber}?text=${whatsappMessage}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Falar connosco"
        title="Falar connosco"
      >
        <MessageCircle size={28} />
      </a>
    </div>
  );
}

export default App;
