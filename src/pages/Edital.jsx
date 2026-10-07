import { useMemo, useState } from 'react'
import { Barra, TituloPagina } from '../components/ui'
import { AREAS, PRIORIDADE, TOTAL_TOPICOS } from '../data/edital'
import { usePlanner } from '../store'
import { pct } from '../utils'

const CAMPOS = [
  { id: 'teoria', label: 'Teoria' },
  { id: 'questoes', label: 'Questões' },
  { id: 'revisao', label: 'Revisado' },
]

const normalizar = (s) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

export default function Edital() {
  const { data, toggleTopico } = usePlanner()
  const [busca, setBusca] = useState('')
  const [prioridade, setPrioridade] = useState('')
  const [abertas, setAbertas] = useState(() => new Set([AREAS[0].id]))

  const acertoPorArea = useMemo(() => {
    const r = {}
    data.sessoes.forEach((s) => {
      if (!s.areaId || !Number(s.questoes)) return
      r[s.areaId] ??= { q: 0, a: 0 }
      r[s.areaId].q += Number(s.questoes)
      r[s.areaId].a += Number(s.acertos || 0)
    })
    Object.values(data.respostas).forEach((x) => {
      if (x.anulada || !x.areaId) return
      r[x.areaId] ??= { q: 0, a: 0 }
      r[x.areaId].q++
      if (x.correta) r[x.areaId].a++
    })
    return r
  }, [data.sessoes, data.respostas])

  const termo = normalizar(busca.trim())
  const areas = AREAS.filter((a) => !prioridade || a.prioridade === prioridade)
    .map((a) => ({
      ...a,
      visiveis: termo ? a.topicos.filter((t) => normalizar(t.nome).includes(termo) || normalizar(a.nome).includes(termo)) : a.topicos,
    }))
    .filter((a) => a.visiveis.length)

  const totais = CAMPOS.map((c) => ({
    ...c,
    n: Object.values(data.topicos).filter((t) => t[c.id]).length,
  }))

  const alternar = (id) =>
    setAbertas((s) => {
      const n = new Set(s)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })

  return (
    <>
      <TituloPagina emoji="📚" titulo="Conteúdo do edital" frase="🌸 Um assunto de cada vez — marque e acompanhe sua evolução." />

      <p className="aviso">
        Lista com os temas mais recorrentes nas provas de residência em Odontologia. A prioridade é uma estimativa — confira sempre o
        edital oficial do ENARE do seu ano. Ao marcar <b>Teoria</b>, revisões de 24h, 7 e 30 dias são agendadas automaticamente.
      </p>

      <div className="resumo-edital">
        {totais.map((t) => (
          <div key={t.id} className="cartao cartao-rosa">
            <strong>{pct(t.n, TOTAL_TOPICOS)}%</strong>
            <span>
              {t.label} · {t.n}/{TOTAL_TOPICOS}
            </span>
            <Barra valor={t.n} max={TOTAL_TOPICOS} rotulo={t.label} />
          </div>
        ))}
      </div>

      <div className="filtros">
        <input type="search" placeholder="🔎 Buscar assunto…" value={busca} onChange={(e) => setBusca(e.target.value)} />
        <select value={prioridade} onChange={(e) => setPrioridade(e.target.value)}>
          <option value="">Todas as prioridades</option>
          {Object.entries(PRIORIDADE).map(([id, p]) => (
            <option key={id} value={id}>
              {p.label}
            </option>
          ))}
        </select>
        <button className="btn-texto" onClick={() => setAbertas(new Set(AREAS.map((a) => a.id)))}>expandir tudo</button>
        <button className="btn-texto" onClick={() => setAbertas(new Set())}>recolher</button>
      </div>

      <div className="areas">
        {areas.map((a) => {
          const vistos = a.topicos.filter((t) => data.topicos[t.id]?.teoria).length
          const aberta = abertas.has(a.id) || !!termo
          const ac = acertoPorArea[a.id]
          return (
            <section key={a.id} className={`area ${aberta ? 'aberta' : ''}`}>
              <button className="area-topo" onClick={() => alternar(a.id)} aria-expanded={aberta}>
                <span className="area-seta" aria-hidden>▸</span>
                <span className="area-emoji" aria-hidden>{a.emoji}</span>
                <span className="area-nome">{a.nome}</span>
                <span className={`tag prioridade-${a.prioridade}`}>{PRIORIDADE[a.prioridade].short}</span>
                {ac && <span className="area-acerto" title={`Acerto em ${ac.q} questões (sessões + provas)`}>🎯 {pct(ac.a, ac.q)}%</span>}
                <span className="area-prog">
                  <Barra valor={vistos} max={a.topicos.length} rotulo={`Progresso em ${a.nome}`} />
                  <small>
                    {vistos}/{a.topicos.length}
                  </small>
                </span>
              </button>
              {aberta && (
                <ul className="topicos">
                  {a.visiveis.map((t) => {
                    const st = data.topicos[t.id] ?? {}
                    return (
                      <li key={t.id} className={st.teoria && st.questoes && st.revisao ? 'completo' : ''}>
                        <span className="topico-nome">{t.nome}</span>
                        <span className="topico-checks">
                          {CAMPOS.map((c) => (
                            <button
                              key={c.id}
                              className={`pilula ${st[c.id] ? 'on' : ''}`}
                              aria-pressed={!!st[c.id]}
                              onClick={() => toggleTopico(t.id, c.id)}
                            >
                              {st[c.id] ? '✓ ' : ''}
                              {c.label}
                            </button>
                          ))}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          )
        })}
        {!areas.length && <p className="vazio">Nenhum assunto encontrado.</p>}
      </div>
    </>
  )
}
