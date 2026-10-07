import { useMemo, useState } from 'react'
import { Anel, Secao, SelectArea, TituloPagina, Vazio } from '../components/ui'
import { areaEmoji, areaNome } from '../data/edital'
import { mmss, usePomodoro } from '../pomodoro'
import { usePlanner } from '../store'
import { formatBR, formatHoras, inicioSemana, pct, todayISO } from '../utils'

function Pomodoro() {
  const p = usePomodoro()
  const { data, set } = usePlanner()
  const dur = data.config.pomodoro
  return (
    <div className="pomodoro cartao cartao-rosa">
      <div className="pomodoro-modos" role="tablist">
        {Object.entries(p.MODOS).map(([id, m]) => (
          <button key={id} role="tab" aria-selected={p.modo === id} className={p.modo === id ? 'on' : ''} onClick={() => p.trocarModo(id)}>
            {m.emoji} {m.label}
          </button>
        ))}
      </div>
      <Anel valor={(1 - p.segundos / p.total) * 100} tamanho={200} espessura={12}>
        <strong className="pomodoro-tempo">{mmss(p.segundos)}</strong>
        <small>{p.MODOS[p.modo].label}</small>
      </Anel>
      <SelectArea value={p.areaId} onChange={p.setAreaId} vazio="Estudando qual área?" />
      <div className="pomodoro-botoes">
        {p.rodando ? (
          <button className="btn-primario" onClick={p.pausar}>⏸ Pausar</button>
        ) : (
          <button className="btn-primario" onClick={p.iniciar}>▶ Começar</button>
        )}
        <button className="btn-secundario" onClick={p.reiniciar}>↺ Reiniciar</button>
      </div>
      <small className="pomodoro-ciclos">
        🍅 {p.ciclos} {p.ciclos === 1 ? 'pomodoro concluído' : 'pomodoros concluídos'} nesta sessão · cada foco vira um registro automático
      </small>
      <details className="pomodoro-config">
        <summary>tempos</summary>
        <div className="linha">
          {[
            ['foco', 'Foco'],
            ['pausa', 'Pausa'],
            ['longa', 'Longa'],
          ].map(([k, l]) => (
            <label key={k}>
              {l}
              <input
                type="number"
                min="1"
                max="180"
                value={dur[k]}
                onChange={(e) => set('config', (c) => ({ ...c, pomodoro: { ...c.pomodoro, [k]: Math.max(1, Number(e.target.value) || 1) } }))}
              />
              min
            </label>
          ))}
        </div>
      </details>
    </div>
  )
}

const vazioForm = () => ({ data: todayISO(), areaId: '', assunto: '', minutos: '', questoes: '', acertos: '' })

function RegistroManual() {
  const { adicionar } = usePlanner()
  const [f, setF] = useState(vazioForm)
  const campo = (k) => ({ value: f[k], onChange: (e) => setF({ ...f, [k]: e.target.value }) })
  const invalido = Number(f.acertos) > Number(f.questoes)
  return (
    <form
      className="form-grade"
      onSubmit={(e) => {
        e.preventDefault()
        if (invalido) return
        adicionar('sessoes', {
          ...f,
          minutos: Number(f.minutos || 0),
          questoes: Number(f.questoes || 0),
          acertos: Number(f.acertos || 0),
          origem: 'manual',
        })
        setF(vazioForm())
      }}
    >
      <label>
        Data
        <input type="date" required {...campo('data')} />
      </label>
      <label>
        Área
        <SelectArea value={f.areaId} onChange={(v) => setF({ ...f, areaId: v })} required />
      </label>
      <label className="col-2">
        Assunto
        <input placeholder="ex.: Fraturas de mandíbula" {...campo('assunto')} />
      </label>
      <label>
        Tempo (min)
        <input type="number" min="0" {...campo('minutos')} />
      </label>
      <label>
        Questões feitas
        <input type="number" min="0" {...campo('questoes')} />
      </label>
      <label>
        Acertos
        <input type="number" min="0" {...campo('acertos')} aria-invalid={invalido} />
      </label>
      <button className="btn-primario" type="submit" disabled={invalido}>
        💗 Registrar sessão
      </button>
      {invalido && <small className="erro-form">Acertos não podem passar do número de questões.</small>}
    </form>
  )
}

export default function Estudar() {
  const { data, atualizar, remover } = usePlanner()
  const [filtro, setFiltro] = useState('semana')

  const sessoes = useMemo(() => {
    const ini = filtro === 'semana' ? inicioSemana() : filtro === 'mes' ? todayISO().slice(0, 8) + '01' : ''
    return data.sessoes.filter((s) => !ini || s.data >= ini).sort((a, b) => b.data.localeCompare(a.data))
  }, [data.sessoes, filtro])

  const porArea = useMemo(() => {
    const r = {}
    sessoes.forEach((s) => {
      const k = s.areaId || ''
      r[k] ??= { min: 0, q: 0, a: 0 }
      r[k].min += Number(s.minutos || 0)
      r[k].q += Number(s.questoes || 0)
      r[k].a += Number(s.acertos || 0)
    })
    return Object.entries(r).sort((a, b) => b[1].min - a[1].min)
  }, [sessoes])

  const tot = porArea.reduce((t, [, v]) => ({ min: t.min + v.min, q: t.q + v.q, a: t.a + v.a }), { min: 0, q: 0, a: 0 })
  const maxMin = Math.max(1, ...porArea.map(([, v]) => v.min))

  return (
    <>
      <TituloPagina emoji="⏱️" titulo="Hora de estudar" frase="🌸 Aprenda, cresça, brilhe. Você consegue! ✨" />

      <div className="estudar-grade">
        <Pomodoro />
        <Secao titulo="Registrar sessão manualmente">
          <RegistroManual />
          <p className="aviso">Dica: depois de um bloco de questões, edite o pomodoro registrado para incluir questões e acertos.</p>
        </Secao>
      </div>

      <div className="filtros">
        {[
          ['semana', 'Esta semana'],
          ['mes', 'Este mês'],
          ['tudo', 'Tudo'],
        ].map(([id, l]) => (
          <button key={id} className={`pilula ${filtro === id ? 'on' : ''}`} onClick={() => setFiltro(id)}>
            {l}
          </button>
        ))}
      </div>

      <div className="resumo-edital">
        <div className="cartao cartao-rosa">
          <strong>{formatHoras(tot.min)}</strong>
          <span>tempo de estudo</span>
        </div>
        <div className="cartao cartao-rosa">
          <strong>{tot.q}</strong>
          <span>questões resolvidas</span>
        </div>
        <div className="cartao cartao-rosa">
          <strong>{tot.q ? `${pct(tot.a, tot.q)}%` : '—'}</strong>
          <span>de acerto geral</span>
        </div>
      </div>

      <div className="estudar-grade">
        <Secao titulo="Tempo por área">
          {porArea.length ? (
            <ul className="barras-area">
              {porArea.map(([id, v]) => (
                <li key={id} title={`${areaNome(id)}: ${formatHoras(v.min)}${v.q ? ` · ${pct(v.a, v.q)}% de acerto em ${v.q} questões` : ''}`}>
                  <span className="ba-nome">
                    {areaEmoji(id)} {areaNome(id)}
                  </span>
                  <span className="ba-trilho">
                    <span className="ba-barra" style={{ width: `${(v.min / maxMin) * 100}%` }} />
                  </span>
                  <span className="ba-valor">
                    {formatHoras(v.min)}
                    {v.q > 0 && <small> · {pct(v.a, v.q)}%</small>}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Vazio>Nenhuma sessão neste período ainda.</Vazio>
          )}
        </Secao>

        <Secao titulo="Sessões de estudo">
          {sessoes.length ? (
            <div className="tabela-rolagem">
              <table className="tabela">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Área / assunto</th>
                    <th>Tempo</th>
                    <th>Questões</th>
                    <th>Acertos</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {sessoes.map((s) => (
                    <tr key={s.id}>
                      <td>{formatBR(s.data)}</td>
                      <td>
                        {areaEmoji(s.areaId)} {areaNome(s.areaId)}
                        {s.assunto && <small className="sub">{s.assunto}</small>}
                        {s.origem === 'pomodoro' && <small className="sub">🍅 pomodoro</small>}
                      </td>
                      <td>{formatHoras(s.minutos)}</td>
                      <td>
                        <input
                          className="input-mini"
                          type="number"
                          min="0"
                          value={s.questoes}
                          onChange={(e) => atualizar('sessoes', s.id, { questoes: Number(e.target.value) })}
                          aria-label="Questões"
                        />
                      </td>
                      <td>
                        <input
                          className="input-mini"
                          type="number"
                          min="0"
                          max={s.questoes}
                          value={s.acertos}
                          onChange={(e) => atualizar('sessoes', s.id, { acertos: Math.min(Number(e.target.value), Number(s.questoes)) })}
                          aria-label="Acertos"
                        />
                      </td>
                      <td>
                        <button className="btn-x" onClick={() => confirm('Excluir esta sessão?') && remover('sessoes', s.id)} aria-label="Excluir sessão">
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Vazio>Comece um pomodoro ou registre uma sessão. 🍅</Vazio>
          )}
        </Secao>
      </div>
    </>
  )
}
