import { useRef } from 'react'
import { Secao, TituloPagina } from '../components/ui'
import { usePlanner } from '../store'
import { todayISO } from '../utils'

export default function Ajustes() {
  const { data, set, importar, resetar } = usePlanner()
  const arquivo = useRef(null)
  const cfg = data.config
  const mudar = (k) => (e) => set('config', (c) => ({ ...c, [k]: e.target.value }))

  const exportar = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `planner-enare-backup-${todayISO()}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const aoImportar = async (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    try {
      const json = JSON.parse(await f.text())
      if (typeof json !== 'object' || !json.config) throw new Error('formato')
      if (confirm('Substituir todos os dados atuais pelo backup?')) importar(json)
    } catch {
      alert('Arquivo inválido. Use um backup exportado por este planner.')
    }
  }

  return (
    <>
      <TituloPagina emoji="⚙️" titulo="Ajustes" />

      <Secao titulo="Sobre você">
        <div className="form-grade">
          <label>
            Seu nome
            <input value={cfg.nome} onChange={mudar('nome')} placeholder="ex.: Ana" />
          </label>
          <label>
            Data da prova
            <input type="date" value={cfg.dataProva} onChange={mudar('dataProva')} />
          </label>
          <label>
            Meta de horas por semana
            <input type="number" min="0" value={cfg.metaHorasSemana} onChange={mudar('metaHorasSemana')} />
          </label>
        </div>
      </Secao>

      <Secao titulo="Backup">
        <p className="aviso">
          Seus dados ficam salvos apenas neste navegador. Exporte um backup de vez em quando — e use-o para levar o planner para outro
          computador.
        </p>
        <div className="barra-acoes">
          <div>
            <button className="btn-primario" onClick={exportar}>⬇️ Exportar backup</button>
            <button className="btn-secundario" onClick={() => arquivo.current.click()}>⬆️ Importar backup</button>
            <input ref={arquivo} type="file" accept="application/json" hidden onChange={aoImportar} />
          </div>
          <button
            className="btn-perigo"
            onClick={() => confirm('Apagar TODOS os dados do planner? Isso não pode ser desfeito.') && resetar()}
          >
            Apagar tudo
          </button>
        </div>
      </Secao>
    </>
  )
}
