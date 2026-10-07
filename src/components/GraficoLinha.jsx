import { useState } from 'react'

// Gráfico de linha simples (uma série, 0–100%) com tooltip por ponto
export default function GraficoLinha({ pontos, altura = 220, rotuloY = '% de acerto' }) {
  const [hover, setHover] = useState(null)
  const largura = 640
  const m = { t: 16, r: 20, b: 34, l: 40 }
  const w = largura - m.l - m.r
  const h = altura - m.t - m.b
  const x = (i) => m.l + (pontos.length === 1 ? w / 2 : (i / (pontos.length - 1)) * w)
  const y = (v) => m.t + h - (v / 100) * h
  const caminho = pontos.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p.valor)}`).join(' ')
  const p = hover !== null ? pontos[hover] : null

  return (
    <div className="grafico">
      <svg viewBox={`0 0 ${largura} ${altura}`} role="img" aria-label={`${rotuloY} por simulado`}>
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line x1={m.l} x2={largura - m.r} y1={y(v)} y2={y(v)} className="grade" />
            <text x={m.l - 8} y={y(v) + 4} textAnchor="end" className="eixo">{v}%</text>
          </g>
        ))}
        {pontos.map((pt, i) => (
          <text key={i} x={x(i)} y={altura - 10} textAnchor="middle" className="eixo">{pt.rotulo}</text>
        ))}
        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={m.t} y2={m.t + h} className="mira" />}
        <path d={caminho} fill="none" stroke="var(--rosa-forte)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {pontos.map((pt, i) => (
          <circle key={i} cx={x(i)} cy={y(pt.valor)} r={hover === i ? 6 : 4.5} fill="var(--rosa-forte)" stroke="var(--superficie)" strokeWidth="2" />
        ))}
        {pontos.map((pt, i) => (
          <rect
            key={i}
            x={x(i) - Math.max(12, w / pontos.length / 2)}
            y={m.t}
            width={Math.max(24, w / pontos.length)}
            height={h}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>
      {p && (
        <div className="tooltip" style={{ left: `${(x(hover) / largura) * 100}%`, top: `${(y(p.valor) / altura) * 100}%` }}>
          <strong>{p.titulo}</strong>
          <span>{p.detalhe}</span>
        </div>
      )}
    </div>
  )
}
