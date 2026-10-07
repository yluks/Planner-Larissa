import { useMemo, useState } from 'react'
import { usePlanner } from '../store'
import { DIAS_CURTOS, MESES, formatBR, formatHoras, toISO, todayISO } from '../utils'
import { TOPIC_BY_ID, areaEmoji, areaNome } from '../data/edital'

// Calendário mensal com sessões, revisões, simulados e o dia da prova
export default function Calendario() {
  const { data } = usePlanner()
  const hoje = todayISO()
  const [ref, setRef] = useState(() => {
    const d = new Date()
    return { ano: d.getFullYear(), mes: d.getMonth() }
  })
  const [selecionado, setSelecionado] = useState(hoje)

  const eventos = useMemo(() => {
    const porDia = {}
    const add = (dia, ev) => (porDia[dia] ??= []).push(ev)
    data.sessoes.forEach((s) =>
      add(s.data, { tipo: 'sessao', texto: `${areaEmoji(s.areaId)} ${areaNome(s.areaId)} · ${formatHoras(s.minutos)}` }),
    )
    data.revisoes.forEach((r) =>
      add(r.data, {
        tipo: 'revisao',
        texto: `${r.feita ? '✅' : '🔁'} R${r.etapa}: ${TOPIC_BY_ID[r.topicoId]?.nome ?? r.titulo}`,
      }),
    )
    data.simulados.forEach((s) => add(s.data, { tipo: 'simulado', texto: `📝 ${s.nome}` }))
    if (data.config.dataProva) add(data.config.dataProva, { tipo: 'prova', texto: '🎯 Prova ENARE' })
    return porDia
  }, [data])

  const primeiro = new Date(ref.ano, ref.mes, 1)
  const inicio = new Date(primeiro)
  inicio.setDate(1 - primeiro.getDay())
  const dias = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(inicio)
    d.setDate(inicio.getDate() + i)
    return d
  })
  // corta a última semana se ela for toda do mês seguinte
  const semanas = dias[35].getMonth() !== ref.mes ? 5 : 6

  const mudar = (delta) =>
    setRef(({ ano, mes }) => {
      const d = new Date(ano, mes + delta, 1)
      return { ano: d.getFullYear(), mes: d.getMonth() }
    })

  const doDia = eventos[selecionado] ?? []

  return (
    <div className="calendario">
      <div className="cal-topo">
        <strong>
          {MESES[ref.mes]} {ref.ano}
        </strong>
        <div className="cal-nav">
          <button className="btn-icone" onClick={() => mudar(-1)} aria-label="Mês anterior">‹</button>
          <button
            className="btn-texto"
            onClick={() => {
              const d = new Date()
              setRef({ ano: d.getFullYear(), mes: d.getMonth() })
              setSelecionado(hoje)
            }}
          >
            Hoje
          </button>
          <button className="btn-icone" onClick={() => mudar(1)} aria-label="Próximo mês">›</button>
        </div>
      </div>
      <div className="cal-grade">
        {DIAS_CURTOS.map((d) => (
          <div key={d} className="cal-cab">{d}</div>
        ))}
        {dias.slice(0, semanas * 7).map((d) => {
          const iso = toISO(d)
          const evs = eventos[iso] ?? []
          const tipos = [...new Set(evs.map((e) => e.tipo))]
          const classes = [
            'cal-dia',
            d.getMonth() !== ref.mes && 'fora',
            iso === hoje && 'hoje',
            iso === selecionado && 'sel',
            iso === data.config.dataProva && 'prova',
          ]
            .filter(Boolean)
            .join(' ')
          return (
            <button key={iso} className={classes} onClick={() => setSelecionado(iso)} aria-label={`${formatBR(iso)}, ${evs.length} eventos`}>
              <span className="cal-num">{d.getDate()}</span>
              <span className="cal-pontos">
                {tipos.map((t) => (
                  <i key={t} className={`ponto ponto-${t}`} />
                ))}
              </span>
            </button>
          )
        })}
      </div>
      <div className="cal-legenda">
        <span><i className="ponto ponto-sessao" /> estudo</span>
        <span><i className="ponto ponto-revisao" /> revisão</span>
        <span><i className="ponto ponto-simulado" /> simulado</span>
        <span><i className="ponto ponto-prova" /> prova</span>
      </div>
      <div className="cal-detalhe">
        <strong>{selecionado === hoje ? 'Hoje' : formatBR(selecionado)}</strong>
        {doDia.length ? (
          <ul>
            {doDia.map((e, i) => (
              <li key={i}>{e.texto}</li>
            ))}
          </ul>
        ) : (
          <p className="vazio">Nada registrado neste dia.</p>
        )}
      </div>
    </div>
  )
}
