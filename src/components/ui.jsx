import { useEffect, useState } from 'react'
import { AREAS } from '../data/edital'

export function TituloPagina({ emoji, titulo, frase }) {
  return (
    <>
      <h1 className="titulo-pagina">
        {emoji && <span className="titulo-emoji" aria-hidden>{emoji}</span>}
        {titulo}
      </h1>
      {frase && <div className="callout">{frase}</div>}
    </>
  )
}

export function Secao({ titulo, acao, children, className = '' }) {
  return (
    <section className={`secao ${className}`}>
      {titulo && (
        <div className="secao-topo">
          <h2>{titulo}</h2>
          {acao}
        </div>
      )}
      {children}
    </section>
  )
}

export function SelectArea({ value, onChange, vazio = 'Selecione a área', required }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} required={required}>
      <option value="">{vazio}</option>
      {AREAS.map((a) => (
        <option key={a.id} value={a.id}>
          {a.emoji} {a.nome}
        </option>
      ))}
    </select>
  )
}

export function Barra({ valor, max = 100, rotulo }) {
  const p = max ? Math.min(100, (valor / max) * 100) : 0
  return (
    <div className="barra" role="progressbar" aria-valuenow={Math.round(p)} aria-valuemin={0} aria-valuemax={100} aria-label={rotulo}>
      <div className="barra-preenchida" style={{ width: `${p}%` }} />
    </div>
  )
}

export function Anel({ valor, tamanho = 120, espessura = 10, children }) {
  const r = (tamanho - espessura) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="anel" style={{ width: tamanho, height: tamanho }}>
      <svg width={tamanho} height={tamanho} aria-hidden>
        <circle cx={tamanho / 2} cy={tamanho / 2} r={r} fill="none" stroke="var(--rosa)" strokeWidth={espessura} />
        <circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={r}
          fill="none"
          stroke="var(--rosa-forte)"
          strokeWidth={espessura}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(valor, 100) / 100)}
          transform={`rotate(-90 ${tamanho / 2} ${tamanho / 2})`}
          style={{ transition: 'stroke-dashoffset .6s ease' }}
        />
      </svg>
      <div className="anel-centro">{children}</div>
    </div>
  )
}

export function Relogio() {
  const [agora, setAgora] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setAgora(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const h = agora.getHours() % 12
  const m = agora.getMinutes()
  const s = agora.getSeconds()
  const ang = { h: h * 30 + m * 0.5, m: m * 6 + s * 0.1 }
  return (
    <div className="relogio">
      <svg viewBox="0 0 200 200" aria-hidden>
        {Array.from({ length: 12 }, (_, i) => (
          <line
            key={i}
            x1="100"
            y1={i % 3 === 0 ? 14 : 18}
            x2="100"
            y2="28"
            stroke="var(--texto)"
            strokeWidth={i % 3 === 0 ? 2.5 : 1.5}
            strokeLinecap="round"
            transform={`rotate(${i * 30} 100 100)`}
          />
        ))}
        <line x1="100" y1="100" x2="100" y2="56" stroke="var(--texto)" strokeWidth="3" strokeLinecap="round" transform={`rotate(${ang.h} 100 100)`} />
        <line x1="100" y1="100" x2="100" y2="36" stroke="var(--texto-suave)" strokeWidth="2" strokeLinecap="round" transform={`rotate(${ang.m} 100 100)`} />
        <circle cx="100" cy="100" r="4" fill="var(--rosa-forte)" />
      </svg>
      <div className="relogio-texto">
        <strong>{agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</strong>
        <span>{agora.toLocaleDateString('pt-BR', { weekday: 'long' })}</span>
      </div>
    </div>
  )
}

export function Vazio({ children }) {
  return <p className="vazio">{children}</p>
}
