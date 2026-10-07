import { useState } from 'react'
import { SelectArea, TituloPagina } from '../components/ui'
import { AREAS, areaEmoji, areaNome } from '../data/edital'
import { usePlanner } from '../store'
import { DIAS_SEMANA, diaSemanaId, uid } from '../utils'

const ICONES = { seg: '🌷', ter: '🌸', qua: '🌼', qui: '🌺', sex: '💐', sab: '🌻', dom: '🍃' }

// Distribui as áreas pela semana: alta prioridade recebe mais tempo, as de baixa vão para o sábado
// junto com o simulado, e domingo é descanso com revisões leves.
function sugerirSemana() {
  const bloco = (a) => ({
    id: uid(),
    areaId: a.id,
    horas: a.prioridade === 'alta' ? '2' : a.prioridade === 'media' ? '1.5' : '1',
    obs: a.prioridade === 'alta' ? 'Teoria + 20 questões' : 'Teoria + 10 questões',
  })
  const fila = AREAS.filter((a) => a.prioridade !== 'baixa')
  const baixas = AREAS.filter((a) => a.prioridade === 'baixa')
  const uteis = ['seg', 'ter', 'qua', 'qui', 'sex']
  const semana = { seg: [], ter: [], qua: [], qui: [], sex: [], sab: [], dom: [] }
  // round-robin para que cada dia misture áreas de prioridade alta e média
  fila.forEach((a, i) => semana[uteis[i % uteis.length]].push(bloco(a)))
  semana.sab = [
    ...baixas.map(bloco),
    { id: uid(), areaId: '', horas: '3', obs: 'Simulado / bloco misto de questões + caderno de erros' },
  ]
  semana.dom = [{ id: uid(), areaId: '', horas: '', obs: 'Descanso 💆‍♀️ + revisões pendentes leves' }]
  return semana
}

function NovoBloco({ onAdd }) {
  const [areaId, setAreaId] = useState('')
  const [horas, setHoras] = useState('')
  const [obs, setObs] = useState('')
  return (
    <form
      className="novo-bloco"
      onSubmit={(e) => {
        e.preventDefault()
        if (!areaId && !obs.trim()) return
        onAdd({ id: uid(), areaId, horas, obs: obs.trim() })
        setAreaId('')
        setHoras('')
        setObs('')
      }}
    >
      <SelectArea value={areaId} onChange={setAreaId} vazio="Área (opcional)" />
      <div className="linha">
        <input type="number" min="0" step="0.5" placeholder="horas" value={horas} onChange={(e) => setHoras(e.target.value)} />
        <input placeholder="O que fazer?" value={obs} onChange={(e) => setObs(e.target.value)} />
        <button className="btn-primario" type="submit" aria-label="Adicionar">+</button>
      </div>
    </form>
  )
}

export default function Cronograma() {
  const { data, set } = usePlanner()
  const hojeId = diaSemanaId()
  const totalSemana = Object.values(data.cronograma)
    .flat()
    .reduce((n, b) => n + Number(b.horas || 0), 0)

  const mudarDia = (dia, fn) => set('cronograma', (c) => ({ ...c, [dia]: fn(c[dia] ?? []) }))

  const gerar = () => {
    const temAlgo = Object.values(data.cronograma).some((d) => d.length)
    if (temAlgo && !confirm('Isso vai substituir o cronograma atual por uma sugestão. Continuar?')) return
    set('cronograma', sugerirSemana())
  }

  return (
    <>
      <TituloPagina emoji="🗓️" titulo="Cronograma semanal" frase="🌸 Faça de hoje sua obra-prima, um assunto de cada vez. 🌸" />

      <div className="barra-acoes">
        <span>
          Planejado: <b>{totalSemana.toLocaleString('pt-BR')}h</b> por semana
          {data.config.metaHorasSemana ? ` · meta ${data.config.metaHorasSemana}h` : ''}
        </span>
        <div>
          <button className="btn-secundario" onClick={gerar}>✨ Gerar sugestão</button>
          <button
            className="btn-texto"
            onClick={() =>
              confirm('Limpar todo o cronograma?') &&
              set('cronograma', { seg: [], ter: [], qua: [], qui: [], sex: [], sab: [], dom: [] })
            }
          >
            limpar
          </button>
        </div>
      </div>

      <div className="galeria-dias">
        {DIAS_SEMANA.map((d) => {
          const blocos = data.cronograma[d.id] ?? []
          const horas = blocos.reduce((n, b) => n + Number(b.horas || 0), 0)
          const areas = [...new Set(blocos.map((b) => b.areaId).filter(Boolean))]
          return (
            <article key={d.id} className={`dia ${d.id === hojeId ? 'dia-hoje' : ''}`}>
              <header>
                <span aria-hidden>{ICONES[d.id]}</span> {d.nome}
                {d.id === hojeId && <span className="tag tag-hoje">hoje</span>}
                {horas > 0 && <span className="dia-horas">{horas.toLocaleString('pt-BR')}h</span>}
              </header>
              {areas.length > 0 && (
                <div className="tags">
                  {areas.map((a) => (
                    <span key={a} className="tag">{areaNome(a)}</span>
                  ))}
                </div>
              )}
              <ul className="blocos">
                {blocos.map((b) => (
                  <li key={b.id}>
                    <span>
                      {b.areaId && <b>{areaEmoji(b.areaId)} </b>}
                      {b.horas && <b>{b.horas}h · </b>}
                      {b.obs || areaNome(b.areaId)}
                    </span>
                    <button className="btn-x" onClick={() => mudarDia(d.id, (l) => l.filter((x) => x.id !== b.id))} aria-label="Remover bloco">
                      ×
                    </button>
                  </li>
                ))}
              </ul>
              <NovoBloco onAdd={(b) => mudarDia(d.id, (l) => [...l, b])} />
            </article>
          )
        })}
      </div>
    </>
  )
}
