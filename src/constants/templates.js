// Extract first name from full name for warmer greetings
const fn = (name) => name?.split(/\s+/)[0] || name

export const TEMPLATES = {
  novo: [
    {
      id: 'novo_v1',
      label: 'Variação A - Confirmação suave',
      text: (name) =>
        `Olá ${fn(name)} \u{1F60A}\nSou a Júlia, da equipa da Carla Morais.\n\nVi que preencheste o formulário do MasterPlan de Carreira. As inscrições abrem amanhã, dia 28.\n\nVou partilhar o link contigo amanhã`,
    },
    {
      id: 'novo_v2',
      label: 'Variação B - Com curiosidade',
      text: (name) =>
        `Olá ${fn(name)} \u{1F60A}\nSou a Júlia, da equipa da Carla Morais.\n\nRecebi a tua inscrição no MasterPlan de Carreira. As inscrições abrem amanhã, dia 28.\n\nEnvio-te o link amanhã`,
    },
    {
      id: 'novo_v3',
      label: 'Variação C - Geral',
      text: (name) =>
        `Olá ${fn(name)} \u{1F60A}\nSou a Júlia, da equipa da Carla Morais.\n\nVi que te inscreveste no MasterPlan de Carreira. As inscrições abrem amanhã, dia 28.\n\nQualquer dúvida, estou por aqui`,
    },
  ],
  contactado: [
    {
      id: 'contactado_followup',
      label: 'Follow-up apos 2 dias',
      text: (name) =>
        `Ola ${fn(name)}! So a verificar se a minha mensagem anterior chegou bem.\n\nO lancamento do MasterPlan de Carreira da Carla e a 28 de abril e as vagas sao limitadas. Tens alguma questao em que te possa ajudar?\n\nFico a espera!`,
    },
  ],
  respondeu: [
    {
      id: 'respondeu_qualify',
      label: 'Qualificacao',
      text: (name, tallyResponse) => {
        const snippet =
          tallyResponse && tallyResponse.trim().length > 10
            ? `Li o que partilhaste sobre o teu percurso e faz todo o sentido.`
            : `Obrigada por teres respondido!`
        return `Ola ${fn(name)}! ${snippet}\n\nQuero mesmo ajudar-te a encontrar o caminho certo. Podes dizer-me: o que e que sentes que esta mesmo a bloquear-te na tua carreira neste momento?\n\nEstou aqui para te ouvir!`
      },
    },
  ],
  interessado: [
    {
      id: 'interessado_convert',
      label: 'Conversao',
      text: (name) =>
        `Ola ${fn(name)}! Fico muito contente com o teu interesse.\n\nO MasterPlan de Carreira da Carla Morais inclui: plano de carreira personalizado, sessoes de estrategia pratica, comunidade de apoio e acompanhamento ao longo de todo o processo. O lancamento e a 28 de abril e as vagas sao limitadas!\n\nQueres que te reserve um lugar?`,
    },
  ],
  comprou: [
    {
      id: 'comprou_welcome',
      label: 'Boas-vindas',
      text: (name) =>
        `Ola ${fn(name)}! Parabens pela tua decisao!\n\nFizeste uma escolha excelente. A Carla e toda a equipa estao muito felizes por ter-te a bordo. Vais receber em breve as informacoes de acesso ao curso.\n\nAte ja!`,
    },
  ],
  nao_comprou: [
    {
      id: 'nao_comprou_recovery',
      label: 'Recuperacao pos-lancamento',
      text: (name) =>
        `Ola ${fn(name)}! Compreendo que neste momento pode nao ser o timing certo.\n\nFica a saber que a porta fica sempre aberta. Se algum dia quiseres retomar a conversa, estou aqui para ajudar.\n\nCuida-te bem!`,
    },
  ],
  nao_qualificado: [
    {
      id: 'nao_qualificado_close',
      label: 'Encerramento',
      text: (name) =>
        `Ola ${fn(name)}! Obrigada pelo teu tempo e interesse.\n\nFica a saber que quando o timing for certo, estamos aqui. Desejo-te muita forca no teu percurso!\n\nCuida-te!`,
    },
  ],
}
