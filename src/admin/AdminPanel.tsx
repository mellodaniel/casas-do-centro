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
  Images,
  LayoutList,
  BadgeCheck,
  HelpCircle,
} from 'lucide-react';
import { siteContent } from '../data/siteContent';
import {
  loadContentPatch,
  loadSiteContent,
  resetContentPatch,
  saveContentPatch,
} from '../lib/contentStorage';
import './admin.css';

const MAX_GALLERY_IMAGES_PER_SECTION = 5;

type EditablePair = {
  title: string;
  text: string;
};

type EditableFaq = {
  question: string;
  answer: string;
};

type IconContentItem = {
  icon: unknown;
  title: string;
  text: string;
};

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
  modelsSection: {
    title: string;
    description: string;
  };
  models: EditablePair[];
  benefitsSection: {
    title: string;
    description: string;
  };
  benefits: EditablePair[];
  faq: {
    title: string;
    description: string;
    items: EditableFaq[];
  };
  gallery: {
    itemsText: string;
    imagesDataUrlsBySection: string[][];
  };
  heroImageDataUrl: string;
};

function normalizeGalleryImagesBySection(patch: Record<string, any>, sectionCount: number) {
  if (Array.isArray(patch.galleryImagesDataUrlsBySection)) {
    return Array.from({ length: sectionCount }, (_, sectionIndex) => {
      const sectionImages = patch.galleryImagesDataUrlsBySection[sectionIndex];

      if (!Array.isArray(sectionImages)) {
        return [];
      }

      return sectionImages.slice(0, MAX_GALLERY_IMAGES_PER_SECTION);
    });
  }

  if (Array.isArray(patch.galleryImagesDataUrls)) {
    return Array.from({ length: sectionCount }, (_, sectionIndex) => {
      const legacyImage = patch.galleryImagesDataUrls[sectionIndex];

      if (!legacyImage) {
        return [];
      }

      return [legacyImage];
    });
  }

  return Array.from({ length: sectionCount }, () => []);
}

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
    modelsSection: {
      title: content.modelsSection.title,
      description: content.modelsSection.description,
    },
    models: content.models.map((model) => ({
      title: model.title,
      text: model.text,
    })),
    benefitsSection: {
      title: content.benefitsSection.title,
      description: content.benefitsSection.description,
    },
    benefits: content.benefits.map((benefit) => ({
      title: benefit.title,
      text: benefit.text,
    })),
    faq: {
      title: content.faq.title,
      description: content.faq.description,
      items: content.faq.items.map((item) => ({
        question: item.question,
        answer: item.answer,
      })),
    },
    gallery: {
      itemsText: content.gallery.items.join('\n'),
      imagesDataUrlsBySection: normalizeGalleryImagesBySection(
        patch,
        content.gallery.items.length
      ),
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

function mergeItemsWithIcons<T extends IconContentItem>(
  originalItems: T[],
  editedItems: EditablePair[]
): T[] {
  return originalItems.map((originalItem, index) => ({
    ...originalItem,
    title: editedItems[index]?.title || originalItem.title,
    text: editedItems[index]?.text || originalItem.text,
  }));
}

function ensureGallerySectionSlots(imagesBySection: string[][], sectionCount: number) {
  return Array.from({ length: sectionCount }, (_, sectionIndex) => {
    const sectionImages = imagesBySection[sectionIndex];

    if (!Array.isArray(sectionImages)) {
      return [];
    }

    return sectionImages.slice(0, MAX_GALLERY_IMAGES_PER_SECTION);
  });
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
      galleryItems: cleanLines(draft.gallery.itemsText),
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

  function updateModelsSectionField(
    field: keyof AdminDraft['modelsSection'],
    value: string
  ) {
    setDraft((current) => ({
      ...current,
      modelsSection: {
        ...current.modelsSection,
        [field]: value,
      },
    }));
  }

  function updateModelItem(index: number, field: keyof EditablePair, value: string) {
    setDraft((current) => {
      const updatedModels = [...current.models];

      updatedModels[index] = {
        ...updatedModels[index],
        [field]: value,
      };

      return {
        ...current,
        models: updatedModels,
      };
    });
  }

  function updateBenefitsSectionField(
    field: keyof AdminDraft['benefitsSection'],
    value: string
  ) {
    setDraft((current) => ({
      ...current,
      benefitsSection: {
        ...current.benefitsSection,
        [field]: value,
      },
    }));
  }

  function updateBenefitItem(index: number, field: keyof EditablePair, value: string) {
    setDraft((current) => {
      const updatedBenefits = [...current.benefits];

      updatedBenefits[index] = {
        ...updatedBenefits[index],
        [field]: value,
      };

      return {
        ...current,
        benefits: updatedBenefits,
      };
    });
  }

  function updateFaqField(field: 'title' | 'description', value: string) {
    setDraft((current) => ({
      ...current,
      faq: {
        ...current.faq,
        [field]: value,
      },
    }));
  }

  function updateFaqItem(index: number, field: keyof EditableFaq, value: string) {
    setDraft((current) => {
      const updatedFaqItems = [...current.faq.items];

      updatedFaqItems[index] = {
        ...updatedFaqItems[index],
        [field]: value,
      };

      return {
        ...current,
        faq: {
          ...current.faq,
          items: updatedFaqItems,
        },
      };
    });
  }

  function updateGalleryField(field: keyof AdminDraft['gallery'], value: string) {
    setDraft((current) => {
      const galleryItems = cleanLines(value);
      const updatedImages = ensureGallerySectionSlots(
        current.gallery.imagesDataUrlsBySection,
        galleryItems.length
      );

      return {
        ...current,
        gallery: {
          ...current.gallery,
          [field]: value,
          imagesDataUrlsBySection: updatedImages,
        },
      };
    });
  }

  function handleHeroImageUpload(event: ChangeEvent<HTMLInputElement>) {
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
      setStatusMessage('Imagem principal carregada para pré-visualização.');
    };

    reader.readAsDataURL(file);
  }

  function handleGalleryImageUpload(
    sectionIndex: number,
    imageIndex: number,
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setDraft((current) => {
        const sectionCount = cleanLines(current.gallery.itemsText).length;
        const updatedSections = ensureGallerySectionSlots(
          current.gallery.imagesDataUrlsBySection,
          sectionCount
        );

        const currentSection = [...(updatedSections[sectionIndex] || [])];
        currentSection[imageIndex] = String(reader.result);
        updatedSections[sectionIndex] = currentSection.slice(
          0,
          MAX_GALLERY_IMAGES_PER_SECTION
        );

        return {
          ...current,
          gallery: {
            ...current.gallery,
            imagesDataUrlsBySection: updatedSections,
          },
        };
      });

      setStatusMessage('Imagem da galeria carregada para pré-visualização.');
    };

    reader.readAsDataURL(file);
  }

  function removeGalleryImage(sectionIndex: number, imageIndex: number) {
    setDraft((current) => {
      const sectionCount = cleanLines(current.gallery.itemsText).length;
      const updatedSections = ensureGallerySectionSlots(
        current.gallery.imagesDataUrlsBySection,
        sectionCount
      );

      const currentSection = [...(updatedSections[sectionIndex] || [])];
      currentSection[imageIndex] = '';

      updatedSections[sectionIndex] = currentSection.filter(Boolean);

      return {
        ...current,
        gallery: {
          ...current.gallery,
          imagesDataUrlsBySection: updatedSections,
        },
      };
    });

    setStatusMessage('Imagem removida da galeria neste navegador.');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const galleryItems = cleanLines(draft.gallery.itemsText);
    const galleryImagesDataUrlsBySection = ensureGallerySectionSlots(
      draft.gallery.imagesDataUrlsBySection,
      galleryItems.length
    );

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
      modelsSection: {
        title: draft.modelsSection.title,
        description: draft.modelsSection.description,
      },
      models: mergeItemsWithIcons(siteContent.models, draft.models),
      benefitsSection: {
        title: draft.benefitsSection.title,
        description: draft.benefitsSection.description,
      },
      benefits: mergeItemsWithIcons(siteContent.benefits, draft.benefits),
      faq: {
        title: draft.faq.title,
        description: draft.faq.description,
        items: draft.faq.items,
      },
      gallery: {
        items: galleryItems,
      },
      galleryImagesDataUrlsBySection,
      galleryImagesDataUrls: [],
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
            Painel piloto para editar textos principais, imagens, modelos,
            vantagens, FAQ e contactos.
          </p>
        </div>

        <nav className="admin-sidebar-nav">
          <a href="#hero">Homepage</a>
          <a href="#imagem">Imagem principal</a>
          <a href="#sobre">Sobre nós</a>
          <a href="#modelos">Modelos</a>
          <a href="#vantagens">Vantagens</a>
          <a href="#galeria">Galeria</a>
          <a href="#faq-admin">FAQ</a>
          <a href="#contactos">Contactos</a>
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
                <input type="file" accept="image/*" onChange={handleHeroImageUpload} />
              </label>

              {draft.heroImageDataUrl && (
                <img
                  className="admin-upload-preview"
                  src={draft.heroImageDataUrl}
                  alt="Pré-visualização da imagem principal"
                />
              )}
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

            <div id="modelos" className="admin-card">
              <div className="admin-card-heading">
                <LayoutList size={22} />
                <div>
                  <h3>Modelos</h3>
                  <p>Editar o título, descrição e textos dos modelos apresentados no site.</p>
                </div>
              </div>

              <label>
                Título da secção
                <input
                  value={draft.modelsSection.title}
                  onChange={(event) => updateModelsSectionField('title', event.target.value)}
                />
              </label>

              <label>
                Descrição da secção
                <textarea
                  rows={4}
                  value={draft.modelsSection.description}
                  onChange={(event) => updateModelsSectionField('description', event.target.value)}
                />
              </label>

              <div className="admin-repeat-list">
                {draft.models.map((model, index) => (
                  <div className="admin-repeat-item" key={`model-${index}`}>
                    <strong>Modelo {index + 1}</strong>

                    <label>
                      Título
                      <input
                        value={model.title}
                        onChange={(event) => updateModelItem(index, 'title', event.target.value)}
                      />
                    </label>

                    <label>
                      Texto
                      <textarea
                        rows={4}
                        value={model.text}
                        onChange={(event) => updateModelItem(index, 'text', event.target.value)}
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div id="vantagens" className="admin-card">
              <div className="admin-card-heading">
                <BadgeCheck size={22} />
                <div>
                  <h3>Vantagens</h3>
                  <p>Editar o título, descrição e textos das vantagens do website.</p>
                </div>
              </div>

              <label>
                Título da secção
                <input
                  value={draft.benefitsSection.title}
                  onChange={(event) => updateBenefitsSectionField('title', event.target.value)}
                />
              </label>

              <label>
                Descrição da secção
                <textarea
                  rows={4}
                  value={draft.benefitsSection.description}
                  onChange={(event) => updateBenefitsSectionField('description', event.target.value)}
                />
              </label>

              <div className="admin-repeat-list">
                {draft.benefits.map((benefit, index) => (
                  <div className="admin-repeat-item" key={`benefit-${index}`}>
                    <strong>Vantagem {index + 1}</strong>

                    <label>
                      Título
                      <input
                        value={benefit.title}
                        onChange={(event) => updateBenefitItem(index, 'title', event.target.value)}
                      />
                    </label>

                    <label>
                      Texto
                      <textarea
                        rows={4}
                        value={benefit.text}
                        onChange={(event) => updateBenefitItem(index, 'text', event.target.value)}
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div id="galeria" className="admin-card">
              <div className="admin-card-heading">
                <Images size={22} />
                <div>
                  <h3>Galeria</h3>
                  <p>
                    Edita as sessões da galeria e adiciona até 5 fotos por sessão.
                  </p>
                </div>
              </div>

              <label>
                Nomes das sessões da galeria
                <small>Coloca uma sessão por linha. Exemplo: Exterior, Interior, Acabamentos.</small>
                <textarea
                  rows={6}
                  value={draft.gallery.itemsText}
                  onChange={(event) => updateGalleryField('itemsText', event.target.value)}
                />
              </label>

              <div className="admin-gallery-sections">
                {previewContent.galleryItems.map((item, sectionIndex) => {
                  const sectionImages =
                    draft.gallery.imagesDataUrlsBySection[sectionIndex] || [];

                  return (
                    <div className="admin-gallery-section" key={`${item}-${sectionIndex}`}>
                      <div className="admin-gallery-section-header">
                        <div>
                          <strong>{item}</strong>
                          <small>
                            {sectionImages.filter(Boolean).length} de {MAX_GALLERY_IMAGES_PER_SECTION} fotos
                          </small>
                        </div>
                      </div>

                      <div className="admin-gallery-slots">
                        {Array.from({ length: MAX_GALLERY_IMAGES_PER_SECTION }).map(
                          (_, imageIndex) => {
                            const image = sectionImages[imageIndex];

                            return (
                              <div
                                className="admin-gallery-slot"
                                key={`${item}-${sectionIndex}-${imageIndex}`}
                              >
                                {image ? (
                                  <img
                                    src={image}
                                    alt={`${item} ${imageIndex + 1}`}
                                  />
                                ) : (
                                  <div className="admin-gallery-placeholder">
                                    <Images size={22} />
                                    <span>Foto {imageIndex + 1}</span>
                                  </div>
                                )}

                                <label className="admin-gallery-upload">
                                  <ImagePlus size={16} />
                                  Escolher
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) =>
                                      handleGalleryImageUpload(sectionIndex, imageIndex, event)
                                    }
                                  />
                                </label>

                                {image && (
                                  <button
                                    type="button"
                                    className="admin-remove-image"
                                    onClick={() =>
                                      removeGalleryImage(sectionIndex, imageIndex)
                                    }
                                  >
                                    Remover
                                  </button>
                                )}
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div id="faq-admin" className="admin-card">
              <div className="admin-card-heading">
                <HelpCircle size={22} />
                <div>
                  <h3>FAQ</h3>
                  <p>Editar perguntas e respostas apresentadas na área de dúvidas frequentes.</p>
                </div>
              </div>

              <label>
                Título da secção
                <input
                  value={draft.faq.title}
                  onChange={(event) => updateFaqField('title', event.target.value)}
                />
              </label>

              <label>
                Descrição da secção
                <textarea
                  rows={4}
                  value={draft.faq.description}
                  onChange={(event) => updateFaqField('description', event.target.value)}
                />
              </label>

              <div className="admin-repeat-list">
                {draft.faq.items.map((faq, index) => (
                  <div className="admin-repeat-item" key={`faq-${index}`}>
                    <strong>Pergunta {index + 1}</strong>

                    <label>
                      Pergunta
                      <input
                        value={faq.question}
                        onChange={(event) => updateFaqItem(index, 'question', event.target.value)}
                      />
                    </label>

                    <label>
                      Resposta
                      <textarea
                        rows={5}
                        value={faq.answer}
                        onChange={(event) => updateFaqItem(index, 'answer', event.target.value)}
                      />
                    </label>
                  </div>
                ))}
              </div>
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

            <div className="admin-preview-card small">
              <span className="admin-kicker">Modelos</span>
              <h3>{draft.modelsSection.title}</h3>
              <div className="admin-preview-tags">
                {draft.models.map((model) => (
                  <span key={model.title}>{model.title}</span>
                ))}
              </div>
            </div>

            <div className="admin-preview-card small">
              <span className="admin-kicker">Vantagens</span>
              <h3>{draft.benefitsSection.title}</h3>
              <div className="admin-preview-tags">
                {draft.benefits.map((benefit) => (
                  <span key={benefit.title}>{benefit.title}</span>
                ))}
              </div>
            </div>

            <div className="admin-preview-card small">
              <span className="admin-kicker">Galeria</span>
              <h3>Sessões configuradas</h3>
              <div className="admin-preview-tags">
                {previewContent.galleryItems.map((item, index) => {
                  const imageCount =
                    draft.gallery.imagesDataUrlsBySection[index]?.filter(Boolean).length || 0;

                  return (
                    <span key={item}>
                      {item}: {imageCount} fotos
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="admin-preview-card small">
              <span className="admin-kicker">FAQ</span>
              <h3>{draft.faq.title}</h3>
              <div className="admin-preview-tags">
                {draft.faq.items.map((faq) => (
                  <span key={faq.question}>{faq.question}</span>
                ))}
              </div>
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