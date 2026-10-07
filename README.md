# meu planner · ENARE Odonto 🦷🌸

Planejador de estudos para a Residência em Odontologia (ENARE), em React + Vite.
Os dados ficam no `localStorage` do navegador (há exportar/importar backup em **Ajustes**).

Copie `.env.example` para `.env.local` e preencha a URL e a publishable key do Supabase (banco de provas).

```bash
npm install
npm run dev   # http://localhost:5180
```

## Seções
- **Início** — relógio, contagem regressiva para a prova, plano do dia, revisões pendentes, calendário, lembretes, afirmações, notas e hábitos da semana.
- **Edital** — áreas e assuntos mais recorrentes com prioridade estimada; marque Teoria / Questões / Revisado.
- **Cronograma** — semana em cartões, com gerador de sugestão por prioridade.
- **Estudar** — pomodoro (cada foco vira uma sessão registrada) + registro manual, tempo e % de acerto por área.
- **Revisões** — revisões espaçadas (24h, 7 e 30 dias) criadas automaticamente ao marcar “Teoria”.
- **Provas** — banco de provas anteriores no Supabase (tabelas em `supabase/migrations`); resolve questão a questão, com correção na hora, acerto por área e envio para o caderno de erros. As respostas ficam no navegador.
- **Simulados** — histórico e gráfico de evolução do % de acerto.
- **Caderno de erros** — questões erradas, motivo do erro e o que foi aprendido.

O conteúdo do edital está em `src/data/edital.js` — ajuste conforme o edital oficial do ano.

## Importar questões para o banco de provas

1. Preencha uma planilha seguindo `scripts/modelo-questoes.csv` (no Excel: *Salvar como → CSV UTF-8*).
   - Obrigatórias: `ano`, `numero`, `area`, `enunciado`, alternativas `A`…`E` (mín. 2) e `gabarito` (ou `anulada` = sim).
   - Opcionais: `exame` (padrão ENARE), `programa` (padrão Odontologia), `banca`, `assunto`, `comentario`, `link_prova`, `link_gabarito`.
   - `area` aceita o código (`cirurgia`, `estomato`, `sus`…) ou parte do nome ("patologia oral").
2. Simule (só valida e mostra o resumo):
   ```bash
   npm run importar -- caminho/planilha.csv
   ```
3. Grave no Supabase:
   ```bash
   npm run importar -- caminho/planilha.csv --enviar
   ```

O script usa `SUPABASE_SECRET_KEY` do `.env` — **nunca** dê prefixo `VITE_` a essa chave (tudo com `VITE_` vai para o navegador).
Reimportar o mesmo arquivo atualiza as questões em vez de duplicar.
