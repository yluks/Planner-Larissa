export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)

const pad = (n) => String(n).padStart(2, '0')

export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const todayISO = () => toISO(new Date())
export const parseISO = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export const addDays = (iso, n) => {
  const d = parseISO(iso)
  d.setDate(d.getDate() + n)
  return toISO(d)
}
export const diffDays = (a, b) => Math.round((parseISO(b) - parseISO(a)) / 86400000)

export const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
export const DIAS_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
export const DIAS_SEMANA = [
  { id: 'seg', nome: 'Segunda', idx: 1 },
  { id: 'ter', nome: 'Terça', idx: 2 },
  { id: 'qua', nome: 'Quarta', idx: 3 },
  { id: 'qui', nome: 'Quinta', idx: 4 },
  { id: 'sex', nome: 'Sexta', idx: 5 },
  { id: 'sab', nome: 'Sábado', idx: 6 },
  { id: 'dom', nome: 'Domingo', idx: 0 },
]
export const diaSemanaId = (date = new Date()) => DIAS_SEMANA.find((d) => d.idx === date.getDay()).id

export const formatBR = (iso) => {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}
export const formatCurto = (iso) => {
  const d = parseISO(iso)
  return `${d.getDate()} ${MESES[d.getMonth()].slice(0, 3)}`
}

// Segunda-feira da semana de `iso`
export const inicioSemana = (iso = todayISO()) => {
  const d = parseISO(iso)
  const dow = (d.getDay() + 6) % 7
  return addDays(iso, -dow)
}

export const formatHoras = (min) => {
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  if (!h) return `${m} min`
  return m ? `${h}h${pad(m)}` : `${h}h`
}

export const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0)
