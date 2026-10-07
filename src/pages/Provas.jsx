import { useEffect, useMemo, useState } from 'react'
import { Barra, Secao, SelectArea, TituloPagina, Vazio } from '../components/ui'
import { AREAS, areaEmoji, areaNome } from '../data/edital'
import { usePlanner } from '../store'
import { mensagemErro, supabase } from '../supabase'
import { pct, todayISO } from '../utils'

const CAMPOS_QUESTAO =
  'id, prova_id, numero, area_id, assunto, enunciado, alternativas, gabarito, anulada, comentario, prova:provas(exame, ano, programa)'

function useConsulta(fn, deps) {
  const [estado, setEstado] = useState({ carregando: true, dados: null, erro: null })
  useEffect(() => {
    if (!supabase) return setEstado({ carregando: false, dados: null, erro: { message: 'Supabase não configurado (.env.local).' } })
    let ativo = true
    setEstado((e) => ({ ...e, carregando: true }))
    fn().then(({ data, error }) => ativo && setEstado({ carregando: false, dados: data, erro: error }))
    return () => {
      ativo = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return estado
}

const nomeProva = (p) => `${p.exame} ${p.ano}${p.programa && p.programa !== 'Odontologia' ? ` · ${p.programa}` : ''}`

// ---------- Resolver questões ----------
function Resolver({ filtro, titulo, onSair }) {
  const { data, responder, limparResposta, adicionar } = usePlanner()
  const [soPendentes, setSoPendentes] = useState(false)
  const [i, setI] = useState(0)
  const [marcada, setMarcada] = useState('')
  const [salvoNoCaderno, setSalvoNoCaderno] = useState({})

  const { carregando, dados, erro } = useConsulta(() => {
    let q = supabase.from('questoes').select(CAMPOS_QUESTAO)
    q = filtro.provaId ? q.eq('prova_id', filtro.provaId) : q.eq('area_id', filtro.areaId)
    return q.order('prova_id').order('numero').limit(1000)
  }, [filtro.provaId, filtro.areaId])

  // a lista fica "congelada" ao ativar o filtro, para a questão atual não sumir ao ser respondida
  const lista = useMemo(
    () => (dados ?? []).filter((q) => !soPendentes || !data.respostas[q.id]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dados, soPendentes],
  )

  useEffect(() => {
    setI(0)
  }, [lista])

  const q = lista[i]
  const resp = q ? data.respostas[q.id] : null

  useEffect(() => {
    setMarcada(resp?.letra ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q?.id])

  const respondidas = lista.filter((x) => data.respostas[x.id] && !data.respostas[x.id].anulada)
  const acertos = respondidas.filter((x) => data.respostas[x.id].correta).length

  const ir = (n) => setI((atual) => Math.min(Math.max(0, atual + n), lista.length - 1))

  const salvarErro = () => {
    const certa = q.alternativas.find((a) => a.letra === q.gabarito)
    adicionar('erros', {
      data: todayISO(),
      areaId: q.area_id,
      assunto: q.assunto ?? '',
      fonte: `${nomeProva(q.prova)}, Q${q.numero}`,
      questao: q.enunciado.length > 400 ? `${q.enunciado.slice(0, 400)}…` : q.enunciado,
      motivo: 'conteudo',
      aprendizado: `Resposta: ${q.gabarito}) ${certa?.texto ?? ''}${q.comentario ? ` — ${q.comentario}` : ''}`,
      revisado: false,
    })
    setSalvoNoCaderno((s) => ({ ...s, [q.id]: true }))
  }

  return (
    <>
      <div className="barra-acoes">
        <button className="btn-texto" onClick={onSair}>← voltar às provas</button>
        <label className="check-inline">
          <input type="checkbox" checked={soPendentes} onChange={(e) => setSoPendentes(e.target.checked)} /> só não respondidas
        </label>
      </div>
      <h2 className="titulo-resolver">{titulo}</h2>

      {carregando ? (
        <Vazio>Carregando questões… 🦷</Vazio>
      ) : erro ? (
        <p className="aviso erro-form">{mensagemErro(erro)}</p>
      ) : !q ? (
        <Vazio>{dados?.length ? 'Você já respondeu todas as questões daqui! 🎉' : 'Nenhuma questão cadastrada aqui ainda.'}</Vazio>
      ) : (
        <>
          <div className="resolver-progresso">
            <span>
              Questão {i + 1} de {lista.length}
            </span>
            <Barra valor={i + 1} max={lista.length} rotulo="Progresso" />
            <span>
              {respondidas.length ? `${acertos}/${respondidas.length} · ${pct(acertos, respondidas.length)}% de acerto` : 'nenhuma respondida'}
            </span>
          </div>

          <article className="questao cartao">
            <header>
              <span className="tag">{nomeProva(q.prova)} · Q{q.numero}</span>
              <span className="tag tag-motivo">
                {areaEmoji(q.area_id)} {areaNome(q.area_id)}
              </span>
              {q.assunto && <span className="sub">{q.assunto}</span>}
              {q.anulada && <span className="tag prioridade-media">anulada</span>}
            </header>
            <p className="enunciado">{q.enunciado}</p>
            <ol className="alternativas">
              {q.alternativas.map((a) => {
                const estado = !resp
                  ? marcada === a.letra
                    ? 'marcada'
                    : ''
                  : a.letra === q.gabarito
                    ? 'certa'
                    : a.letra === resp.letra
                      ? 'errada'
                      : 'apagada'
                return (
                  <li key={a.letra}>
                    <button className={`alternativa ${estado}`} disabled={!!resp} onClick={() => setMarcada(a.letra)}>
                      <b>{a.letra}</b>
                      <span>{a.texto}</span>
                    </button>
                  </li>
                )
              })}
            </ol>

            {resp ? (
              <div className={`feedback ${resp.anulada ? '' : resp.correta ? 'ok' : 'nok'}`}>
                <strong>
                  {resp.anulada ? '⚠️ Questão anulada — não conta no seu acerto.' : resp.correta ? '💗 Acertou!' : `Resposta certa: ${q.gabarito}`}
                </strong>
                {q.comentario && <p>{q.comentario}</p>}
                <div className="linha">
                  {!resp.correta && !resp.anulada && (
                    <button className="btn-secundario" onClick={salvarErro} disabled={salvoNoCaderno[q.id]}>
                      {salvoNoCaderno[q.id] ? '✓ No caderno de erros' : '📒 Salvar no caderno de erros'}
                    </button>
                  )}
                  <button className="btn-texto" onClick={() => limparResposta(q.id)}>refazer</button>
                </div>
              </div>
            ) : (
              <button className="btn-primario" disabled={!marcada} onClick={() => responder(q, marcada)}>
                Responder
              </button>
            )}
          </article>

          <div className="barra-acoes">
            <button className="btn-secundario" onClick={() => ir(-1)} disabled={i === 0}>‹ Anterior</button>
            <button className="btn-secundario" onClick={() => ir(1)} disabled={i === lista.length - 1}>Próxima ›</button>
          </div>
        </>
      )}
    </>
  )
}

// ---------- Lista de provas ----------
export default function Provas() {
  const { data } = usePlanner()
  const [modo, setModo] = useState(null) // { filtro, titulo }
  const [areaTreino, setAreaTreino] = useState('')

  const provas = useConsulta(
    () => supabase.from('provas').select('*, questoes(id)').order('ano', { ascending: false }),
    [],
  )

  const porArea = useMemo(() => {
    const r = {}
    Object.values(data.respostas).forEach((x) => {
      if (x.anulada) return
      r[x.areaId] ??= { q: 0, a: 0 }
      r[x.areaId].q++
      if (x.correta) r[x.areaId].a++
    })
    return AREAS.filter((a) => r[a.id]).map((a) => ({ ...a, ...r[a.id] }))
  }, [data.respostas])

  if (modo) return <Resolver {...modo} onSair={() => setModo(null)} />

  const totalResp = porArea.reduce((n, a) => n + a.q, 0)
  const totalAc = porArea.reduce((n, a) => n + a.a, 0)

  return (
    <>
      <TituloPagina emoji="🗂️" titulo="Provas anteriores" frase="🌸 Quem treina com a banca chega no dia da prova em casa." />

      <div className="resumo-edital">
        <div className="cartao cartao-rosa">
          <strong>{totalResp}</strong>
          <span>questões respondidas</span>
        </div>
        <div className="cartao cartao-rosa">
          <strong>{totalResp ? `${pct(totalAc, totalResp)}%` : '—'}</strong>
          <span>de acerto nas provas</span>
        </div>
      </div>

      <Secao titulo="Treinar por área">
        <form
          className="linha-add"
          onSubmit={(e) => {
            e.preventDefault()
            if (areaTreino) setModo({ filtro: { areaId: areaTreino }, titulo: `${areaEmoji(areaTreino)} ${areaNome(areaTreino)}` })
          }}
        >
          <SelectArea value={areaTreino} onChange={setAreaTreino} />
          <button className="btn-primario" type="submit" disabled={!areaTreino}>Treinar</button>
        </form>
      </Secao>

      <Secao titulo="Provas">
        {provas.carregando ? (
          <Vazio>Carregando provas… 🦷</Vazio>
        ) : provas.erro ? (
          <p className="aviso erro-form">{mensagemErro(provas.erro)}</p>
        ) : !provas.dados.length ? (
          <Vazio>Nenhuma prova cadastrada ainda. Adicione pelo painel do Supabase. 📥</Vazio>
        ) : (
          <div className="cartoes-erros">
            {provas.dados.map((p) => {
              const ids = p.questoes.map((x) => x.id)
              const resp = ids.map((id) => data.respostas[id]).filter(Boolean)
              const validas = resp.filter((r) => !r.anulada)
              const ac = validas.filter((r) => r.correta).length
              return (
                <article key={p.id} className="erro prova">
                  <header>
                    <span className="tag">{p.exame}</span>
                    {p.banca && <span className="tag tag-motivo">{p.banca}</span>}
                  </header>
                  <h3>
                    {p.ano} · {p.programa}
                  </h3>
                  <Barra valor={resp.length} max={ids.length || 1} rotulo="Respondidas" />
                  <small className="sub">
                    {resp.length}/{ids.length} respondidas
                    {validas.length ? ` · ${pct(ac, validas.length)}% de acerto` : ''}
                  </small>
                  <footer>
                    <span className="links-prova">
                      {p.link_prova && <a href={p.link_prova} target="_blank" rel="noreferrer" className="link-suave">📄 prova</a>}
                      {p.link_gabarito && <a href={p.link_gabarito} target="_blank" rel="noreferrer" className="link-suave">✅ gabarito</a>}
                    </span>
                    <button
                      className="btn-primario"
                      disabled={!ids.length}
                      onClick={() => setModo({ filtro: { provaId: p.id }, titulo: `📝 ${nomeProva(p)}` })}
                    >
                      Resolver
                    </button>
                  </footer>
                </article>
              )
            })}
          </div>
        )}
      </Secao>

      {porArea.length > 0 && (
        <Secao titulo="Seu acerto por área (provas)">
          <ul className="barras-area">
            {porArea
              .sort((a, b) => pct(a.a, a.q) - pct(b.a, b.q))
              .map((a) => (
                <li key={a.id} title={`${a.nome}: ${a.a}/${a.q} questões`}>
                  <span className="ba-nome">
                    {a.emoji} {a.nome}
                  </span>
                  <span className="ba-trilho">
                    <span className="ba-barra" style={{ width: `${pct(a.a, a.q)}%` }} />
                  </span>
                  <span className="ba-valor">
                    {pct(a.a, a.q)}% <small>· {a.q} q.</small>
                  </span>
                </li>
              ))}
          </ul>
          <p className="aviso">Ordenado do menor para o maior acerto — as primeiras são as áreas que mais merecem atenção.</p>
        </Secao>
      )}
    </>
  )
}
