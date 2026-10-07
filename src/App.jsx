import { useEffect, useState } from 'react'
import { mmss, usePomodoro } from './pomodoro'
import { usePlanner } from './store'
import { todayISO } from './utils'
import Dashboard from './pages/Dashboard'
import Edital from './pages/Edital'
import Cronograma from './pages/Cronograma'
import Estudar from './pages/Estudar'
import Revisoes from './pages/Revisoes'
import Simulados from './pages/Simulados'
import Provas from './pages/Provas'
import Erros from './pages/Erros'
import Ajustes from './pages/Ajustes'

export const PAGINAS = [
  { id: 'inicio', nome: 'Início', emoji: '🏡', Comp: Dashboard },
  { id: 'edital', nome: 'Edital', emoji: '📚', Comp: Edital },
  { id: 'cronograma', nome: 'Cronograma', emoji: '🗓️', Comp: Cronograma },
  { id: 'estudar', nome: 'Estudar', emoji: '⏱️', Comp: Estudar },
  { id: 'revisoes', nome: 'Revisões', emoji: '🔁', Comp: Revisoes },
  { id: 'provas', nome: 'Provas', emoji: '🗂️', Comp: Provas },
  { id: 'simulados', nome: 'Simulados', emoji: '📝', Comp: Simulados },
  { id: 'erros', nome: 'Caderno de erros', emoji: '📒', Comp: Erros },
  { id: 'ajustes', nome: 'Ajustes', emoji: '⚙️', Comp: Ajustes },
]

const paginaAtual = () => {
  const id = window.location.hash.replace('#/', '')
  return PAGINAS.some((p) => p.id === id) ? id : 'inicio'
}

export const irPara = (id) => {
  window.location.hash = `#/${id}`
}

export default function App() {
  const [pagina, setPagina] = useState(paginaAtual)
  const { data } = usePlanner()
  const pomodoro = usePomodoro()

  useEffect(() => {
    const onHash = () => {
      setPagina(paginaAtual())
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const hoje = todayISO()
  const revisoesPendentes = data.revisoes.filter((r) => !r.feita && r.data <= hoje).length
  const { Comp } = PAGINAS.find((p) => p.id === pagina)

  return (
    <>
      <nav className="topnav" aria-label="Seções">
        {PAGINAS.map((p) => (
          <a key={p.id} href={`#/${p.id}`} className={p.id === pagina ? 'ativo' : ''}>
            <span aria-hidden>{p.emoji}</span> {p.nome}
            {p.id === 'revisoes' && revisoesPendentes > 0 && <span className="badge-num">{revisoesPendentes}</span>}
          </a>
        ))}
      </nav>

      <header className="banner">
        <span className="banner-script">meu planner</span>
        <span className="banner-flor" aria-hidden>🌸</span>
      </header>

      <main className="pagina">
        <Comp />
      </main>

      {pomodoro.rodando && pagina !== 'estudar' && (
        <button className="pomodoro-flutuante" onClick={() => irPara('estudar')} title="Abrir o pomodoro">
          {pomodoro.MODOS[pomodoro.modo].emoji} {mmss(pomodoro.segundos)}
        </button>
      )}

      <footer className="rodape">feito com 💗 para a futura residente · seus dados ficam salvos só neste navegador</footer>
    </>
  )
}
