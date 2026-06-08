import type { ChangeEvent, FormEvent } from 'react';
import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ImagePlus,
  RotateCcw,
  Save,
  Type,
  Phone,
  Building,
} from 'lucide-react';
import { siteContent } from '../data/siteContent';
import {
  loadContentPatch,
  loadSiteContent,
  resetContentPatch,
  saveContentPatch,
} from '../lib/contentStorage';
import './admin.css';

type AdminDraft = {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    highlightsText: string;
    floatingCardTitle: string;
    floatingCardText: string;
  };
  about: {
    title: string;
    paragraphsText: string;
  };
  contact: {
    phone: string;
    email: string;
    location: string;
    whatsappNumber: string;
    whatsappMessage: string;
  };
  heroImageDataUrl: string;
};

function createInitialDraft(): AdminDraft {
  const content = loadSiteContent(siteContent);
  const patch = loadContentPatch();

  return {
    hero: {
      title: content.hero.title,
      subtitle: content.hero.subtitle,
      description: content.hero.description,
      highlightsText: content.hero.highlights.join('\n'),
      floatingCardTitle: content.hero.floatingCardTitle,
      floatingCardText: content.hero.floatingCardText,
    },
    about: {
      title: content.about.title,
      paragraphsText: content.about.paragraphs.join('\n\n'),
    },
    contact: {
      phone: content.contact.phone,
      email: content.contact.email,
      location: content.contact.location,
      whatsappNumber: content.contact.whatsappNumber,
      whatsappMessage: content.contact.whatsappMessage,
    },
    heroImageDataUrl: patch.heroImageDataUrl || '',
  };
}

function cleanLines(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function cleanParagraphs(value: string) {
  return value
    .split('\n\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function AdminPanel() {
  const [draft, setDraft] = useState<AdminDraft>(() => createInitialDraft());
  const [statusMessage, setStatusMessage] = useState('');

  const previewContent = useMemo(() => {
    return {
      title: draft.hero.title,
      subtitle: draft.hero.subtitle,
      description: draft.hero.description,
      highlights: cleanLines(draft.hero.highlightsText),
      aboutTitle: draft.about.title,
      aboutParagraphs: cleanParagraphs(draft.about.paragraphsText),
    };
  }, [draft]);

  function updateHeroField(field: keyof AdminDraft['hero'], value: string) {
    setDraft((current) => ({
      ...current,
      hero: {
        ...current.hero,
        [field]: value,
      },
    }));
  }

  function updateAboutField(field: keyof AdminDraft['about'], value: string) {
    setDraft((current) => ({
      ...current,
      about: {
        ...current.about,
        [field]: value,
      },
    }));
  }

  function updateContactField(field: keyof AdminDraft['contact'], value: string) {
    setDraft((current) => ({
      ...current,
      contact: {
        ...current.contact,
        [field]: value,
      },
    }));
  }

  function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setDraft((current) => ({
        ...current,
        heroImageDataUrl: String(reader.result),
      }));
      setStatusMessage('Imagem carregada para pré-visualização.');
    };

    reader.readAsDataURL(file);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    saveContentPatch({
      hero: {
        title: draft.hero.title,
        subtitle: draft.hero.subtitle,
        description: draft.hero.description,
        highlights: cleanLines(draft.hero.highlightsText),
        floatingCardTitle: draft.hero.floatingCardTitle,
        floatingCardText: draft.hero.floatingCardText,
      },
      about: {
        title: draft.about.title,
        paragraphs: cleanParagraphs(draft.about.paragraphsText),
      },
      contact: {
        phone: draft.contact.phone,
        email: draft.contact.email,
        location: draft.contact.location,
        whatsappNumber: draft.contact.whatsappNumber,
        whatsappMessage: draft.contact.whatsappMessage,
      },
      heroImageDataUrl: draft.heroImageDataUrl,
    });

    setStatusMessage('Alterações guardadas neste navegador. Atualiza a página pública para ver o resultado.');
  }

  function handleReset() {
    resetContentPatch();
    setDraft(createInitialDraft());
    setStatusMessage('Conteúdo reposto para a versão original do código.');
  }

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div>
          <span className="admin-kicker">Área administrativa</span>
          <h1>Casas do Centro</h1>
          <p>
            Painel piloto para editar textos principais e testar uploads de imagem.
          </p>
        </div>

        <nav className="admin-sidebar-nav">
          <a href="#hero">Homepage</a>
          <a href="#sobre">Sobre nós</a>
          <a href="#contactos">Contactos</a>
          <a href="#imagem">Imagem principal</a>
        </nav>

        <a className="admin-back-link" href="/">
          <ArrowLeft size={18} />
          Voltar ao site
        </a>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <span className="admin-kicker">Piloto sem base de dados</span>
            <h2>Editar conteúdo do website</h2>
          </div>

          <div className="admin-topbar-actions">
            <button type="button" className="admin-secondary-button" onClick={handleReset}>
              <RotateCcw size={18} />
              Repor
            </button>

            <a className="admin-primary-link" href="/">
              Ver site
            </a>
          </div>
        </div>

        {statusMessage && <div className="admin-alert">{statusMessage}</div>}

        <form className="admin-layout" onSubmit={handleSubmit}>
          <section className="admin-editor">
            <div id="hero" className="admin-card">
              <div className="admin-card-heading">
                <Type size={22} />
                <div>
                  <h3>Texto principal da homepage</h3>
                  <p>Conteúdo da primeira área do website.</p>
                </div>
              </div>

              <label>
                Título principal
                <input
                  value={draft.hero.title}
                  onChange={(event) => updateHeroField('title', event.target.value)}
                />
              </label>

              <label>
                Subtítulo
                <input
                  value={draft.hero.subtitle}
                  onChange={(event) => updateHeroField('subtitle', event.target.value)}
                />
              </label>

              <label>
                Texto descritivo
                <textarea
                  rows={7}
                  value={draft.hero.description}
                  onChange={(event) => updateHeroField('description', event.target.value)}
                />
              </label>

              <label>
                Destaques
                <small>Coloca um destaque por linha.</small>
                <textarea
                  rows={5}
                  value={draft.hero.highlightsText}
                  onChange={(event) => updateHeroField('highlightsText', event.target.value)}
                />
              </label>

              <div className="admin-two-fields">
                <label>
                  Título do card da imagem
                  <input
                    value={draft.hero.floatingCardTitle}
                    onChange={(event) => updateHeroField('floatingCardTitle', event.target.value)}
                  />
                </label>

                <label>
                  Texto do card da imagem
                  <input
                    value={draft.hero.floatingCardText}
                    onChange={(event) => updateHeroField('floatingCardText', event.target.value)}
                  />
                </label>
              </div>
            </div>

            <div id="sobre" className="admin-card">
              <div className="admin-card-heading">
                <Building size={22} />
                <div>
                  <h3>Sobre nós</h3>
                  <p>Texto institucional apresentado na secção Sobre Nós.</p>
                </div>
              </div>

              <label>
                Título da secção
                <input
                  value={draft.about.title}
                  onChange={(event) => updateAboutField('title', event.target.value)}
                />
              </label>

              <label>
                Parágrafos
                <small>Separa cada parágrafo com uma linha em branco.</small>
                <textarea
                  rows={9}
                  value={draft.about.paragraphsText}
                  onChange={(event) => updateAboutField('paragraphsText', event.target.value)}
                />
              </label>
            </div>

            <div id="contactos" className="admin-card">
              <div className="admin-card-heading">
                <Phone size={22} />
                <div>
                  <h3>Contactos</h3>
                  <p>Dados apresentados na área de contacto e no botão de WhatsApp.</p>
                </div>
              </div>

              <div className="admin-two-fields">
                <label>
                  Telefone visível
                  <input
                    value={draft.contact.phone}
                    onChange={(event) => updateContactField('phone', event.target.value)}
                  />
                </label>

                <label>
                  WhatsApp sem espaços
                  <input
                    value={draft.contact.whatsappNumber}
                    onChange={(event) => updateContactField('whatsappNumber', event.target.value)}
                  />
                </label>
              </div>

              <label>
                Email
                <input
                  value={draft.contact.email}
                  onChange={(event) => updateContactField('email', event.target.value)}
                />
              </label>

              <label>
                Localização
                <input
                  value={draft.contact.location}
                  onChange={(event) => updateContactField('location', event.target.value)}
                />
              </label>

              <label>
                Mensagem automática do WhatsApp
                <textarea
                  rows={4}
                  value={draft.contact.whatsappMessage}
                  onChange={(event) => updateContactField('whatsappMessage', event.target.value)}
                />
              </label>
            </div>

            <div id="imagem" className="admin-card">
              <div className="admin-card-heading">
                <ImagePlus size={22} />
                <div>
                  <h3>Imagem principal</h3>
                  <p>Upload de teste para substituir a imagem da homepage neste navegador.</p>
                </div>
              </div>

              <label className="admin-upload">
                <ImagePlus size={26} />
                <span>Escolher imagem</span>
                <small>Formato recomendado: JPG ou JPEG, horizontal.</small>
                <input type="file" accept="image/*" onChange={handleImageUpload} />
              </label>

              {draft.heroImageDataUrl && (
                <img
                  className="admin-upload-preview"
                  src={draft.heroImageDataUrl}
                  alt="Pré-visualização da imagem principal"
                />
              )}
            </div>

            <div className="admin-save-bar">
              <button type="submit" className="admin-save-button">
                <Save size={20} />
                Guardar alterações
              </button>
            </div>
          </section>

          <aside className="admin-preview">
            <div className="admin-preview-card">
              <span className="admin-kicker">Pré-visualização</span>
              <h2>{previewContent.title}</h2>
              <h3>{previewContent.subtitle}</h3>
              <p>{previewContent.description}</p>

              <div className="admin-preview-tags">
                {previewContent.highlights.map((highlight) => (
                  <span key={highlight}>{highlight}</span>
                ))}
              </div>
            </div>

            <div className="admin-preview-card small">
              <span className="admin-kicker">Sobre nós</span>
              <h3>{previewContent.aboutTitle}</h3>
              {previewContent.aboutParagraphs.slice(0, 2).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="admin-note">
              <strong>Nota importante:</strong>
              <p>
                Nesta fase, as alterações ficam guardadas apenas no navegador atual.
                Na próxima etapa, vamos ligar isto a uma base de dados para a cliente
                conseguir editar o site real.
              </p>
            </div>
          </aside>
        </form>
      </main>
    </div>
  );
}