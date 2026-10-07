import { useState } from 'react'
import { Secao, TituloPagina, Vazio } from '../components/ui'
import { TOPIC_BY_ID, areaEmoji, areaNome } from '../data/edital'
import { usePlanner } from '../store'
import { addDays, diffDays, formatBR, formatCurto, todayISO } from '../utils'

const ROTULO_ETAPA = { 1: '24 horas', 2: '7 dias', 3: '30 dias' }

function ItemRevisao({ r }) {
  const { concluirRevisao, atualizar, remover } = usePlanner()
  const hoje = todayISO()
  const t = TOPIC_BY_ID[r.topicoId]
  const atraso = diffDays(r.data, hoje)
  return (
    <li className={`revisao ${r.feita ? 'feita' : ''}`}>
      <label>
        <input type="checkbox" checked={r.feita} onChange={() => concluirRevisao(r.id)} />
        <span>
          <span className="revisao-titulo">{t?.nome ?? r.titulo}</span>
          <small className="sub">
            {t ? `${areaEmoji(t.areaId)} ${areaNome(t.areaId)} · ` : '📌 '}
            {r.etapa ? `R${r.etapa} (${ROTULO_ETAPA[r.etapa]})` : 'revisão avulsa'} · {formatCurto(r.data)}
            {!r.feita && atraso > 0 && <b className="atraso"> · {atraso} {atraso === 1 ? 'dia' : 'dias'} de atraso</b>}
          </small>
        </span>
      </label>
      {!r.feita && (
        <button className="btn-texto" onClick={() => atualizar('revisoes', r.id, { data: addDays(hoje, 1) })} title="Adiar para amanhã">
          adiar
        </button>
      )}
      {!r.topicoId && (
        <button className="btn-x" onClick={() => remover('revisoes', r.id)} aria-label="Excluir revisão">×</button>
      )}
    </li>
  )
}

export default function Revisoes() {
  const { data, adicionar } = usePlanner()
  const [titulo, setTitulo] = useState('')
  const [dia, setDia] = useState(todayISO())
  const hoje = todayISO()
  const ord = (a, b) => a.data.localeCompare(b.data)
  const grupos = [
    { id: 'atrasadas', titulo: '⏰ Atrasadas', itens: data.revisoes.filter((r) => !r.feita && r.data < hoje).sort(ord) },
    { id: 'hoje', titulo: '🌷 Para hoje', itens: data.revisoes.filter((r) => !r.feita && r.data === hoje) },
    { id: 'proximas', titulo: '📅 Próximos 7 dias', itens: data.revisoes.filter((r) => !r.feita && r.data > hoje && r.data <= addDays(hoje, 7)).sort(ord) },
    { id: 'depois', titulo: '🗂️ Mais adiante', itens: data.revisoes.filter((r) => !r.feita && r.data > addDays(hoje, 7)).sort(ord) },
  ]
  const feitas = data.revisoes.filter((r) => r.feita).sort((a, b) => (b.feitaEm ?? '').localeCompare(a.feitaEm ?? ''))

  return (
    <>
      <TituloPagina emoji="🔁" titulo="Revisões espaçadas" frase="🌸 Revisar é o que transforma estudo em memória." />
      <p className="aviso">
        Ao marcar <b>Teoria</b> em um assunto do edital, o planner agenda revisões em <b>24h</b>, <b>7 dias</b> e <b>30 dias</b>. Ao concluir a
        terceira, o assunto é marcado como revisado. Você também pode criar revisões avulsas (ex.: um resumo, um mapa mental).
      </p>

      <form
        className="linha-add cartao"
        onSubmit={(e) => {
          e.preventDefault()
          if (!titulo.trim()) return
          adicionar('revisoes', { titulo: titulo.trim(), data: dia, feita: false, etapa: 0, topicoId: null })
          setTitulo('')
        }}
      >
        <input placeholder="+ Revisão avulsa (ex.: mapa mental de anestésicos)" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        <input type="date" value={dia} onChange={(e) => setDia(e.target.value)} aria-label="Data da revisão" />
        <button className="btn-primario" type="submit">Adicionar</button>
      </form>

      <div className="grade-revisoes">
        {grupos.map((g) => (
          <Secao key={g.id} titulo={`${g.titulo} (${g.itens.length})`} className={`grupo-${g.id}`}>
            {g.itens.length ? (
              <ul className="lista-revisoes">
                {g.itens.map((r) => (
                  <ItemRevisao key={r.id} r={r} />
                ))}
              </ul>
            ) : (
              <Vazio>{g.id === 'atrasadas' ? 'Nada atrasado. Arrasou! 💗' : 'Nenhuma revisão aqui.'}</Vazio>
            )}
          </Secao>
        ))}
      </div>

      {feitas.length > 0 && (
        <details className="instrucoes">
          <summary>✅ Concluídas ({feitas.length})</summary>
          <ul className="lista-revisoes">
            {feitas.slice(0, 50).map((r) => (
              <ItemRevisao key={r.id} r={r} />
            ))}
          </ul>
          {feitas.length > 50 && <small className="sub">mostrando as 50 mais recentes · concluídas em {formatBR(feitas[49].feitaEm)} ou depois</small>}
        </details>
      )}
    </>
  )
}
