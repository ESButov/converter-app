import {
  activeSubstanceReferenceItems,
  type ActiveSubstanceReferenceItem,
} from './activeSubstancesReference'
import {
  veterinaryPreparationReferenceItems,
  type VeterinaryPreparationReferenceItem,
} from './veterinaryPreparationsReference'

export type Mdr1Status = 'avoid' | 'reduce-dose' | 'label-dose' | 'combination-caution'

export type Mdr1TradeName = {
  name: string
  note?: string
}

export type Mdr1ReferenceItem = {
  id: string
  russianName: string
  englishName: string
  tradeNames: readonly Mdr1TradeName[]
  pharmacologicalGroup: string
  status: Mdr1Status
  mutantNormalRisk: string
  mutantMutantRisk: string
  toxicitySigns: readonly string[]
  safetyComment: string
  alternatives: readonly string[]
  tags: readonly string[]
}

export type Mdr1BreedFrequencyItem = {
  breed: string
  frequency: string
  note?: string
}

export type Mdr1SearchSuggestion = {
  id: string
  label: string
  matchType: 'Действующее вещество' | 'Препарат'
  subtitle: string
}

export const mdr1StatusLabels: Record<Mdr1Status, string> = {
  avoid: 'избегать',
  'reduce-dose': 'снизить дозу',
  'label-dose': 'только по инструкции',
  'combination-caution': 'осторожно при сочетаниях',
}

export const mdr1BreedFrequencyItems: readonly Mdr1BreedFrequencyItem[] = [
  {
    breed: 'Колли',
    frequency: '≈70%',
    note: 'Наиболее высокая частота среди пород риска.',
  },
  {
    breed: 'Австралийская овчарка',
    frequency: '≈50%',
  },
  {
    breed: 'Миниатюрная австралийская / американская овчарка',
    frequency: '≈50%',
  },
  {
    breed: 'Длинношерстный уиппет',
    frequency: '≈50-65%',
    note: 'В разных источниках частота указывается по-разному, поэтому в справочнике оставлен диапазон.',
  },
  {
    breed: 'Макнаб',
    frequency: '≈30%',
  },
  {
    breed: 'Силкен виндхаунд',
    frequency: '≈30%',
  },
  {
    breed: 'Чинук',
    frequency: '≈25%',
  },
  {
    breed: 'Шетландская овчарка',
    frequency: '≈15%',
  },
  {
    breed: 'Английская овчарка',
    frequency: '≈15%',
  },
  {
    breed: 'Немецкая овчарка',
    frequency: '≈10%',
  },
  {
    breed: 'Метисы пастушьих пород',
    frequency: '≈10%',
  },
  {
    breed: 'Староанглийская овчарка',
    frequency: '≈5%',
  },
  {
    breed: 'Смешанные породы',
    frequency: '≈5%',
    note: 'Мутация возможна и у собак без очевидного фенотипа пастушьей породы.',
  },
  {
    breed: 'Бордер-колли',
    frequency: '<5%',
  },
  {
    breed: 'Белая швейцарская овчарка',
    frequency: '≈14-16%',
    note: 'Частота описана в европейских выборках.',
  },
  {
    breed: 'Вэллер',
    frequency: '≈17-19%',
    note: 'Частота описана в европейских выборках.',
  },
  {
    breed: 'Блэк-маут-кёр',
    frequency: 'недостаточно данных',
  },
  {
    breed: 'Каролинская собака',
    frequency: 'недостаточно данных',
  },
  {
    breed: 'Золотистый ретривер',
    frequency: 'неизвестно',
  },
  {
    breed: 'Сибирский хаски',
    frequency: 'неизвестно',
  },
  {
    breed: 'Кошки',
    frequency: '≈4%',
    note: 'Для кошек показатель приводится как общая встречаемость, без устойчивого породного распределения.',
  },
]

export const mdr1ReferenceItems: readonly Mdr1ReferenceItem[] = [
  {
    id: 'loperamide',
    russianName: 'Лоперамид',
    englishName: 'Loperamide',
    tradeNames: [{ name: 'Имодиум' }, { name: 'Лоперамид' }],
    pharmacologicalGroup: 'Противодиарейный опиоидный препарат',
    status: 'avoid',
    mutantNormalRisk: 'Высокий риск неврологической токсичности даже при терапевтических дозах для лечения диареи.',
    mutantMutantRisk: 'Очень высокий риск тяжелой нейротоксичности, комы и жизнеугрожающих осложнений.',
    toxicitySigns: ['Рвота', 'угнетение', 'атаксия', 'тремор', 'мидриаз', 'судороги', 'кома', 'угнетение дыхания'],
    safetyComment: 'При известной или предполагаемой мутации MDR1/ABCB1 лоперамид не использовать.',
    alternatives: ['Симптоматическая терапия диареи без опиоидных противодиарейных средств', 'Энтеросорбенты по показаниям', 'Диетическая коррекция и регидратация'],
    tags: ['диарея', 'опиоид', 'нейротоксичность', 'имодиум'],
  },
  {
    id: 'ivermectin',
    russianName: 'Ивермектин',
    englishName: 'Ivermectin',
    tradeNames: [{ name: 'Heartgard' }, { name: 'Ивермек' }, { name: 'Отодектин' }, { name: 'Ивомек' }],
    pharmacologicalGroup: 'Макроциклический лактон; противопаразитарный препарат',
    status: 'label-dose',
    mutantNormalRisk: 'При зарегистрированных профилактических дозах риск считается низким; при высоких или внесистемных дозах риск токсичности повышается.',
    mutantMutantRisk: 'При высоких дозах риск тяжелой неврологической токсичности значительно выше.',
    toxicitySigns: ['Саливация', 'атаксия', 'мидриаз', 'угнетение', 'тремор', 'судороги', 'слепота', 'кома'],
    safetyComment: 'Использовать только строго по инструкции конкретного препарата; пасты и препараты для лошадей у собак группы риска не применять.',
    alternatives: ['Препараты с подтвержденной безопасностью по инструкции', 'Немакроциклические схемы противопаразитарной терапии по показаниям'],
    tags: ['макроциклический лактон', 'профилактика дирофиляриоза', 'демодекоз', 'нейротоксичность'],
  },
  {
    id: 'milbemycin',
    russianName: 'Мильбемицин',
    englishName: 'Milbemycin',
    tradeNames: [{ name: 'Мильбемакс' }, { name: 'Interceptor' }, { name: 'Interceptor Plus' }, { name: 'Нексгард Спектра' }],
    pharmacologicalGroup: 'Макроциклический лактон; противопаразитарный препарат',
    status: 'label-dose',
    mutantNormalRisk: 'При применении по инструкции риск низкий; при превышении дозы требуется осторожность.',
    mutantMutantRisk: 'При превышении инструкции риск неврологической токсичности выше, чем у собак без мутации.',
    toxicitySigns: ['Рвота', 'атаксия', 'слабость', 'тремор', 'судороги', 'угнетение'],
    safetyComment: 'Оставлять только инструкционные дозы и не использовать высокодозные схемы без генотипа и клинического контроля.',
    alternatives: ['Препараты с подтвержденной безопасностью по инструкции', 'Индивидуальный подбор противопаразитарной схемы'],
    tags: ['макроциклический лактон', 'профилактика дирофиляриоза', 'антигельминтик'],
  },
  {
    id: 'moxidectin',
    russianName: 'Моксидектин',
    englishName: 'Moxidectin',
    tradeNames: [{ name: 'ProHeart' }, { name: 'Simparica Trio' }, { name: 'Nexgard Plus' }, { name: 'Advantage Multi' }, { name: 'Адвокат' }],
    pharmacologicalGroup: 'Макроциклический лактон; противопаразитарный препарат',
    status: 'label-dose',
    mutantNormalRisk: 'При зарегистрированных дозах отдельных препаратов риск низкий; при превышении дозы риск возрастает.',
    mutantMutantRisk: 'При внесистемном применении или передозировке возможна выраженная неврологическая токсичность.',
    toxicitySigns: ['Атаксия', 'слабость', 'мидриаз', 'тремор', 'угнетение', 'судороги', 'кома'],
    safetyComment: 'Проверять конкретную инструкцию и не переносить безопасный статус одной формы на другие концентрации или виды животных.',
    alternatives: ['Инструкционные схемы профилактики дирофиляриоза', 'Препараты с опубликованной безопасностью у собак с MDR1/ABCB1'],
    tags: ['макроциклический лактон', 'дирофиляриоз', 'профилактика'],
  },
  {
    id: 'selamectin',
    russianName: 'Селамектин',
    englishName: 'Selamectin',
    tradeNames: [{ name: 'Стронгхолд' }, { name: 'Stronghold' }, { name: 'Revolution' }],
    pharmacologicalGroup: 'Макроциклический лактон; противопаразитарный препарат',
    status: 'label-dose',
    mutantNormalRisk: 'При применении по инструкции риск низкий.',
    mutantMutantRisk: 'При применении по инструкции риск низкий; при передозировке требуется наблюдение.',
    toxicitySigns: ['Атаксия', 'тремор', 'слабость', 'угнетение', 'мидриаз'],
    safetyComment: 'Использовать только видоспецифичную форму и дозу по инструкции.',
    alternatives: ['Другие препараты с подтвержденной безопасностью по инструкции'],
    tags: ['макроциклический лактон', 'стронгхолд', 'революшн', 'наружная обработка'],
  },
  {
    id: 'emodepside',
    russianName: 'Эмодепсид',
    englishName: 'Emodepside',
    tradeNames: [{ name: 'Профендер' }],
    pharmacologicalGroup: 'Противопаразитарный препарат',
    status: 'avoid',
    mutantNormalRisk: 'Возможен повышенный риск неврологических реакций; препарат лучше не выбирать без веской причины.',
    mutantMutantRisk: 'Риск выраженной неврологической токсичности выше, особенно при передозировке или неправильном виде применения.',
    toxicitySigns: ['Угнетение', 'атаксия', 'тремор', 'саливация', 'мидриаз', 'судороги'],
    safetyComment: 'При подтвержденной MDR1/ABCB1-мутации лучше выбрать альтернативу или согласовать применение с профильным специалистом.',
    alternatives: ['Альтернативные антигельминтные препараты с лучшим профилем безопасности для пациента группы риска'],
    tags: ['антигельминтик', 'профендер', 'нейротоксичность'],
  },
  {
    id: 'acepromazine',
    russianName: 'Ацепромазин',
    englishName: 'Acepromazine',
    tradeNames: [{ name: 'Ветранквил' }, { name: 'Ацепромазин' }],
    pharmacologicalGroup: 'Фенотиазиновый седативный препарат',
    status: 'reduce-dose',
    mutantNormalRisk: 'Возможны более выраженная и длительная седация, гипотензия, атаксия.',
    mutantMutantRisk: 'Риск чрезмерной и продолжительной седации выше; дозу нужно снижать и мониторировать пациента.',
    toxicitySigns: ['Сильная седация', 'атаксия', 'слабость', 'гипотензия', 'гипотермия'],
    safetyComment: 'Использовать меньшие дозы, титровать по эффекту и учитывать суммарную седацию с другими препаратами.',
    alternatives: ['Протокол с меньшей зависимостью от P-гликопротеина', 'Титруемые седативные схемы под мониторингом'],
    tags: ['седация', 'фенотиазин', 'премедикация', 'ветранквил'],
  },
  {
    id: 'butorphanol',
    russianName: 'Буторфанол',
    englishName: 'Butorphanol',
    tradeNames: [{ name: 'Torbugesic' }, { name: 'Бутомидор' }, { name: 'Буторфанол' }],
    pharmacologicalGroup: 'Опиоидный анальгетик',
    status: 'reduce-dose',
    mutantNormalRisk: 'Возможна более выраженная седация и атаксия, особенно в составе премедикации.',
    mutantMutantRisk: 'Риск избыточной седации и неврологических признаков выше; требуется снижение дозы и мониторинг.',
    toxicitySigns: ['Седация', 'атаксия', 'дисфория', 'слабость', 'угнетение'],
    safetyComment: 'Начинать с нижней границы дозы и пересматривать протокол при сочетании с другими седативными препаратами.',
    alternatives: ['Другие анальгетики по показаниям с титрованием эффекта', 'Локорегионарные техники для снижения системной нагрузки'],
    tags: ['опиоид', 'анальгезия', 'седация', 'бутомидор'],
  },
  {
    id: 'apomorphine',
    russianName: 'Апоморфин',
    englishName: 'Apomorphine',
    tradeNames: [{ name: 'Апоморфин' }],
    pharmacologicalGroup: 'Дофаминергический препарат; эметик',
    status: 'reduce-dose',
    mutantNormalRisk: 'Может давать более выраженные центральные эффекты; предпочтителен осторожный выбор дозы.',
    mutantMutantRisk: 'Риск чрезмерной центральной реакции выше; требуется строгая оценка пользы и риска.',
    toxicitySigns: ['Угнетение', 'возбуждение', 'рвота', 'слабость', 'атаксия'],
    safetyComment: 'При пациенте группы риска рассмотреть альтернативный метод деконтаминации или консультацию токсиколога.',
    alternatives: ['Деконтаминация по токсикологическому протоколу', 'Поддерживающая терапия, если вызывать рвоту небезопасно'],
    tags: ['эметик', 'деконтаминация', 'рвота'],
  },
  {
    id: 'maropitant',
    russianName: 'Маропитант',
    englishName: 'Maropitant',
    tradeNames: [{ name: 'Церения' }, { name: 'Cerenia' }],
    pharmacologicalGroup: 'Противорвотный препарат; антагонист NK1-рецепторов',
    status: 'reduce-dose',
    mutantNormalRisk: 'Клинически значимая токсичность описывается реже, но у пациентов с мутацией требуется осторожность.',
    mutantMutantRisk: 'Риск накопления и побочных реакций выше; дозу и кратность лучше выбирать консервативно.',
    toxicitySigns: ['Угнетение', 'саливация', 'атаксия', 'рвота или усиление тошноты', 'местная болезненность при инъекции'],
    safetyComment: 'Использовать минимально эффективную дозу и учитывать сопутствующие ингибиторы P-гликопротеина.',
    alternatives: ['Ондансетрон с осторожностью', 'Коррекция причины рвоты и тошноты'],
    tags: ['противорвотный', 'церения', 'тошнота', 'рвота'],
  },
  {
    id: 'ondansetron',
    russianName: 'Ондансетрон',
    englishName: 'Ondansetron',
    tradeNames: [{ name: 'Зофран' }, { name: 'Ондансетрон' }],
    pharmacologicalGroup: 'Противорвотный препарат; антагонист 5-HT3-рецепторов',
    status: 'reduce-dose',
    mutantNormalRisk: 'Вероятность тяжелой токсичности ниже, чем у лоперамида, но возможны индивидуальные реакции и риск при сочетаниях.',
    mutantMutantRisk: 'Риск повышается при сочетании с ингибиторами P-гликопротеина и другими препаратами центрального действия.',
    toxicitySigns: ['Угнетение', 'атаксия', 'возбуждение', 'сердечно-сосудистые изменения', 'желудочно-кишечные признаки'],
    safetyComment: 'Назначать осторожно, особенно при сочетании с серотонинергическими препаратами и ингибиторами P-гликопротеина.',
    alternatives: ['Маропитант с осторожностью', 'Немедикаментозная коррекция причины тошноты'],
    tags: ['противорвотный', '5-HT3', 'серотониновые рецепторы', 'зофран'],
  },
  {
    id: 'grapiprant',
    russianName: 'Грапипрант',
    englishName: 'Grapiprant',
    tradeNames: [{ name: 'Галлипрант' }, { name: 'Galliprant' }],
    pharmacologicalGroup: 'Нестероидный противовоспалительный препарат; антагонист EP4-рецепторов',
    status: 'reduce-dose',
    mutantNormalRisk: 'Возможны более выраженные побочные реакции; требуется осторожность при длительном курсе.',
    mutantMutantRisk: 'Риск выше при длительном применении и сочетании с ингибиторами P-гликопротеина.',
    toxicitySigns: ['Рвота', 'диарея', 'угнетение', 'анорексия', 'слабость'],
    safetyComment: 'Подбирать минимально эффективную дозу и контролировать переносимость, особенно при хронической терапии.',
    alternatives: ['Другие схемы контроля боли по показаниям', 'Регионарная анальгезия или немедикаментозная поддержка'],
    tags: ['НПВС', 'боль', 'остеоартрит', 'галлипрант'],
  },
  {
    id: 'cyclosporine',
    russianName: 'Циклоспорин',
    englishName: 'Cyclosporine',
    tradeNames: [{ name: 'Атопика' }, { name: 'Atopica' }, { name: 'Циклоспорин' }],
    pharmacologicalGroup: 'Иммуносупрессивный препарат; ингибитор P-гликопротеина',
    status: 'combination-caution',
    mutantNormalRisk: 'Может увеличивать экспозицию других субстратов P-гликопротеина; риск зависит от сочетаний.',
    mutantMutantRisk: 'Риск лекарственного накопления при сочетаниях выше; требуется особенно осторожный подбор схемы.',
    toxicitySigns: ['Рвота', 'диарея', 'угнетение', 'анорексия', 'тремор при токсичности'],
    safetyComment: 'Главная опасность - сочетание с другими субстратами или ингибиторами P-гликопротеина.',
    alternatives: ['Избегать одновременного старта нескольких препаратов риска', 'Контроль концентраций или клинический мониторинг по показаниям'],
    tags: ['иммуносупрессант', 'атопия', 'ингибитор P-гликопротеина', 'атопика'],
  },
  {
    id: 'ketoconazole',
    russianName: 'Кетоконазол',
    englishName: 'Ketoconazole',
    tradeNames: [{ name: 'Кетоконазол' }, { name: 'Низорал' }],
    pharmacologicalGroup: 'Противогрибковый препарат; ингибитор P-гликопротеина',
    status: 'combination-caution',
    mutantNormalRisk: 'Сам по себе чаще важен как усилитель действия других препаратов риска.',
    mutantMutantRisk: 'При сочетании с субстратами P-гликопротеина риск накопления и токсичности выше.',
    toxicitySigns: ['Угнетение', 'анорексия', 'рвота', 'диарея', 'неврологические признаки при сочетанной токсичности'],
    safetyComment: 'Не сочетать без необходимости с макроциклическими лактонами, седативными и другими препаратами риска.',
    alternatives: ['Противогрибковые схемы с меньшим потенциалом лекарственных взаимодействий', 'Разделение терапии по времени, если клинически допустимо'],
    tags: ['противогрибковый', 'ингибитор P-гликопротеина', 'лекарственные взаимодействия'],
  },
  {
    id: 'spinosad',
    russianName: 'Спиносад',
    englishName: 'Spinosad',
    tradeNames: [{ name: 'Comfortis' }, { name: 'Спиносад' }],
    pharmacologicalGroup: 'Инсектицид; препарат против блох',
    status: 'combination-caution',
    mutantNormalRisk: 'Особенно важен при сочетании с ивермектином и другими макроциклическими лактонами.',
    mutantMutantRisk: 'Риск неврологической токсичности при сочетаниях выше; комбинации лучше избегать.',
    toxicitySigns: ['Рвота', 'тремор', 'атаксия', 'угнетение', 'судороги при токсичности'],
    safetyComment: 'Не комбинировать с высокими дозами макроциклических лактонов у собак группы риска.',
    alternatives: ['Изоксазолины в инструкционных дозах', 'Другие средства контроля эктопаразитов по профилю пациента'],
    tags: ['блохи', 'инсектицид', 'комфортис', 'ивермектин'],
  },
  {
    id: 'afoxolaner',
    russianName: 'Афоксоланер',
    englishName: 'Afoxolaner',
    tradeNames: [{ name: 'Нексгард' }, { name: 'NexGard' }, { name: 'Нексгард Спектра' }],
    pharmacologicalGroup: 'Изоксазолин; препарат против блох и клещей',
    status: 'label-dose',
    mutantNormalRisk: 'При применении по инструкции повышенный риск для собак с MDR1/ABCB1 не ожидается.',
    mutantMutantRisk: 'При применении по инструкции повышенный риск не ожидается; передозировки требуют наблюдения.',
    toxicitySigns: ['Рвота', 'диарея', 'тремор', 'атаксия', 'судороги у предрасположенных пациентов'],
    safetyComment: 'Использовать только по инструкции и учитывать общие предупреждения для изоксазолинов у пациентов с судорогами.',
    alternatives: ['Другой зарегистрированный препарат от эктопаразитов по инструкции'],
    tags: ['изоксазолин', 'блохи', 'клещи', 'нексгард'],
  },
  {
    id: 'fluralaner',
    russianName: 'Флураланер',
    englishName: 'Fluralaner',
    tradeNames: [{ name: 'Бравекто' }, { name: 'Bravecto' }],
    pharmacologicalGroup: 'Изоксазолин; препарат против блох и клещей',
    status: 'label-dose',
    mutantNormalRisk: 'При применении по инструкции повышенный риск для собак с MDR1/ABCB1 не ожидается.',
    mutantMutantRisk: 'При применении по инструкции повышенный риск не ожидается; передозировки требуют наблюдения.',
    toxicitySigns: ['Рвота', 'диарея', 'тремор', 'атаксия', 'судороги у предрасположенных пациентов'],
    safetyComment: 'Использовать видоспецифичную форму и дозу по инструкции.',
    alternatives: ['Другой зарегистрированный препарат от эктопаразитов по инструкции'],
    tags: ['изоксазолин', 'блохи', 'клещи', 'бравекто'],
  },
  {
    id: 'vincristine',
    russianName: 'Винкристин',
    englishName: 'Vincristine',
    tradeNames: [{ name: 'Винкристин' }],
    pharmacologicalGroup: 'Противоопухолевый препарат; алкалоид барвинка',
    status: 'reduce-dose',
    mutantNormalRisk: 'Повышен риск миелосупрессии и желудочно-кишечной токсичности; требуется онкологический протокол.',
    mutantMutantRisk: 'Риск выраженной токсичности существенно выше; дозу обычно корректируют и мониторируют кровь.',
    toxicitySigns: ['Угнетение', 'рвота', 'диарея', 'нейропатия', 'миелосупрессия', 'слабость'],
    safetyComment: 'Применять только в рамках онкологического протокола с учетом генотипа MDR1/ABCB1.',
    alternatives: ['Схема химиотерапии, адаптированная онкологом', 'Снижение дозы и усиленный мониторинг крови'],
    tags: ['химиотерапия', 'онкология', 'алкалоид барвинка', 'миелосупрессия'],
  },
  {
    id: 'vinblastine',
    russianName: 'Винбластин',
    englishName: 'Vinblastine',
    tradeNames: [{ name: 'Винбластин' }],
    pharmacologicalGroup: 'Противоопухолевый препарат; алкалоид барвинка',
    status: 'reduce-dose',
    mutantNormalRisk: 'Повышен риск токсичности химиотерапии; требуется индивидуальная коррекция дозы.',
    mutantMutantRisk: 'Риск тяжелой токсичности выше; нужен усиленный лабораторный контроль.',
    toxicitySigns: ['Миелосупрессия', 'угнетение', 'рвота', 'диарея', 'слабость'],
    safetyComment: 'Не применять как стандартную дозу без учета генотипа и онкологического мониторинга.',
    alternatives: ['Индивидуальная онкологическая схема', 'Коррекция дозы и контроль общего анализа крови'],
    tags: ['химиотерапия', 'онкология', 'алкалоид барвинка'],
  },
  {
    id: 'doxorubicin',
    russianName: 'Доксорубицин',
    englishName: 'Doxorubicin',
    tradeNames: [{ name: 'Доксорубицин' }],
    pharmacologicalGroup: 'Противоопухолевый антибиотик; антрациклин',
    status: 'reduce-dose',
    mutantNormalRisk: 'Возможен повышенный риск системной токсичности; требуется онкологическое ведение.',
    mutantMutantRisk: 'Риск токсичности выше; необходимы коррекция схемы, мониторинг крови и сердца.',
    toxicitySigns: ['Миелосупрессия', 'рвота', 'диарея', 'угнетение', 'кардиотоксичность'],
    safetyComment: 'Использовать только с онкологическим протоколом и мониторингом.',
    alternatives: ['Адаптация химиотерапевтической схемы специалистом', 'Выбор альтернативного препарата по типу опухоли'],
    tags: ['химиотерапия', 'онкология', 'антрациклин', 'кардиотоксичность'],
  },
]

export function getMdr1ReferenceItemById(id: string) {
  return mdr1ReferenceItems.find((item) => item.id === id)
}

export function getMdr1ReferenceResultById(id: string): Mdr1ReferenceItem | undefined {
  const directRiskItem = getMdr1ReferenceItemById(id)

  if (directRiskItem !== undefined) {
    return directRiskItem
  }

  if (id.startsWith('substance:')) {
    return getMdr1ReferenceResultForSubstance(id.replace('substance:', ''))
  }

  if (id.startsWith('preparation:')) {
    return getMdr1ReferenceResultForPreparation(id.replace('preparation:', ''))
  }

  return undefined
}

export function getMdr1Suggestions(query: string, limit = 8): Mdr1SearchSuggestion[] {
  const normalizedQuery = normalizeMdr1Search(query)
  const suggestions: Mdr1SearchSuggestion[] = []
  const seenSuggestionKeys = new Set<string>()
  const riskItemIds = new Set(mdr1ReferenceItems.map((item) => item.id))

  const pushSuggestion = (suggestion: Mdr1SearchSuggestion) => {
    const suggestionKey = `${suggestion.id}-${suggestion.label}-${suggestion.matchType}`

    if (seenSuggestionKeys.has(suggestionKey)) {
      return
    }

    seenSuggestionKeys.add(suggestionKey)
    suggestions.push(suggestion)
  }

  for (const item of mdr1ReferenceItems) {
    const substanceSearchText = normalizeMdr1Search([
      item.id,
      item.russianName,
      item.englishName,
      item.pharmacologicalGroup,
      ...item.tags,
    ].join(' '))

    if (!normalizedQuery || substanceSearchText.includes(normalizedQuery)) {
      pushSuggestion({
        id: item.id,
        label: `${item.russianName} / ${item.englishName}`,
        matchType: 'Действующее вещество',
        subtitle: item.pharmacologicalGroup,
      })
    }

    item.tradeNames.forEach((tradeName) => {
      const tradeNameSearchText = normalizeMdr1Search([
        tradeName.name,
        tradeName.note ?? '',
        item.russianName,
        item.englishName,
      ].join(' '))

      if (normalizedQuery && tradeNameSearchText.includes(normalizedQuery)) {
        pushSuggestion({
          id: item.id,
          label: tradeName.name,
          matchType: 'Препарат',
          subtitle: `${item.russianName} · ${item.pharmacologicalGroup}`,
        })
      }
    })
  }

  activeSubstanceReferenceItems.forEach((item) => {
    if (riskItemIds.has(item.id)) {
      return
    }

    const substanceSearchText = normalizeMdr1Search([
      item.id,
      item.russianName,
      item.englishName,
      item.mainPharmacologicalGroup,
      ...item.pharmacologicalGroups,
      ...item.tags,
    ].join(' '))

    if (!normalizedQuery || substanceSearchText.includes(normalizedQuery)) {
      pushSuggestion({
        id: `substance:${item.id}`,
        label: `${item.russianName} / ${item.englishName}`,
        matchType: 'Действующее вещество',
        subtitle: item.mainPharmacologicalGroup,
      })
    }
  })

  veterinaryPreparationReferenceItems.forEach((item) => {
    const preparationSearchText = normalizeMdr1Search([
      item.id,
      item.name,
      item.englishName,
      item.form,
      item.dosage,
      item.manufacturer,
      ...item.pharmacologicalGroups,
      ...item.activeSubstances.flatMap((substance) => [substance.id ?? '', substance.name]),
      ...item.instructionSections.flatMap((section) => [section.title, ...section.items]),
    ].join(' '))

    if (!normalizedQuery || preparationSearchText.includes(normalizedQuery)) {
      pushSuggestion({
        id: `preparation:${item.id}`,
        label: item.name,
        matchType: 'Препарат',
        subtitle: item.activeSubstances.map((substance) => substance.name).join(', '),
      })
    }
  })

  return suggestions
    .toSorted((firstSuggestion, secondSuggestion) => (
      getMdr1SuggestionRank(firstSuggestion, normalizedQuery)
      - getMdr1SuggestionRank(secondSuggestion, normalizedQuery)
    ))
    .slice(0, limit)
}

function normalizeMdr1Search(value: string) {
  return value.trim().toLowerCase()
}

function getMdr1ReferenceResultForSubstance(substanceId: string): Mdr1ReferenceItem | undefined {
  const riskItem = getMdr1ReferenceItemById(substanceId)

  if (riskItem !== undefined) {
    return riskItem
  }

  const substance = activeSubstanceReferenceItems.find((item) => item.id === substanceId)

  if (substance === undefined) {
    return undefined
  }

  return createMdr1SafeSubstanceResult(substance)
}

function getMdr1ReferenceResultForPreparation(preparationId: string): Mdr1ReferenceItem | undefined {
  const preparation = veterinaryPreparationReferenceItems.find((item) => item.id === preparationId)

  if (preparation === undefined) {
    return undefined
  }

  const riskItems = preparation.activeSubstances.flatMap((substance) => {
    if (substance.id === undefined) {
      return []
    }

    const riskItem = getMdr1ReferenceItemById(substance.id)

    return riskItem === undefined ? [] : [riskItem]
  })

  if (riskItems.length === 0) {
    return createMdr1SafePreparationResult(preparation)
  }

  if (riskItems.length === 1) {
    return {
      ...riskItems[0],
      tradeNames: [{ name: preparation.name }, ...riskItems[0].tradeNames],
    }
  }

  return createMdr1CombinedPreparationResult(preparation, riskItems)
}

function createMdr1SafeSubstanceResult(substance: ActiveSubstanceReferenceItem): Mdr1ReferenceItem {
  return {
    id: `substance:${substance.id}`,
    russianName: substance.russianName,
    englishName: substance.englishName,
    tradeNames: substance.tradeNames.map((tradeName) => ({ name: tradeName.name })),
    pharmacologicalGroup: substance.mainPharmacologicalGroup,
    status: 'label-dose',
    mutantNormalRisk: 'В текущей базе MDR1-специфического ограничения для этого действующего вещества не отмечено.',
    mutantMutantRisk: 'В текущей базе MDR1-специфического ограничения для этого действующего вещества не отмечено.',
    toxicitySigns: ['Специфические признаки MDR1-токсичности для этого вещества в текущей базе не выделены.'],
    safetyComment: 'Использовать по инструкции и учитывать обычные противопоказания, дозу, путь введения и лекарственные взаимодействия.',
    alternatives: ['Специальная MDR1-замена не требуется, если нет других клинических ограничений.'],
    tags: [...substance.tags],
  }
}

function createMdr1SafePreparationResult(preparation: VeterinaryPreparationReferenceItem): Mdr1ReferenceItem {
  return {
    id: `preparation:${preparation.id}`,
    russianName: preparation.name,
    englishName: preparation.englishName,
    tradeNames: [{ name: preparation.name }],
    pharmacologicalGroup: preparation.pharmacologicalGroups.join(', '),
    status: 'label-dose',
    mutantNormalRisk: 'В текущей базе MDR1-специфического ограничения для действующих веществ этого препарата не отмечено.',
    mutantMutantRisk: 'В текущей базе MDR1-специфического ограничения для действующих веществ этого препарата не отмечено.',
    toxicitySigns: ['Специфические признаки MDR1-токсичности для этого препарата в текущей базе не выделены.'],
    safetyComment: 'Использовать по инструкции препарата и учитывать стандартные противопоказания и взаимодействия.',
    alternatives: ['Специальная MDR1-замена не требуется, если нет других клинических ограничений.'],
    tags: [
      preparation.name,
      preparation.englishName,
      preparation.manufacturer,
      ...preparation.pharmacologicalGroups,
    ],
  }
}

function createMdr1CombinedPreparationResult(
  preparation: VeterinaryPreparationReferenceItem,
  riskItems: readonly Mdr1ReferenceItem[],
): Mdr1ReferenceItem {
  const riskNames = riskItems.map((item) => item.russianName).join(', ')

  return {
    id: `preparation:${preparation.id}`,
    russianName: preparation.name,
    englishName: preparation.englishName,
    tradeNames: [{ name: preparation.name }],
    pharmacologicalGroup: [
      ...preparation.pharmacologicalGroups,
      ...riskItems.map((item) => item.pharmacologicalGroup),
    ].join(', '),
    status: getHighestRiskStatus(riskItems),
    mutantNormalRisk: riskItems.map((item) => `${item.russianName}: ${item.mutantNormalRisk}`).join(' '),
    mutantMutantRisk: riskItems.map((item) => `${item.russianName}: ${item.mutantMutantRisk}`).join(' '),
    toxicitySigns: Array.from(new Set(riskItems.flatMap((item) => item.toxicitySigns))),
    safetyComment: `Препарат содержит действующие вещества с MDR1-ограничениями: ${riskNames}. Ориентируйтесь на самый строгий статус среди компонентов.`,
    alternatives: Array.from(new Set(riskItems.flatMap((item) => item.alternatives))),
    tags: Array.from(new Set(riskItems.flatMap((item) => item.tags))),
  }
}

function getHighestRiskStatus(items: readonly Mdr1ReferenceItem[]): Mdr1Status {
  const priority: Record<Mdr1Status, number> = {
    avoid: 4,
    'reduce-dose': 3,
    'combination-caution': 2,
    'label-dose': 1,
  }

  return items.reduce((highestStatus, item) => (
    priority[item.status] > priority[highestStatus] ? item.status : highestStatus
  ), 'label-dose' as Mdr1Status)
}

function getMdr1SuggestionRank(suggestion: Mdr1SearchSuggestion, normalizedQuery: string) {
  if (!normalizedQuery) {
    return suggestion.matchType === 'Действующее вещество' ? 0 : 1
  }

  const normalizedLabel = normalizeMdr1Search(suggestion.label)

  if (suggestion.matchType === 'Препарат' && normalizedLabel === normalizedQuery) {
    return 0
  }

  if (suggestion.matchType === 'Действующее вещество' && normalizedLabel.startsWith(normalizedQuery)) {
    return 1
  }

  if (suggestion.matchType === 'Препарат') {
    return 2
  }

  return 3
}
