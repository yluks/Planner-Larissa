#!/usr/bin/env node
// Importa provas e questões de um CSV (ou JSON) para o Supabase.
//
//   npm run importar -- caminho/arquivo.csv            (simulação: valida e mostra o resumo)
//   npm run importar -- caminho/arquivo.csv --enviar   (grava no banco)
//
// Usa SUPABASE_SECRET_KEY do .env — essa chave fica SÓ na sua máquina, nunca com prefixo VITE_.
// Reimportar o mesmo arquivo atualiza as questões (chave: exame + ano + programa + número).

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import { AREAS } from '../src/data/edital.js'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// ---------- env ----------
function carregarEnv() {
  const env = {}
  for (const nome of ['.env', '.env.local']) {
    const arq = path.join(raiz, nome)
    if (!fs.existsSync(arq)) continue
    for (const linha of fs.readFileSync(arq, 'utf8').split(/\r?\n/)) {
      const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
      if (m) env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2')
    }
  }
  return { ...env, ...process.env }
}

// ---------- CSV (aceita ; ou , , aspas e quebras de linha dentro de campos) ----------
function lerCSV(texto) {
  texto = texto.replace(/^\uFEFF/, '')
  const primeira = texto.split('\n')[0]
  const sep = (primeira.match(/;/g) ?? []).length >= (primeira.match(/,/g) ?? []).length ? ';' : ','
  const linhas = []
  let campo = ''
  let linha = []
  let aspas = false
  let numLinha = 1
  let inicioLinha = 1
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i]
    if (aspas) {
      if (c === '"' && texto[i + 1] === '"') {
        campo += '"'
        i++
      } else if (c === '"') aspas = false
      else {
        if (c === '\n') numLinha++
        campo += c
      }
    } else if (c === '"') aspas = true
    else if (c === sep) {
      linha.push(campo)
      campo = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && texto[i + 1] === '\n') i++
      linha.push(campo)
      linhas.push({ linha, num: inicioLinha })
      linha = []
      campo = ''
      numLinha++
      inicioLinha = numLinha
    } else campo += c
  }
  if (campo || linha.length) {
    linha.push(campo)
    linhas.push({ linha, num: inicioLinha })
  }
  const naoVazias = linhas.filter((l) => l.linha.some((v) => v.trim()))
  const [cab, ...resto] = naoVazias
  const chaves = cab.linha.map((h) => normalizar(h))
  return resto.map(({ linha: l, num }) => ({ num, dados: Object.fromEntries(chaves.map((k, i) => [k, (l[i] ?? '').trim()])) }))
}

function lerJSON(texto) {
  const arr = JSON.parse(texto)
  if (!Array.isArray(arr)) throw new Error('O JSON precisa ser uma lista de questões.')
  return arr.map((o, i) => ({
    num: i + 1,
    dados: Object.fromEntries(Object.entries(o).map(([k, v]) => [normalizar(k), typeof v === 'string' ? v.trim() : v])),
  }))
}

// ---------- validação ----------
const normalizar = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()

const LETRAS = ['A', 'B', 'C', 'D', 'E']
const SIM = new Set(['sim', 's', 'x', 'true', '1', 'yes'])

function acharArea(valor) {
  const v = normalizar(valor)
  if (!v) return null
  return (
    AREAS.find((a) => a.id === v) ??
    AREAS.find((a) => normalizar(a.nome) === v) ??
    AREAS.find((a) => normalizar(a.nome).includes(v)) ??
    // todas as palavras digitadas aparecem no nome (ex.: "cirurgia bucomaxilo", "patologia oral")
    AREAS.find((a) => {
      const nome = normalizar(a.nome)
      return v.split(/\s+/).every((p) => p.length > 2 && nome.includes(p))
    }) ??
    null
  )
}

function validar(registros) {
  const erros = []
  const questoes = []
  const vistos = new Set()
  for (const { num, dados: d } of registros) {
    const err = (msg) => erros.push(`linha ${num}: ${msg}`)
    const ano = Number(d.ano)
    const numero = Number(d.numero ?? d.questao ?? d.n)
    const area = acharArea(d.area)
    const alternativas = LETRAS.filter((l) => d[l.toLowerCase()]).map((l) => ({ letra: l, texto: d[l.toLowerCase()] }))
    const gabarito = String(d.gabarito ?? '').toUpperCase().trim()
    const anulada = SIM.has(normalizar(d.anulada))
    const exame = d.exame || 'ENARE'
    const programa = d.programa || 'Odontologia'

    if (!Number.isInteger(ano) || ano < 2000 || ano > 2100) err(`ano inválido ("${d.ano ?? ''}")`)
    if (!Number.isInteger(numero) || numero < 1) err(`número da questão inválido ("${d.numero ?? ''}")`)
    if (!area) err(`área não reconhecida ("${d.area ?? ''}") — use um destes códigos: ${AREAS.map((a) => a.id).join(', ')}`)
    if (!d.enunciado) err('enunciado vazio')
    if (alternativas.length < 2) err('precisa de pelo menos 2 alternativas (colunas A, B, C, D, E)')
    if (!anulada && !LETRAS.includes(gabarito)) err(`gabarito inválido ("${d.gabarito ?? ''}") — use A a E, ou marque anulada = sim`)
    if (gabarito && LETRAS.includes(gabarito) && !alternativas.some((a) => a.letra === gabarito))
      err(`gabarito ${gabarito} aponta para uma alternativa vazia`)

    const chave = `${normalizar(exame)}|${ano}|${normalizar(programa)}|${numero}`
    if (vistos.has(chave)) err(`questão ${numero} de ${exame} ${ano} aparece repetida no arquivo`)
    vistos.add(chave)

    questoes.push({
      prova: {
        exame,
        ano,
        programa,
        banca: d.banca || null,
        link_prova: d.link_prova || null,
        link_gabarito: d.link_gabarito || null,
      },
      numero,
      area_id: area?.id,
      assunto: d.assunto || null,
      enunciado: d.enunciado,
      alternativas,
      gabarito: LETRAS.includes(gabarito) ? gabarito : null,
      anulada,
      comentario: d.comentario || null,
    })
  }
  return { erros, questoes }
}

// ---------- principal ----------
async function main() {
  const args = process.argv.slice(2)
  const arquivo = args.find((a) => !a.startsWith('--'))
  const enviar = args.includes('--enviar')
  if (!arquivo) {
    console.log('Uso: npm run importar -- arquivo.csv [--enviar]\nModelo: scripts/modelo-questoes.csv')
    process.exit(1)
  }

  const texto = fs.readFileSync(path.resolve(arquivo), 'utf8')
  const registros = arquivo.toLowerCase().endsWith('.json') ? lerJSON(texto) : lerCSV(texto)
  const { erros, questoes } = validar(registros)

  if (erros.length) {
    console.error(`\n❌ ${erros.length} problema(s) encontrados — nada foi enviado:\n`)
    erros.slice(0, 50).forEach((e) => console.error('  • ' + e))
    if (erros.length > 50) console.error(`  … e mais ${erros.length - 50}`)
    process.exit(1)
  }

  // agrupa por prova
  const provas = new Map()
  for (const q of questoes) {
    const k = `${q.prova.exame}|${q.prova.ano}|${q.prova.programa}`
    if (!provas.has(k)) provas.set(k, { ...q.prova, questoes: [] })
    const p = provas.get(k)
    for (const campo of ['banca', 'link_prova', 'link_gabarito']) p[campo] ??= q.prova[campo]
    p.questoes.push(q)
  }

  console.log(`\n✅ ${questoes.length} questões válidas em ${provas.size} prova(s):`)
  for (const p of provas.values()) {
    const porArea = {}
    p.questoes.forEach((q) => (porArea[q.area_id] = (porArea[q.area_id] ?? 0) + 1))
    const anuladas = p.questoes.filter((q) => q.anulada).length
    console.log(`\n  📝 ${p.exame} ${p.ano} · ${p.programa} — ${p.questoes.length} questões${anuladas ? ` (${anuladas} anuladas)` : ''}`)
    Object.entries(porArea)
      .sort((a, b) => b[1] - a[1])
      .forEach(([a, n]) => console.log(`     ${String(n).padStart(3)}  ${AREAS.find((x) => x.id === a).nome}`))
  }

  if (!enviar) {
    console.log('\nℹ️  Simulação — nada foi gravado. Rode de novo com --enviar para gravar no Supabase.\n')
    return
  }

  const env = carregarEnv()
  const url = env.VITE_SUPABASE_URL
  const chave = env.SUPABASE_SECRET_KEY
  if (!url || !chave) {
    console.error('\n❌ Faltam VITE_SUPABASE_URL e/ou SUPABASE_SECRET_KEY no .env')
    process.exit(1)
  }
  const db = createClient(url, chave, { auth: { persistSession: false } })

  for (const p of provas.values()) {
    const { questoes: qs, ...dadosProva } = p
    const { data: prova, error: e1 } = await db
      .from('provas')
      .upsert({ ...dadosProva, total_questoes: qs.length }, { onConflict: 'exame,ano,programa' })
      .select('id')
      .single()
    if (e1) throw new Error(`Erro ao salvar a prova ${p.exame} ${p.ano}: ${e1.message}`)

    const linhas = qs.map(({ prova: _, ...q }) => ({ ...q, prova_id: prova.id }))
    for (let i = 0; i < linhas.length; i += 200) {
      const { error: e2 } = await db.from('questoes').upsert(linhas.slice(i, i + 200), { onConflict: 'prova_id,numero' })
      if (e2) throw new Error(`Erro ao salvar questões de ${p.exame} ${p.ano}: ${e2.message}`)
    }
    console.log(`  💾 ${p.exame} ${p.ano} gravada (${qs.length} questões)`)
  }
  console.log('\n🌸 Importação concluída!\n')
}

main().catch((e) => {
  console.error('\n❌ ' + e.message)
  process.exit(1)
})
