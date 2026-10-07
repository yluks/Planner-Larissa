import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { usePlanner } from './store'
import { todayISO } from './utils'

const MODOS = {
  foco: { label: 'Foco', emoji: '📚' },
  pausa: { label: 'Pausa curta', emoji: '☕' },
  longa: { label: 'Pausa longa', emoji: '🌸' },
}

const bip = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    ;[0, 0.35, 0.7].forEach((t) => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      o.frequency.value = 880
      g.gain.setValueAtTime(0.0001, ctx.currentTime + t)
      g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + t + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.3)
      o.connect(g).connect(ctx.destination)
      o.start(ctx.currentTime + t)
      o.stop(ctx.currentTime + t + 0.32)
    })
  } catch {
    /* sem áudio, tudo bem */
  }
}

const PomodoroContext = createContext(null)

export function PomodoroProvider({ children }) {
  const { data, adicionar } = usePlanner()
  const duracoes = data.config.pomodoro
  const [modo, setModo] = useState('foco')
  const [fim, setFim] = useState(null) // timestamp quando rodando
  const [restante, setRestante] = useState(duracoes.foco * 60) // segundos
  const [areaId, setAreaId] = useState('')
  const [ciclos, setCiclos] = useState(0)
  const [, tick] = useState(0)
  const ref = useRef({})
  ref.current = { modo, areaId, ciclos, duracoes }

  const rodando = fim !== null
  const segundos = rodando ? Math.max(0, Math.ceil((fim - Date.now()) / 1000)) : restante

  const trocarModo = useCallback(
    (novo) => {
      setModo(novo)
      setFim(null)
      setRestante(duracoes[novo] * 60)
    },
    [duracoes],
  )

  // Atualiza o restante quando as durações mudam e o timer está parado
  useEffect(() => {
    if (!rodando) setRestante(duracoes[modo] * 60)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duracoes.foco, duracoes.pausa, duracoes.longa])

  useEffect(() => {
    if (!rodando) return
    const t = setInterval(() => {
      if (Date.now() < fim) return tick((n) => n + 1)
      clearInterval(t)
      const { modo: m, areaId: a, ciclos: c, duracoes: dur } = ref.current
      bip()
      if (m === 'foco') {
        adicionar('sessoes', {
          data: todayISO(),
          areaId: a,
          assunto: '',
          minutos: dur.foco,
          questoes: 0,
          acertos: 0,
          origem: 'pomodoro',
        })
        const n = c + 1
        setCiclos(n)
        const prox = n % 4 === 0 ? 'longa' : 'pausa'
        setModo(prox)
        setRestante(dur[prox] * 60)
        if ('Notification' in window && Notification.permission === 'granted')
          new Notification('Pomodoro concluído! 🌸', { body: 'Sessão registrada. Hora de uma pausa.' })
      } else {
        setModo('foco')
        setRestante(dur.foco * 60)
        if ('Notification' in window && Notification.permission === 'granted')
          new Notification('Pausa encerrada ☕', { body: 'Bora para o próximo foco!' })
      }
      setFim(null)
    }, 500)
    return () => clearInterval(t)
  }, [rodando, fim, adicionar])

  const iniciar = () => {
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission()
    setFim(Date.now() + segundos * 1000)
  }
  const pausar = () => {
    setRestante(segundos)
    setFim(null)
  }
  const reiniciar = () => {
    setFim(null)
    setRestante(duracoes[modo] * 60)
  }

  const value = {
    MODOS,
    modo,
    trocarModo,
    rodando,
    segundos,
    total: duracoes[modo] * 60,
    areaId,
    setAreaId,
    ciclos,
    iniciar,
    pausar,
    reiniciar,
  }
  return <PomodoroContext.Provider value={value}>{children}</PomodoroContext.Provider>
}

export const usePomodoro = () => useContext(PomodoroContext)

export const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
