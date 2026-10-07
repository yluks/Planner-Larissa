import { useMemo, useState } from 'react'
import { irPara } from '../App'
import Calendario from '../components/Calendario'
import { Anel, Barra, Relogio, Secao } from '../components/ui'
import { AFIRMACOES, HABITOS, SAUDACOES } from '../data/frases'
import { TOPIC_BY_ID, TOTAL_TOPICOS, areaEmoji, areaNome } from '../data/edital'
import { usePlanner } from '../store'
import { DIAS_CURTOS, addDays, diaSemanaId, diffDays, formatHoras, inicioSemana, parseISO, todayISO } from '../utils'

const ATALHOS = [
  { id: 'edital', nome: 'Edital', emoji: '📚', fundo: 'linear-gradient(160deg,#fbe3ea,#f3c6d3)' },
  { id: 'cronograma', nome: 'Cronograma', emoji: '🗓️', fundo: 'linear-gradient(160deg,#f7ece4,#ecd2c4)' },
  { id: 'estudar', nome: 'Estudar', emoji: '⏱️', fundo: 'linear-gradient(160deg,#f3e8f6,#dfc9e8)' },
  { id: 'revisoes', nome: 'Revisões', emoji: '🔁', fundo: 'linear-gradient(160deg,#fdeef0,#f5cdd5)' },
  { id: 'provas', nome: 'Provas', emoji: '🗂️', fundo: 'linear-gradient(160deg,#eef1f8,#d6dbec)' },
  { id: 'simulados', nome: 'Simulados', emoji: '📝', fundo: 'linear-gradient(160deg,#f9f0e6,#efd9c2)' },
  { id: 'erros', nome: 'Caderno de erros', emoji: '📒', fundo: 'linear-gradient(160deg,#f6e9ee,#e6c8d4)' },
]

export default function Dashboard() {
  const { data, set, adicionar, atualizar, remover, toggleHabito } = usePlanner()
  const [novoLembrete, setNovoLembrete] = useState('')
  const hoje = todayISO()
  const agora = new Date()
  const nome = data.config.nome.trim()

  const stats = useMemo(() => {
    const vistos = Object.values(data.topicos).filter((t) => t.teoria).length
    const segunda = inicioSemana(hoje)
    const minSemana = data.sessoes.filter((s) => s.data >= segunda && s.data <= hoje).reduce((n, s) => n + Number(s.minutos || 0), 0)
    const minHoje = data.sessoes.filter((s) => s.data === hoje).reduce((n, s) => n + Number(s.minutos || 0), 0)
    const pendentes = data.revisoes.filter((r) => !r.feita && r.data <= hoje)
    return { vistos, minSemana, minHoje, pendentes, segunda }
  }, [data, hoje])

  const planoHoje = data.cronograma[diaSemanaId()] ?? []
  const faltam = data.config.dataProva ? diffDays(hoje, data.config.dataProva) : null
  const afirmacoes = useMemo(() => {
    const ini = agora.getDate() % AFIRMACOES.length
    return [0, 1, 2].map((i) => AFIRMACOES[(ini + i) % AFIRMACOES.length])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoje])
  const metaMin = Number(data.config.metaHorasSemana || 0) * 60
  const diasSemana = Array.from({ length: 7 }, (_, i) => addDays(stats.segunda, i))

  return (
    <>
      <h1 className="titulo-pagina">Planner ENARE Odonto</h1>
      <p className="saudacao">
        {SAUDACOES(agora.getHours())}
        {nome ? `, ${nome}` : ''}! 🌷 {nome ? '' : <a href="#/ajustes" className="link-suave">(defina seu nome nos ajustes)</a>}
      </p>

      <details className="instrucoes">
        <summary>Leia as instruções</summary>
        <ol>
          <li>Em <b>Ajustes</b>, coloque seu nome, a data da prova e sua meta de horas semanais.</li>
          <li>Monte seu <b>Cronograma</b> semanal distribuindo as áreas do edital.</li>
          <li>Use o <b>Estudar</b> para cronometrar com pomodoro — cada foco concluído vira uma sessão registrada.</li>
          <li>No <b>Edital</b>, marque “teoria” quando estudar um assunto: as revisões de 24h, 7 e 30 dias são agendadas sozinhas.</li>
          <li>Resolva as <b>Provas</b> anteriores direto no planner — errou? salve a questão no caderno com um clique.</li>
          <li>Registre seus <b>Simulados</b> e anote cada questão errada no <b>Caderno de erros</b> — é ali que mora a aprovação.</li>
        </ol>
      </details>

      <div className="atalhos">
        {ATALHOS.map((a) => (
          <button key={a.id} className="atalho" onClick={() => irPara(a.id)}>
            <span className="arco" style={{ background: a.fundo }}>
              <span aria-hidden>{a.emoji}</span>
            </span>
            <span className="atalho-nome">🤍 {a.nome}</span>
          </button>
        ))}
      </div>

      <div className="painel">
        {/* Coluna esquerda */}
        <div className="coluna">
          <div className="cartao cartao-rosa">
            <Relogio />
          </div>

          <div className="cartao cartao-rosa contagem">
            {faltam === null ? (
              <>
                <span className="contagem-num">🎯</span>
                <a href="#/ajustes" className="link-suave">Defina a data da prova</a>
              </>
            ) : faltam > 0 ? (
              <>
                <span className="contagem-num">{faltam}</span>
                <span>{faltam === 1 ? 'dia' : 'dias'} para o ENARE</span>
              </>
            ) : faltam === 0 ? (
              <>
                <span className="contagem-num">🎉</span>
                <span>É hoje! Você consegue!</span>
              </>
            ) : (
              <>
                <span className="contagem-num">🌷</span>
                <span>Prova realizada — atualize a data nos ajustes</span>
              </>
            )}
          </div>

          <Secao titulo="Lembretes">
            <ul className="checklist">
              {data.lembretes.map((l) => (
                <li key={l.id} className={l.feito ? 'feito' : ''}>
                  <label>
                    <input type="checkbox" checked={l.feito} onChange={() => atualizar('lembretes', l.id, { feito: !l.feito })} />
                    <span>{l.texto}</span>
                  </label>
                  <button className="btn-x" onClick={() => remover('lembretes', l.id)} aria-label="Remover lembrete">×</button>
                </li>
              ))}
            </ul>
            <form
              className="linha-add"
              onSubmit={(e) => {
                e.preventDefault()
                if (!novoLembrete.trim()) return
                adicionar('lembretes', { texto: novoLembrete.trim(), feito: false })
                setNovoLembrete('')
              }}
            >
              <input value={novoLembrete} onChange={(e) => setNovoLembrete(e.target.value)} placeholder="+ Novo lembrete" />
            </form>
          </Secao>

          <div className="mascote" aria-hidden>
            <span className="coracao">💗</span>
            <span className="dente">🦷</span>
          </div>
        </div>

        {/* Coluna central */}
        <div className="coluna">
          <div className="cartao cartao-rosa hoje">
            <div className="hoje-num">
              <div>
                <strong>{formatHoras(stats.minHoje)}</strong>
                <span>estudados hoje</span>
              </div>
              <div>
                <strong>{stats.pendentes.length}</strong>
                <span>revisões pendentes</span>
              </div>
              <div>
                <strong>{formatHoras(stats.minSemana)}</strong>
                <span>nesta semana</span>
              </div>
            </div>
            {metaMin > 0 && (
              <div className="meta-semana">
                <Barra valor={stats.minSemana} max={metaMin} rotulo="Meta semanal" />
                <small>
                  meta: {data.config.metaHorasSemana}h/semana · {Math.min(100, Math.round((stats.minSemana / metaMin) * 100))}%
                </small>
              </div>
            )}
          </div>

          <Secao titulo="Plano de hoje" acao={<a href="#/cronograma" className="link-suave">editar</a>}>
            {planoHoje.length ? (
              <ul className="lista-plano">
                {planoHoje.map((b) => (
                  <li key={b.id}>
                    <span className="tag">{areaEmoji(b.areaId)} {areaNome(b.areaId)}</span>
                    {b.horas && <span className="plano-horas">{b.horas}h</span>}
                    {b.obs && <span className="plano-obs">{b.obs}</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="vazio">Nada planejado para hoje. Que tal montar o cronograma? 🗓️</p>
            )}
            {stats.pendentes.length > 0 && (
              <div className="pendentes">
                <strong>🔁 Revisar hoje</strong>
                <ul>
                  {stats.pendentes.slice(0, 5).map((r) => (
                    <li key={r.id}>
                      {areaEmoji(TOPIC_BY_ID[r.topicoId]?.areaId)} {TOPIC_BY_ID[r.topicoId]?.nome ?? r.titulo}{' '}
                      <small>(R{r.etapa})</small>
                    </li>
                  ))}
                </ul>
                <a href="#/revisoes" className="link-suave">ver todas →</a>
              </div>
            )}
          </Secao>

          <Secao titulo="Visão geral">
            <Calendario />
          </Secao>
        </div>

        {/* Coluna direita */}
        <div className="coluna">
          <div className="cartao cartao-rosa lema">
            <span>Estude</span>
            <span>Revise</span>
            <span>Aprove</span>
          </div>

          <Secao titulo="Progresso do edital">
            <div className="progresso-edital">
              <Anel valor={(stats.vistos / TOTAL_TOPICOS) * 100}>
                <strong>{Math.round((stats.vistos / TOTAL_TOPICOS) * 100)}%</strong>
                <small>
                  {stats.vistos}/{TOTAL_TOPICOS}
                </small>
              </Anel>
              <p>assuntos com teoria vista</p>
              <a href="#/edital" className="link-suave">abrir edital →</a>
            </div>
          </Secao>

          <Secao titulo="Afirmações">
            <div className="afirmacoes">
              {afirmacoes.map((f, i) => (
                <div key={f}>
                  {i > 0 && <div className="afirmacao-coracao" aria-hidden>💗</div>}
                  <blockquote className={i % 2 ? 'cartao-rosa' : ''}>🌸 {f}</blockquote>
                </div>
              ))}
            </div>
          </Secao>

          <Secao titulo="Notas rápidas">
            <textarea
              className="notas"
              value={data.notas}
              onChange={(e) => set('notas', e.target.value)}
              placeholder="✏️ Escreva algo…"
              rows={6}
            />
          </Secao>
        </div>
      </div>

      <Secao titulo="Hábitos da semana" className="habitos">
        <div className="tabela-rolagem">
          <table className="tabela-habitos">
            <thead>
              <tr>
                <th />
                {diasSemana.map((d) => (
                  <th key={d} className={d === hoje ? 'hoje' : ''}>
                    {DIAS_CURTOS[parseISO(d).getDay()]}
                    <small>{parseISO(d).getDate()}</small>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HABITOS.map((h) => (
                <tr key={h.id}>
                  <th scope="row">
                    {h.emoji} {h.nome}
                  </th>
                  {diasSemana.map((d) => {
                    const marcado = !!data.habitos[d]?.[h.id]
                    return (
                      <td key={d}>
                        <button
                          className={`bolinha ${marcado ? 'on' : ''}`}
                          onClick={() => toggleHabito(d, h.id)}
                          aria-pressed={marcado}
                          aria-label={`${h.nome} em ${d}`}
                          disabled={d > hoje}
                        >
                          {marcado ? '♥' : ''}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Secao>
    </>
  )
}

