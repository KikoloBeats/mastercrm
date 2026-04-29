// Extract first name from full name for warmer greetings
const fn = (name) => name?.split(/\s+/)[0] || name

export const TEMPLATES = {
  novo: [
    {
      id: 'novo_v1',
      label: 'Lista de espera - Com link',
      text: (name) =>
        `Olá ${fn(name)} \u{1F60A}\nSou a Júlia, da equipa da Carla Morais.\n\nFicaste na nossa lista de espera e queríamos mesmo que fizesses parte desta turma \u{1F90D}\n\nTens aqui o link:\nhttps://masterplan.carlamorais.com`,
    },
    {
      id: 'novo_v2',
      label: 'Lista de espera - Warm',
      text: (name) =>
        `Olá ${fn(name)} \u{1F60A}\nSou a Júlia, da equipa da Carla Morais.\n\nFicaste na nossa lista de espera e estamos a dar prioridade a quem já mostrou interesse.\n\nQueres que te envie os detalhes?`,
    },
    {
      id: 'novo_v3',
      label: 'Lista de espera - Cold (lista antiga)',
      text: (name) =>
        `Olá ${fn(name)} \u{1F60A}\nSou a Júlia, da equipa da Carla Morais.\n\nHá algum tempo que ficaste na nossa lista para o MasterPlan de Carreira. A turma está agora a formar-se.\n\nAinda tens interesse em fazer parte?`,
    },
    {
      id: 'novo_v4',
      label: 'Lista de espera - Inscrito recentemente',
      text: (name) =>
        `Olá ${fn(name)} \u{1F60A}\nSou a Júlia, da equipa da Carla Morais.\n\nInscreveste-te há pouco tempo para saber mais sobre o MasterPlan de Carreira. Bom timing, as inscrições acabaram de abrir.\n\nQueres que te envie o link?`,
    },
    {
      id: 'novo_v5',
      label: 'Lista de espera - A fechar em breve',
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
        `${fn(name)}, queríamos mesmo ter-te nesta turma \u{1F90D}\n\nAs inscrições estão a fechar em breve. Tens aqui o link:\nhttps://masterplan.carlamorais.com`,
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
        `Olá ${fn(name)} \u{1F60A}\n\nParabéns pela decisão!\n\nVais receber em breve as informações de acesso. Qualquer dúvida, estou aqui.\n\nAté já!`,
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
