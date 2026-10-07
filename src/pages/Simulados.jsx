import { useState } from 'react'
import GraficoLinha from '../components/GraficoLinha'
import { Secao, TituloPagina, Vazio } from '../components/ui'
import { usePlanner } from '../store'
import { formatBR, formatCurto, pct, todayISO } from '../utils'

const vazio = () => ({ data: todayISO(), nome: '', total: '', acertos: '', obs: '' })

export default function Simulados() {
  const { data, adicionar, remover } = usePlanner()
  const [f, setF] = useState(vazio)
  const campo = (k) => ({ value: f[k], onChange: (e) => setF({ ...f, [k]: e.target.value }) })
  const invalido = Number(f.acertos) > Number(f.total)

  const lista = [...data.simulados].sort((a, b) => a.data.localeCompare(b.data))
  const pontos = lista.map((s, i) => ({
    rotulo: lista.length > 10 && i % 2 ? '' : formatCurto(s.data),
    valor: pct(s.acertos, s.total),
    titulo: s.nome,
    detalhe: `${s.acertos}/${s.total} · ${pct(s.acertos, s.total)}% · ${formatBR(s.data)}`,
  }))
  const media = lista.length ? Math.round(pontos.reduce((n, p) => n + p.valor, 0) / lista.length) : 0
  const melhor = lista.length ? Math.max(...pontos.map((p) => p.valor)) : 0
  const evolucao = lista.length > 1 ? pontos.at(-1).valor - pontos[0].valor : null

  return (
    <>
      <TituloPagina emoji="📝" titulo="Simulados" frase="🌸 Cada simulado é um ensaio para o grande dia." />

      <Secao titulo="Registrar simulado">
        <form
          className="form-grade"
          onSubmit={(e) => {
            e.preventDefault()
            if (invalido || !Number(f.total)) return
            adicionar('simulados', { ...f, nome: f.nome.trim() || 'Simulado', total: Number(f.total), acertos: Number(f.acertos || 0) })
            setF(vazio())
          }}
        >
          <label>
            Data
            <input type="date" required {...campo('data')} />
          </label>
          <label className="col-2">
            Nome / prova
            <input placeholder="ex.: ENARE 2024 — Odontologia" {...campo('nome')} />
          </label>
          <label>
            Total de questões
            <input type="number" min="1" required {...campo('total')} />
          </label>
          <label>
            Acertos
            <input type="number" min="0" required {...campo('acertos')} aria-invalid={invalido} />
          </label>
          <label className="col-2">
            Observações
            <input placeholder="tempo de prova, áreas em que mais errou…" {...campo('obs')} />
          </label>
          <button className="btn-primario" type="submit" disabled={invalido}>💗 Salvar</button>
          {invalido && <small className="erro-form">Acertos não podem passar do total.</small>}
        </form>
      </Secao>

      <div className="resumo-edital">
        <div className="cartao cartao-rosa">
          <strong>{lista.length}</strong>
          <span>simulados feitos</span>
        </div>
        <div className="cartao cartao-rosa">
          <strong>{lista.length ? `${media}%` : '—'}</strong>
          <span>média de acerto</span>
        </div>
        <div className="cartao cartao-rosa">
          <strong>{lista.length ? `${melhor}%` : '—'}</strong>
          <span>melhor resultado</span>
        </div>
        <div className="cartao cartao-rosa">
          <strong>{evolucao === null ? '—' : `${evolucao > 0 ? '+' : ''}${evolucao} p.p.`}</strong>
          <span>do primeiro ao último</span>
        </div>
      </div>

      <Secao titulo="Evolução do % de acerto">
        {lista.length ? <GraficoLinha pontos={pontos} /> : <Vazio>Registre seu primeiro simulado para ver o gráfico. 📈</Vazio>}
      </Secao>

      {lista.length > 0 && (
        <Secao titulo="Histórico">
          <div className="tabela-rolagem">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Simulado</th>
                  <th>Acertos</th>
                  <th>%</th>
                  <th>Observações</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {[...lista].reverse().map((s) => (
                  <tr key={s.id}>
                    <td>{formatBR(s.data)}</td>
                    <td>{s.nome}</td>
                    <td>
                      {s.acertos}/{s.total}
                    </td>
                    <td>
                      <b>{pct(s.acertos, s.total)}%</b>
                    </td>
                    <td className="sub">{s.obs}</td>
                    <td>
                      <button className="btn-x" onClick={() => confirm('Excluir este simulado?') && remover('simulados', s.id)} aria-label="Excluir simulado">
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Secao>
      )}
    </>
  )
}
