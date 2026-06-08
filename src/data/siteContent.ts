import {
    Award,
    Building2,
    CheckCircle,
    Clock,
    Hammer,
    Home,
    Leaf,
    ShieldCheck,
    Trees,
  } from 'lucide-react';
  
  export const siteContent = {
    company: {
      name: 'Casas do Centro - Casas de Madeira',
      shortName: 'Casas do Centro',
      slogan: 'Casas de madeira certificadas, ecológicas e adaptáveis ao seu projeto.',
    },
  
    contact: {
      phone: '+351 912 345 678',
      email: 'geral@casasdocentro.pt',
      location: 'Leiria, Portugal',
      whatsappNumber: '351912345678',
      whatsappMessage: 'Olá, gostaria de pedir informações sobre casas de madeira.',
    },
  
    navigation: [
      { label: 'Início', href: '#inicio' },
      { label: 'Sobre Nós', href: '#sobre' },
      { label: 'Modelos', href: '#modelos' },
      { label: 'Vantagens', href: '#vantagens' },
      { label: 'FAQ', href: '#faq' },
      { label: 'Contacto', href: '#contacto' },
    ],
  
    hero: {
      eyebrow: 'Casas de madeira em Portugal',
      title: 'A sua casa de madeira começa aqui.',
      subtitle: 'Natural, confortável e adaptada ao seu projeto em Portugal.',
      description:
        'Na Casas do Centro - Casas de Madeira, apresentamos casas de madeira certificadas e ecológicas, pensadas para quem procura sustentabilidade, conforto, design inovador e materiais de alta qualidade. As casas partem de modelos definidos pela fábrica, com possibilidade de ajustes de tipologia e áreas conforme disponibilidade.',
      primaryButton: 'Pedir orçamento',
      secondaryButton: 'Ver modelos',
      highlights: [
        'Casas certificadas',
        'Ecológicas e sustentáveis',
        'Portugal Continental - Zona Centro',
        'Ajustes conforme disponibilidade',
      ],
      imageAlt: 'Casa de madeira em ambiente natural',
      floatingCardTitle: 'Conforto natural',
      floatingCardText: 'Design, sustentabilidade e qualidade',
    },
  
    about: {
      label: 'Sobre nós',
      title: 'Casas de madeira com qualidade, sustentabilidade e confiança.',
      paragraphs: [
        'A Casas do Centro - Casas de Madeira nasce com o objetivo de apresentar soluções em madeira para diferentes necessidades, desde habitação até lazer, turismo rural e investimento.',
        'As nossas casas de madeira são pensadas para quem valoriza conforto, sustentabilidade, design inovador e materiais de alta qualidade, respeitando sempre os modelos e opções disponíveis em fábrica.',
        'Trabalhamos com modelos definidos pela fábrica, podendo avaliar alterações de tipologia, áreas e características de acordo com a disponibilidade existente.',
      ],
    },
  
    modelsSection: {
      label: 'Modelos',
      title: 'Soluções em madeira para diferentes estilos de vida.',
      description:
        'Cada solução pode ser avaliada de acordo com o espaço, objetivo, finalidade e opções disponíveis em fábrica.',
    },
  
    models: [
      {
        icon: Home,
        title: 'Habitação permanente',
        text: 'Casas de madeira pensadas para viver com conforto, funcionalidade e qualidade durante todo o ano.',
      },
      {
        icon: Leaf,
        title: 'Casas de férias',
        text: 'Soluções acolhedoras para descanso, lazer, fins de semana e contacto direto com a natureza.',
      },
      {
        icon: Building2,
        title: 'Turismo rural',
        text: 'Projetos indicados para alojamento local, turismo rural, glamping e investimento em experiências diferenciadas.',
      },
      {
        icon: Hammer,
        title: 'Bungalows e anexos',
        text: 'Estruturas versáteis para apoio habitacional, escritórios, arrumos, estúdios ou zonas de lazer.',
      },
    ],
  
    benefitsSection: {
      label: 'Vantagens',
      title: 'Porquê escolher uma casa de madeira?',
      description:
        'As casas de madeira são uma escolha natural para quem procura sustentabilidade, conforto, estética diferenciadora e materiais de qualidade.',
    },
  
    benefits: [
      {
        icon: Award,
        title: 'Casas certificadas',
        text: 'Soluções desenvolvidas com materiais de qualidade e certificações adequadas, conforme os modelos e fornecedores disponíveis.',
      },
      {
        icon: Leaf,
        title: 'Ecológicas e sustentáveis',
        text: 'Uma escolha indicada para quem procura conforto, eficiência e uma construção com maior ligação à natureza.',
      },
      {
        icon: Trees,
        title: 'Integração com a natureza',
        text: 'A madeira cria ambientes acolhedores e combina naturalmente com espaços verdes, terrenos rurais e zonas de lazer.',
      },
      {
        icon: ShieldCheck,
        title: 'Conforto e resistência',
        text: 'Projetos pensados para oferecer bem-estar, qualidade construtiva e utilização durante todo o ano.',
      },
      {
        icon: Clock,
        title: 'Construção eficiente',
        text: 'Os modelos de fábrica permitem processos mais organizados e soluções pensadas para facilitar a execução do projeto.',
      },
      {
        icon: CheckCircle,
        title: 'Modelos com opções',
        text: 'As casas partem de modelos definidos, podendo existir ajustes de tipologia e áreas conforme disponibilidade.',
      },
    ],
  
    ideal: {
      label: 'Ideal para',
      title: 'Projetos para viver, investir ou criar o seu refúgio.',
      description:
        'As casas de madeira adaptam-se a diferentes necessidades, desde habitação permanente até turismo rural, lazer ou investimento.',
      items: [
        'Habitação própria',
        'Casa de férias',
        'Turismo rural',
        'Alojamento local',
        'Bungalows',
        'Anexos e estúdios',
        'Escritórios de jardim',
        'Investimento imobiliário',
      ],
    },
  
    process: {
      label: 'Processo',
      title: 'Da ideia à proposta da sua casa de madeira.',
      steps: [
        {
          number: '1',
          title: 'Primeiro contacto',
          text: 'Falamos consigo para perceber a sua ideia, objetivo e localização.',
        },
        {
          number: '2',
          title: 'Análise',
          text: 'Avaliamos tipo de casa, área, finalidade e características pretendidas.',
        },
        {
          number: '3',
          title: 'Modelos disponíveis',
          text: 'Verificamos as soluções existentes e as possibilidades de ajuste em fábrica.',
        },
        {
          number: '4',
          title: 'Proposta',
          text: 'Preparamos uma solução ajustada ao projeto, considerando modelo, área e alterações possíveis.',
        },
        {
          number: '5',
          title: 'Seguimento',
          text: 'Acompanhamos os próximos passos para avançar com o projeto de forma clara e organizada.',
        },
      ],
    },
  
    gallery: {
      label: 'Galeria',
      title: 'Inspire-se para a sua futura casa de madeira.',
      description:
        'Área preparada para receber fotografias reais de exteriores, interiores, obras e projetos concluídos.',
      items: ['Exterior', 'Interior', 'Obra em andamento', 'Acabamentos', 'Projeto concluído'],
    },
  
    faq: {
      label: 'Perguntas frequentes',
      title: 'Dúvidas comuns antes de começar.',
      description:
        'Algumas respostas iniciais para ajudar o cliente a perceber melhor o processo antes de pedir orçamento.',
      items: [
        {
          question: 'Uma casa de madeira precisa de licenciamento?',
          answer:
            'Na maioria dos casos, sim. Em Portugal, uma casa destinada a habitação ou utilização permanente normalmente deve cumprir regras urbanísticas e procedimentos junto da Câmara Municipal. Cada caso deve ser analisado de acordo com o terreno e finalidade do projeto.',
        },
        {
          question: 'As casas são totalmente feitas à medida?',
          answer:
            'Por norma, as casas partem de modelos definidos pela fábrica. Podem existir alterações de tipologia, áreas e algumas características, mas tudo depende da disponibilidade da fábrica. Projetos muito específicos ou exclusivos podem ter impacto no valor final.',
        },
        {
          question: 'É possível alterar áreas ou tipologias?',
          answer:
            'Sim, em alguns casos é possível avaliar alterações nas áreas, divisões ou tipologia da casa. No entanto, essas alterações dependem sempre da viabilidade técnica e da disponibilidade da fábrica.',
        },
        {
          question: 'As casas são certificadas e ecológicas?',
          answer:
            'As soluções apresentadas privilegiam materiais de qualidade, conforto e sustentabilidade. A certificação e as características técnicas devem ser confirmadas de acordo com o modelo escolhido, os materiais aplicados e a disponibilidade da fábrica.',
        },
        {
          question: 'As casas podem ser usadas para habitação permanente?',
          answer:
            'Sim. As casas de madeira podem ser pensadas para habitação permanente, casas de férias, turismo rural, alojamento local ou outros fins, desde que o projeto seja adequado à finalidade pretendida e cumpra os requisitos aplicáveis.',
        },
        {
          question: 'O orçamento é personalizado?',
          answer:
            'Sim. O orçamento deve ser preparado de acordo com o modelo escolhido, área aproximada, localização, acabamentos, alterações pretendidas e disponibilidade da fábrica.',
        },
      ],
    },
  
    contactSection: {
      label: 'Contacto',
      title: 'Pronto para começar o seu projeto?',
      description:
        'Fale connosco e dê o primeiro passo para avaliar a solução de madeira mais adequada ao seu objetivo.',
      formNote:
        'Dados fictícios para versão piloto. Contactos, formulário e informações comerciais serão ajustados quando forem enviados os dados oficiais.',
    },
  
    footer: {
      copyright: '© 2026 Casas do Centro - Casas de Madeira. Todos os direitos reservados.',
    },
  };