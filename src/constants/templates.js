// Extract first name from full name for warmer greetings
const fn = (name) => name?.split(/\s+/)[0] || name

export const TEMPLATES = {
  novo: [
    {
      id: 'novo_v1',
      label: 'Lançamento — Com link',
      text: (name) =>
        `Olá ${fn(name)} \u{1F60A}\nSou a Júlia, da equipa da Carla Morais.\n\nAs inscrições para o MasterPlan de Carreira abriram hoje. Tens aqui o link para fazeres parte desta turma \u{1F90D}\n\nhttps://masterplan.carlamorais.com`,
    },
    {
      id: 'novo_v2',
      label: 'Lançamento — Warm',
      text: (name) =>
        `Olá ${fn(name)} \u{1F60A}\nSou a Júlia, da equipa da Carla Morais.\n\nAs inscrições para o MasterPlan de Carreira abriram hoje. Ficaste na nossa lista de interessadas e não queria que ficasses de fora.\n\nQueres que te envie o link?`,
    },
    {
      id: 'novo_v3',
      label: 'Lançamento — Cold',
      text: (name) =>
        `Olá ${fn(name)} \u{1F60A}\nSou a Júlia, da equipa da Carla Morais.\n\nAs inscrições para o MasterPlan de Carreira abriram hoje. Ficaste na nossa lista e queria avisar-te.\n\nAinda tens interesse?`,
    },
    {
      id: 'novo_v4',
      label: 'Lançamento — Inscrito hoje',
      text: (name) =>
        `Olá ${fn(name)} \u{1F60A}\nSou a Júlia, da equipa da Carla Morais.\n\nInscreveste-te hoje para saber mais sobre o MasterPlan de Carreira e as inscrições estão abertas.\n\nQueres que te envie o link directo?`,
    },
  ],
  contactado: [
    {
      id: 'contactado_followup',
      label: 'Follow-up — Hoje é o último dia',
      text: (name) =>
        `Olá ${fn(name)} \u{1F60A}\n\nAs inscrições para o MasterPlan de Carreira fecham hoje.\n\nAinda estás interessada?`,
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
      label: 'Conversão — Com link',
      text: (name) =>
        `Olá ${fn(name)} \u{1F60A}\nSou a Júlia, da equipa da Carla Morais.\n\nAs inscrições para o MasterPlan de Carreira abriram hoje. Tens aqui o link para fazeres parte desta turma \u{1F90D}\n\nhttps://masterplan.carlamorais.com`,
    },
    {
      id: 'interessado_convert_b',
      label: 'Conversão — Fechar',
      text: (name) =>
        `${fn(name)}, é hoje o dia. Já falámos sobre o que queres mudar na tua carreira — o MasterPlan é o próximo passo.\n\nQueres garantir o teu lugar?`,
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
