// Extract first name from full name for warmer greetings
const fn = (name) => name?.split(/\s+/)[0] || name

export const TEMPLATES = {
  novo: [
    // --- COM LINK (leads mais quentes) ---
    {
      id: 'novo_v1',
      label: 'Com link - Turma a formar-se',
      text: (name) =>
        `Olá ${fn(name)} \u{1F60A}\nSou a Júlia, da equipa da Carla Morais.\n\nFicaste na nossa lista de espera. A turma está agora a formar-se e ainda há lugar \u{1F90D}\n\nTens aqui o link:\nhttps://masterplan.carlamorais.com`,
    },
    {
      id: 'novo_v6',
      label: 'Com link - Continua o que começaste',
      text: (name) =>
        `Olá ${fn(name)} \u{1F60A}\nSou a Júlia, da equipa da Carla Morais.\n\nInscreveste-te na nossa lista porque queres mudar algo na tua carreira. O próximo passo está aqui:\nhttps://masterplan.carlamorais.com`,
    },
    {
      id: 'novo_v7',
      label: 'Com link - O que e o programa',
      text: (name) =>
        `Olá ${fn(name)} \u{1F60A}\nSou a Júlia, da equipa da Carla Morais.\n\nFicaste na nossa lista para o MasterPlan de Carreira. O programa ajuda a perceber onde estás, onde queres chegar e o que fazer a seguir. Prático, estruturado, com a Carla.\n\nTens aqui o link:\nhttps://masterplan.carlamorais.com`,
    },
    {
      id: 'novo_v8',
      label: 'Com link - Para quem quer clareza',
      text: (name) =>
        `Olá ${fn(name)} \u{1F60A}\nSou a Júlia, da equipa da Carla Morais.\n\nO MasterPlan é para quem quer ter clareza sobre a carreira e um plano concreto para avançar. Ficaste na nossa lista. Tens aqui o link:\nhttps://masterplan.carlamorais.com`,
    },
    // --- AQUECIMENTO (abrir conversa primeiro) ---
    {
      id: 'novo_v2',
      label: 'Aquecimento - Prioridade',
      text: (name) =>
        `Olá ${fn(name)} \u{1F60A}\nSou a Júlia, da equipa da Carla Morais.\n\nFicaste na nossa lista e estamos a contactar quem mostrou interesse antes de abrirmos para o público geral.\n\nAinda estás interessada?`,
    },
    {
      id: 'novo_v3',
      label: 'Aquecimento - Lista antiga',
      text: (name) =>
        `Olá ${fn(name)} \u{1F60A}\nSou a Júlia, da equipa da Carla Morais.\n\nInscreveste-te na nossa lista porque queres mudar algo na carreira. Passado algum tempo, ainda é esse o teu caso?`,
    },
    // --- URGÊNCIA (usar perto do fecho) ---
    {
      id: 'novo_v5',
      label: 'Urgencia - A fechar em breve',
      text: (name) =>
        `Olá ${fn(name)} \u{1F60A}\nSou a Júlia, da equipa da Carla Morais.\n\nAs inscrições para o MasterPlan de Carreira estão a fechar em breve. Ficaste na nossa lista e não queríamos que ficasses de fora.\n\nAinda tens interesse?`,
    },
  ],
  contactado: [
    {
      id: 'contactado_followup',
      label: 'Follow-up - Ainda abertas',
      text: (name) =>
        `Olá ${fn(name)} \u{1F60A}\n\nSó a passar por aqui. As inscrições para o MasterPlan ainda estão abertas.\n\nAinda estás a pensar?`,
    },
    {
      id: 'contactado_urgencia',
      label: 'Follow-up - Último dia',
      text: (name) =>
        `Olá ${fn(name)} \u{1F60A}\n\nHoje é o último dia para entrares no MasterPlan de Carreira.\n\nQueres garantir o teu lugar?`,
    },
  ],
  respondeu: [
    {
      id: 'respondeu_qualify',
      label: 'Qualificação',
      text: (name, tallyResponse) => {
        const snippet = tallyResponse && tallyResponse.trim().length > 10
          ? `Li o que partilhaste e faz sentido.`
          : `Obrigada por teres respondido.`
        return `Olá ${fn(name)}! ${snippet}\n\nO que sentes que está mesmo a bloquear-te na carreira neste momento?`
      },
    },
  ],
  interessado: [
    {
      id: 'interessado_convert_a',
      label: 'Conversão - Com link',
      text: (name) =>
        `${fn(name)}, a turma está a fechar e ainda há lugar para ti \u{1F90D}\n\nTens aqui o link:\nhttps://masterplan.carlamorais.com`,
    },
    {
      id: 'interessado_convert_b',
      label: 'Conversão - Fechar',
      text: (name) =>
        `${fn(name)}, esta turma é para pessoas que estão prontas para mudar de verdade.\n\nJá falámos sobre o que queres. O MasterPlan é o próximo passo concreto.\n\nQueres garantir o teu lugar?`,
    },
  ],
  comprou: [
    {
      id: 'comprou_welcome',
      label: 'Boas-vindas',
      text: (name) =>
        `Olá ${fn(name)} \u{1F90D}\n\nRecebemos a confirmação do teu pagamento para o MasterPlan de Carreira.\n\nMuito obrigada pela confiança!\n\nEnviámos-te dois emails: um com o acesso à plataforma e outro com tudo o que precisas para começar.\n\nConfirma se chegaram assim que puderes.\n\nQualquer dúvida, podes falar connosco aqui ou por email. Estamos aqui para ti \u{1F680}\n\nJúlia | Equipa MasterPlan`,
    },
  ],
  nao_comprou: [
    {
      id: 'nao_comprou_recovery',
      label: 'Recuperação pós-lançamento',
      text: (name) =>
        `Olá ${fn(name)} \u{1F60A}\n\nEspero que estejas bem. Compreendo que esta altura pode não ter sido a certa.\n\nSe quiseres conversar mais à frente, estou aqui.\n\nCuida-te!`,
    },
  ],
  nao_qualificado: [
    {
      id: 'nao_qualificado_close',
      label: 'Encerramento',
      text: (name) =>
        `Olá ${fn(name)} \u{1F60A}\n\nObrigada pelo interesse e pelo tempo que dedicaste.\n\nSe o teu percurso mudar e fizer sentido falar de novo, sabes onde me encontrar.\n\nCuida-te!`,
    },
  ],
}
