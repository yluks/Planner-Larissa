import { useMemo, useState } from 'react'
import { Secao, SelectArea, TituloPagina, Vazio } from '../components/ui'
import { areaEmoji, areaNome } from '../data/edital'
import { usePlanner } from '../store'
import { formatBR, todayISO } from '../utils'

const MOTIVOS = {
  conteudo: { label: 'Não sabia o conteúdo', emoji: '📖' },
  atencao: { label: 'Falta de atenção', emoji: '👀' },
  interpretacao: { label: 'Interpretei errado', emoji: '🤔' },
  chute: { label: 'Chutei / dúvida entre duas', emoji: '🎲' },
}

const vazio = () => ({ areaId: '', assunto: '', questao: '', motivo: 'conteudo', aprendizado: '', fonte: '' })

export default function Erros() {
  const { data, adicionar, atualizar, remover } = usePlanner()
  const [f, setF] = useState(vazio)
  const [filtroArea, setFiltroArea] = useState('')
  const [soPendentes, setSoPendentes] = useState(false)
  const [aberto, setAberto] = useState(data.erros.length === 0)
  const campo = (k) => ({ value: f[k], onChange: (e) => setF({ ...f, [k]: e.target.value }) })

  const lista = data.erros
    .filter((e) => (!filtroArea || e.areaId === filtroArea) && (!soPendentes || !e.revisado))
    .sort((a, b) => b.data.localeCompare(a.data))

  const porMotivo = useMemo(() => {
    const r = Object.fromEntries(Object.keys(MOTIVOS).map((k) => [k, 0]))
    data.erros.forEach((e) => r[e.motivo]++)
    return r
  }, [data.erros])

  return (
    <>
      <TituloPagina emoji="📒" titulo="Caderno de erros" frase="🌸 Errar no treino é acertar na prova." />

      <div className="resumo-edital">
        {Object.entries(MOTIVOS).map(([k, m]) => (
          <div key={k} className="cartao cartao-rosa">
            <strong>
              {m.emoji} {porMotivo[k]}
            </strong>
            <span>{m.label}</span>
          </div>
        ))}
      </div>

      <details className="instrucoes" open={aberto} onToggle={(e) => setAberto(e.currentTarget.open)}>
        <summary>✏️ Anotar novo erro</summary>
        <form
          className="form-grade"
          onSubmit={(e) => {
            e.preventDefault()
            if (!f.aprendizado.trim() && !f.questao.trim()) return
            adicionar('erros', { ...f, data: todayISO(), revisado: false })
            setF(vazio())
          }}
        >
          <label>
            Área
            <SelectArea value={f.areaId} onChange={(v) => setF({ ...f, areaId: v })} required />
          </label>
          <label>
            Assunto
            <input placeholder="ex.: doses máximas de lidocaína" {...campo('assunto')} />
          </label>
          <label>
            Fonte
            <input placeholder="ex.: ENARE 2023, Q42" {...campo('fonte')} />
          </label>
          <label>
            Por que errei?
            <select {...campo('motivo')}>
              {Object.entries(MOTIVOS).map(([k, m]) => (
                <option key={k} value={k}>
                  {m.emoji} {m.label}
                </option>
              ))}
            </select>
          </label>
          <label className="col-full">
            Questão (resumo do enunciado)
            <textarea rows={2} {...campo('questao')} />
          </label>
          <label className="col-full">
            O que eu aprendi / resposta certa
            <textarea rows={2} placeholder="Escreva de um jeito que você entenda daqui a 30 dias 💡" {...campo('aprendizado')} />
          </label>
          <button className="btn-primario" type="submit">💗 Salvar erro</button>
        </form>
      </details>

      <div className="filtros">
        <SelectArea value={filtroArea} onChange={setFiltroArea} vazio="Todas as áreas" />
        <label className="check-inline">
          <input type="checkbox" checked={soPendentes} onChange={(e) => setSoPendentes(e.target.checked)} /> só não revisados
        </label>
      </div>

      <Secao>
        {lista.length ? (
          <div className="cartoes-erros">
            {lista.map((e) => (
              <article key={e.id} className={`erro ${e.revisado ? 'revisado' : ''}`}>
                <header>
                  <span className="tag">
                    {areaEmoji(e.areaId)} {areaNome(e.areaId)}
                  </span>
                  <span className="tag tag-motivo">
                    {MOTIVOS[e.motivo]?.emoji} {MOTIVOS[e.motivo]?.label}
                  </span>
                </header>
                {e.assunto && <h3>{e.assunto}</h3>}
                {e.questao && <p className="erro-questao">{e.questao}</p>}
                {e.aprendizado && <p className="erro-aprendizado">💡 {e.aprendizado}</p>}
                <footer>
                  <small className="sub">
                    {formatBR(e.data)}
                    {e.fonte ? ` · ${e.fonte}` : ''}
                  </small>
                  <label className="check-inline">
                    <input type="checkbox" checked={e.revisado} onChange={() => atualizar('erros', e.id, { revisado: !e.revisado })} /> revisado
                  </label>
                  <button className="btn-x" onClick={() => confirm('Excluir este erro?') && remover('erros', e.id)} aria-label="Excluir">
                    ×
                  </button>
                </footer>
              </article>
            ))}
          </div>
        ) : (
          <Vazio>{data.erros.length ? 'Nenhum erro com esses filtros.' : 'Seu caderno ainda está em branco. Anote o primeiro erro de um simulado! ✏️'}</Vazio>
        )}
      </Secao>
    </>
  )
}
