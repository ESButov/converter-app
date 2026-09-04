export type SpeciesDosage = {
  dosage: string
  species: string
}

export type SubstanceTradeNameLink = {
  name: string
  preparationId: string
}

export type ActiveSubstanceReferenceItem = {
  id: string
  russianName: string
  englishName: string
  tradeNames: readonly SubstanceTradeNameLink[]
  mainPharmacologicalGroup: string
  pharmacologicalGroups: readonly string[]
  action: readonly string[]
  use: readonly string[]
  dosages: readonly SpeciesDosage[]
  contraindications: readonly string[]
  interactions: readonly string[]
  adverseEffects: readonly string[]
  additionalInfo: readonly string[]
  tags: readonly string[]
}

export const activeSubstanceReferenceItems: readonly ActiveSubstanceReferenceItem[] = [
  {
    id: 'Vitamin_K1',
    russianName: 'Витамин K1 / фитоменадион',
    englishName: 'Vitamin K1',
    tradeNames: [
      {
        name: 'Конафлион',
        preparationId: 'konaflion',
      },
      {
        name: 'Сангвения',
        preparationId: 'sangvenia',
      },
      {
        name: 'Солвестан',
        preparationId: 'solvestan',
      },
      {
        name: 'КогаПЕТ',
        preparationId: 'kogapet',
      },
    ],
    mainPharmacologicalGroup: 'Витамин; антигеморрагическое средство',
    pharmacologicalGroups: [
      'Витамин',
      'Антигеморрагическое средство',
      'Источник γ-карбоксилирования факторов II, VII, IX, X',
    ],
    action: [
      'Фитоменадион — препарат витамина K.',
      'Фитоменадион представляет собой синтетическую жирорастворимую форму витамина K1.',
      'Британское написание международного названия также соответствует фитоменадиону.',
      'Менадиол — витамин K4, водорастворимое производное, которое в организме превращается в витамин K3 (менадион).',
      'Витамин K1 применяют для лечения коагулопатий, вызванных интоксикацией антикоагулянтами.',
      'Антикоагулянтные яды истощают запасы витамина K, необходимого для синтеза факторов свертывания крови.',
      'Применение витамина K в разных лекарственных формах позволяет устранить действие антикоагулянтных ядов.',
    ],
    use: [
      'Фитоменадион применяют для лечения коагулопатий, вызванных интоксикацией антикоагулянтами: варфарином и другими родентицидами.',
      'У крупных животных применяют для лечения отравления донником, содержащим производные кумарина.',
    ],
    dosages: [
      {
        species: 'Собаки и кошки',
        dosage: 'Лечение отравления родентицидами короткого действия: 1 мг/кг/сут в течение 10-14 дней, п/к или внутрь. Лечение отравления родентицидами длительного действия: 2,5-5 мг/кг/сут в течение 3-4 недель, в/м, п/к или внутрь.',
      },
      {
        species: 'Птицы',
        dosage: '2,5-5 мг/кг каждые 24 ч.',
      },
      {
        species: 'КРС, телята, лошади, овцы и козы',
        dosage: '0,5-2,5 мг/кг, п/к или в/м.',
      },
    ],
    contraindications: [
      'Рекомендуется провести точную диагностику для исключения других причин кровотечения.',
      'Другие формы витамина K могут действовать медленнее, чем витамин K1; следует рассматривать применение специфической формы препарата.',
      'Для предотвращения анафилактических реакций не вводить внутривенно.',
    ],
    interactions: ['Лекарственные взаимодействия не зарегистрированы.'],
    adverseEffects: [
      'У людей после быстрого внутривенного введения редко наблюдались реакции, напоминающие гиперчувствительность.',
      'Клинические признаки могут напоминать анафилактический шок.',
      'Подобные реакции наблюдались и у животных.',
      'Для предотвращения анафилактических реакций не следует вводить препарат внутривенно.',
    ],
    additionalInfo: [],
    tags: [
      'витамин K1',
      'фитоменадион',
      'антикоагулянтные родентициды',
      'варфарин',
      'коагулопатия',
      'кровотечение',
    ],
  },
]
