import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { addDays, todayISO, uid } from './utils'

const STORAGE_KEY = 'planner-odonto-enare:v1'

export const INTERVALOS_REVISAO = [1, 7, 30]

const estadoInicial = () => ({
  config: {
    nome: '',
    dataProva: '',
    metaHorasSemana: 20,
    pomodoro: { foco: 25, pausa: 5, longa: 15 },
  },
  topicos: {},
  cronograma: { seg: [], ter: [], qua: [], qui: [], sex: [], sab: [], dom: [] },
  sessoes: [],
  revisoes: [],
  simulados: [],
  erros: [],
  // respostas do banco de questões: { [questaoId]: { letra, correta, areaId, data } }
  respostas: {},
  lembretes: [
    { id: uid(), texto: 'Baixar o edital do ENARE e conferir o conteúdo', feito: false },
    { id: uid(), texto: 'Montar meu cronograma semanal', feito: false },
  ],
  notas: '',
  habitos: {},
})

const carregar = () => {
  try {
    const salvo = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!salvo) return estadoInicial()
    const base = estadoInicial()
    return { ...base, ...salvo, config: { ...base.config, ...salvo.config } }
  } catch {
    return estadoInicial()
  }
}

const PlannerContext = createContext(null)

export function PlannerProvider({ children }) {
  const [data, setData] = useState(carregar)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  // set('chave', valor) ou set('chave', anterior => novo)
  const set = useCallback((chave, valor) => {
    setData((d) => ({ ...d, [chave]: typeof valor === 'function' ? valor(d[chave]) : valor }))
  }, [])

  const acoes = useMemo(
    () => ({
      set,

      toggleTopico(topicoId, campo) {
        setData((d) => {
          const atual = d.topicos[topicoId] ?? {}
          const marcado = !atual[campo]
          const topicos = { ...d.topicos, [topicoId]: { ...atual, [campo]: marcado } }
          let revisoes = d.revisoes
          if (campo === 'teoria') {
            if (marcado && !revisoes.some((r) => r.topicoId === topicoId)) {
              const hoje = todayISO()
              revisoes = [
                ...revisoes,
                ...INTERVALOS_REVISAO.map((dias, i) => ({
                  id: uid(),
                  topicoId,
                  etapa: i + 1,
                  data: addDays(hoje, dias),
                  feita: false,
                })),
              ]
            } else if (!marcado) {
              revisoes = revisoes.filter((r) => r.topicoId !== topicoId || r.feita)
            }
          }
          return { ...d, topicos, revisoes }
        })
      },

      concluirRevisao(id) {
        setData((d) => {
          const revisoes = d.revisoes.map((r) => (r.id === id ? { ...r, feita: !r.feita, feitaEm: todayISO() } : r))
          const rev = revisoes.find((r) => r.id === id)
          let topicos = d.topicos
          // Concluir a última revisão do ciclo marca o tópico como revisado
          if (rev?.topicoId && rev.feita && rev.etapa === INTERVALOS_REVISAO.length) {
            topicos = { ...topicos, [rev.topicoId]: { ...topicos[rev.topicoId], revisao: true } }
          }
          return { ...d, revisoes, topicos }
        })
      },

      adicionar(chave, item) {
        setData((d) => ({ ...d, [chave]: [...d[chave], { id: uid(), ...item }] }))
      },
      atualizar(chave, id, patch) {
        setData((d) => ({ ...d, [chave]: d[chave].map((x) => (x.id === id ? { ...x, ...patch } : x)) }))
      },
      remover(chave, id) {
        setData((d) => ({ ...d, [chave]: d[chave].filter((x) => x.id !== id) }))
      },

      responder(questao, letra) {
        setData((d) => ({
          ...d,
          respostas: {
            ...d.respostas,
            [questao.id]: {
              letra,
              correta: !questao.anulada && letra === questao.gabarito,
              anulada: questao.anulada,
              areaId: questao.area_id,
              data: todayISO(),
            },
          },
        }))
      },
      limparResposta(questaoId) {
        setData((d) => {
          const { [questaoId]: _, ...resto } = d.respostas
          return { ...d, respostas: resto }
        })
      },

      toggleHabito(dia, habitoId) {
        setData((d) => {
          const doDia = d.habitos[dia] ?? {}
          return { ...d, habitos: { ...d.habitos, [dia]: { ...doDia, [habitoId]: !doDia[habitoId] } } }
        })
      },

      importar(json) {
        const base = estadoInicial()
        setData({ ...base, ...json, config: { ...base.config, ...json.config } })
      },
      resetar() {
        setData(estadoInicial())
      },
    }),
    [set],
  )

  const value = useMemo(() => ({ data, ...acoes }), [data, acoes])
  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>
}

export const usePlanner = () => useContext(PlannerContext)
