// Conteúdo programático mais recorrente nas provas de Residência em Odontologia (ENARE e similares).
// A "prioridade" é uma estimativa de recorrência — sempre confira o edital vigente.

const area = (id, nome, emoji, prioridade, topicos) => ({
  id,
  nome,
  emoji,
  prioridade,
  topicos: topicos.map((t, i) => ({ id: `${id}-${i + 1}`, nome: t })),
})

export const AREAS = [
  area('sus', 'SUS e Políticas de Saúde', '🏛️', 'alta', [
    'Constituição Federal de 1988 — arts. 196 a 200',
    'Lei 8.080/1990 — princípios, diretrizes e organização do SUS',
    'Lei 8.142/1990 — participação da comunidade e financiamento',
    'Decreto 7.508/2011 — Regiões de Saúde, RAS e COAP',
    'Política Nacional de Atenção Básica (PNAB 2017)',
    'Redes de Atenção à Saúde (Portaria 4.279/2010)',
    'Política Nacional de Humanização (HumanizaSUS)',
    'Controle social: conselhos e conferências de saúde',
    'Vigilância em saúde e notificação compulsória',
    'Financiamento da APS e pactuação interfederativa',
  ]),
  area('coletiva', 'Saúde Bucal Coletiva e Epidemiologia', '📊', 'alta', [
    'Política Nacional de Saúde Bucal — Brasil Sorridente (Lei 14.572/2023)',
    'CEO, LRPD e organização da rede de saúde bucal',
    'Equipe de Saúde Bucal na ESF — atribuições do CD, TSB e ASB',
    'Levantamentos SB Brasil — metodologia e principais resultados',
    'Índices: CPO-D, ceo-d, CPI/PSR, Dean, DAI, IHO-S',
    'Fluoretação das águas e uso tópico de fluoretos',
    'Indicadores de saúde bucal',
    'Epidemiologia: tipos de estudo, medidas de frequência e vieses',
    'Testes diagnósticos: sensibilidade, especificidade, VPP e VPN',
    'Promoção e educação em saúde bucal',
  ]),
  area('biosseg', 'Biossegurança e Controle de Infecção', '🧤', 'alta', [
    'Precauções padrão e uso de EPIs',
    'Classificação de Spaulding (críticos, semicríticos, não críticos)',
    'Processamento de artigos — limpeza, esterilização e monitoramento (RDC 15/2012)',
    'Gerenciamento de resíduos de serviços de saúde (RDC 222/2018)',
    'Acidente com material biológico e profilaxia pós-exposição',
    'Imunização do profissional de saúde',
  ]),
  area('etica', 'Ética, Legislação e Odontologia Legal', '⚖️', 'media', [
    'Código de Ética Odontológica (Res. CFO 118/2012)',
    'Lei 5.081/1966 — exercício da Odontologia',
    'Prontuário, documentação clínica e TCLE',
    'Responsabilidade profissional e perícia',
    'Identificação humana pela Odontologia',
    'Bioética: princípios e aplicação clínica',
  ]),
  area('anatomia', 'Anatomia de Cabeça e Pescoço', '💀', 'media', [
    'Osteologia do crânio e da face',
    'Músculos da mastigação e da expressão facial',
    'Nervo trigêmeo e nervo facial',
    'Vascularização: artéria carótida externa e ramos',
    'Espaços fasciais e disseminação de infecções',
    'Anatomia da ATM',
    'Glândulas salivares e drenagem linfática',
  ]),
  area('farmaco', 'Farmacologia e Terapêutica', '💊', 'alta', [
    'Analgésicos e anti-inflamatórios não esteroidais',
    'Corticosteroides',
    'Antibióticos de uso odontológico',
    'Profilaxia antibiótica (endocardite infecciosa)',
    'Anticoagulantes e antiagregantes plaquetários',
    'Interações medicamentosas',
    'Prescrição e receituário (incluindo controle especial)',
  ]),
  area('anestesia', 'Anestesiologia Local', '💉', 'alta', [
    'Farmacologia dos anestésicos locais e vasoconstritores',
    'Cálculo de doses máximas e número de tubetes',
    'Técnicas anestésicas maxilares',
    'Técnicas mandibulares — NAI, Gow-Gates, Vazirani-Akinosi',
    'Complicações locais e sistêmicas da anestesia',
  ]),
  area('sistemico', 'Pacientes Sistemicamente Comprometidos e Urgências', '❤️‍🩹', 'alta', [
    'Hipertensão arterial e cardiopatias',
    'Diabetes mellitus',
    'Coagulopatias e pacientes anticoagulados',
    'Gestantes e lactantes',
    'Paciente oncológico — radioterapia, quimioterapia e osteorradionecrose',
    'Bisfosfonatos e osteonecrose dos maxilares (MRONJ)',
    'Doença renal, hepática e pacientes HIV+',
    'Emergências médicas: síncope, anafilaxia, hipoglicemia, convulsão',
    'Suporte Básico de Vida (SBV/RCP)',
    'Odontologia hospitalar e em UTI (higiene bucal e prevenção de PAV)',
  ]),
  area('cirurgia', 'Cirurgia e Traumatologia Bucomaxilofacial', '🔪', 'alta', [
    'Princípios de cirurgia, assepsia e instrumental',
    'Exodontias e técnicas de retalho',
    'Dentes inclusos — classificações de Pell & Gregory e Winter',
    'Complicações: alveolite, comunicação bucossinusal, hemorragia, parestesia',
    'Infecções odontogênicas e Angina de Ludwig',
    'Fraturas de mandíbula',
    'Fraturas do terço médio — zigomático e Le Fort',
    'Cirurgia pré-protética',
    'Biópsias — indicações e técnicas',
    'Tratamento cirúrgico de cistos e tumores',
  ]),
  area('estomato', 'Estomatologia e Patologia Oral', '🔬', 'alta', [
    'Semiologia e lesões fundamentais',
    'Lesões potencialmente malignas — leucoplasia, eritroplasia, queilite actínica',
    'Câncer de boca — CEC, fatores de risco e estadiamento TNM',
    'Infecções: candidíase, herpes, HPV e sífilis',
    'Doenças imunomediadas: líquen plano, pênfigo e penfigoide',
    'Cistos odontogênicos e não odontogênicos',
    'Tumores odontogênicos',
    'Lesões reacionais e proliferativas',
    'Doenças das glândulas salivares',
    'Manifestações bucais de doenças sistêmicas',
  ]),
  area('radio', 'Radiologia e Imaginologia', '🩻', 'media', [
    'Técnicas intrabucais — periapical, interproximal e oclusal',
    'Radiografia panorâmica e erros de técnica',
    'Tomografia computadorizada de feixe cônico',
    'Proteção radiológica',
    'Interpretação radiográfica de lesões',
  ]),
  area('perio', 'Periodontia', '🦷', 'media', [
    'Classificação das doenças periodontais (2017/2018)',
    'Etiopatogenia e biofilme',
    'Exame e diagnóstico periodontal',
    'Tratamento periodontal não cirúrgico',
    'Doença periodontal e condições sistêmicas',
    'Cirurgia periodontal e mucogengival',
  ]),
  area('dentistica', 'Cariologia, Dentística e Materiais', '✨', 'media', [
    'Etiologia da cárie e avaliação de risco',
    'Diagnóstico de lesões de cárie (ICDAS)',
    'Mínima intervenção e ART',
    'Selantes de fóssulas e fissuras',
    'Resina composta, ionômero de vidro e amálgama',
    'Sistemas adesivos',
    'Proteção do complexo dentinopulpar',
  ]),
  area('endo', 'Endodontia e Traumatismo Dentário', '🌱', 'media', [
    'Diagnóstico pulpar e periapical',
    'Urgências endodônticas',
    'Preparo químico-mecânico e soluções irrigadoras',
    'Medicação intracanal e obturação',
    'Traumatismo dentário — avulsão e luxações',
  ]),
  area('odontoped', 'Odontopediatria', '🧸', 'media', [
    'Cronologia de erupção e desenvolvimento da dentição',
    'Manejo do comportamento infantil',
    'Cárie na primeira infância',
    'Terapia pulpar em dentes decíduos',
    'Traumatismo na dentição decídua',
    'Uso de flúor em crianças',
  ]),
  area('protese', 'Prótese, Oclusão e DTM', '🦴', 'baixa', [
    'Oclusão e DTM — diagnóstico e tratamento',
    'Prótese total e prótese parcial removível',
    'Prótese fixa',
    'Noções de implantodontia',
  ]),
  area('orto', 'Ortodontia', '😁', 'baixa', [
    'Crescimento e desenvolvimento craniofacial',
    'Classificação de Angle e más oclusões',
    'Ortodontia preventiva e interceptativa',
    'Hábitos bucais deletérios',
  ]),
]

export const AREA_BY_ID = Object.fromEntries(AREAS.map((a) => [a.id, a]))

export const TOPIC_BY_ID = Object.fromEntries(
  AREAS.flatMap((a) => a.topicos.map((t) => [t.id, { ...t, areaId: a.id }])),
)

export const TOTAL_TOPICOS = AREAS.reduce((n, a) => n + a.topicos.length, 0)

export const PRIORIDADE = {
  alta: { label: 'Prioridade alta', short: 'alta', ordem: 0 },
  media: { label: 'Prioridade média', short: 'média', ordem: 1 },
  baixa: { label: 'Prioridade baixa', short: 'baixa', ordem: 2 },
}

export const areaNome = (id) => AREA_BY_ID[id]?.nome ?? 'Outro'
export const areaEmoji = (id) => AREA_BY_ID[id]?.emoji ?? '📌'
