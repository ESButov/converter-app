import {
  activeSubstanceReferenceItems,
  type ActiveSubstanceReferenceItem,
} from '../data/activeSubstancesReference'
import {
  veterinaryPreparationReferenceItems,
  type VeterinaryPreparationReferenceItem,
} from '../data/veterinaryPreparationsReference'

export type CompatibilityMode = 'substance' | 'preparation'

export type CompatibilitySeverity = 'compatible' | 'caution' | 'avoid' | 'unknown'

type SerotonergicMechanism =
  | 'serotoninReuptake'
  | 'monoamineOxidase'
  | 'serotonergicOpioid'
  | 'atypicalSerotonergic'

type SerotonergicProfile = {
  mechanism: SerotonergicMechanism
  label: string
  riskWeight: number
}

export type CompatibilityEntity = {
  id: string
  label: string
  searchText: string
  substanceIds: readonly string[]
  subtitle: string
}

export type CompatibilityResult = {
  severity: CompatibilitySeverity
  title: string
  summary: string
  reasons: readonly string[]
  recommendations: readonly string[]
}

const serotonergicProfiles = new Map<string, SerotonergicProfile>([
  ['fluoxetine', { mechanism: 'serotoninReuptake', label: 'ингибитор обратного захвата серотонина', riskWeight: 3 }],
  ['sertraline', { mechanism: 'serotoninReuptake', label: 'ингибитор обратного захвата серотонина', riskWeight: 3 }],
  ['paroxetine', { mechanism: 'serotoninReuptake', label: 'ингибитор обратного захвата серотонина', riskWeight: 3 }],
  ['clomipramine', { mechanism: 'serotoninReuptake', label: 'трициклический антидепрессант с серотонинергическим действием', riskWeight: 3 }],
  ['amitriptyline', { mechanism: 'serotoninReuptake', label: 'трициклический антидепрессант', riskWeight: 2 }],
  ['trazodone', { mechanism: 'atypicalSerotonergic', label: 'серотонинергический анксиолитик', riskWeight: 2 }],
  ['mirtazapine', { mechanism: 'atypicalSerotonergic', label: 'атипичный серотонинергический препарат', riskWeight: 2 }],
  ['tramadol', { mechanism: 'serotonergicOpioid', label: 'опиоид с ингибированием обратного захвата серотонина', riskWeight: 3 }],
  ['methadone', { mechanism: 'serotonergicOpioid', label: 'серотонинергический опиоид', riskWeight: 2 }],
  ['fentanyl', { mechanism: 'serotonergicOpioid', label: 'серотонинергический опиоид', riskWeight: 2 }],
  ['selegiline', { mechanism: 'monoamineOxidase', label: 'ингибитор моноаминоксидазы', riskWeight: 4 }],
  ['linezolid', { mechanism: 'monoamineOxidase', label: 'антибиотик со слабым ингибированием моноаминоксидазы', riskWeight: 4 }],
  ['methylene_blue', { mechanism: 'monoamineOxidase', label: 'антидот с ингибированием моноаминоксидазы', riskWeight: 4 }],
  ['metoclopramide', { mechanism: 'atypicalSerotonergic', label: 'противорвотный препарат с условным серотонинергическим риском', riskWeight: 1 }],
  ['ondansetron', { mechanism: 'atypicalSerotonergic', label: 'антагонист 5-HT3-рецепторов с условным серотонинергическим риском', riskWeight: 1 }],
])

const substanceEntityById = new Map(
  activeSubstanceReferenceItems.map((item) => [item.id, getSubstanceCompatibilityEntity(item)]),
)

const preparationEntityById = new Map(
  veterinaryPreparationReferenceItems.map((item) => [item.id, getPreparationCompatibilityEntity(item)]),
)

export const getCompatibilityOptions = (mode: CompatibilityMode) => (
  mode === 'substance'
    ? activeSubstanceReferenceItems.map(getSubstanceCompatibilityEntity)
    : veterinaryPreparationReferenceItems.map(getPreparationCompatibilityEntity)
)

export const getCompatibilitySuggestions = (
  mode: CompatibilityMode,
  query: string,
  limit = 6,
) => {
  const normalizedQuery = normalizeCompatibilitySearch(query)

  if (!normalizedQuery) {
    return getCompatibilityOptions(mode).slice(0, limit)
  }

  return getCompatibilityOptions(mode)
    .filter((entity) => entity.searchText.includes(normalizedQuery))
    .slice(0, limit)
}

export const getCompatibilityEntityById = (
  mode: CompatibilityMode,
  id: string,
) => (
  mode === 'substance'
    ? substanceEntityById.get(id)
    : preparationEntityById.get(id)
)

export const analyzeCompatibility = (
  mode: CompatibilityMode,
  firstId: string,
  secondId: string,
): CompatibilityResult | null => {
  const firstEntity = getCompatibilityEntityById(mode, firstId)
  const secondEntity = getCompatibilityEntityById(mode, secondId)

  if (firstEntity === undefined || secondEntity === undefined) {
    return null
  }

  if (firstEntity.id === secondEntity.id) {
    return {
      severity: 'caution',
      title: 'Дублирование одного вещества',
      summary: 'Выбрано одно и то же действующее вещество или препарат.',
      reasons: ['Есть риск непреднамеренного увеличения суммарной дозы.'],
      recommendations: ['Проверьте, не дублируется ли назначение в листе терапии.'],
    }
  }

  const firstProfiles = getProfilesForEntity(firstEntity)
  const secondProfiles = getProfilesForEntity(secondEntity)

  if (firstProfiles.length === 0 || secondProfiles.length === 0) {
    return {
      severity: 'unknown',
      title: 'Критичного серотонинергического сочетания не найдено',
      summary: 'В текущей тестовой базе для этой пары нет правила несовместимости.',
      reasons: [
        'Проверка сейчас покрывает серотониновый синдром и ограниченный набор действующих веществ.',
      ],
      recommendations: [
        'Сверьте назначение с инструкцией к препарату, клиническим протоколом и полным листом терапии пациента.',
      ],
    }
  }

  const pairProfiles = [...firstProfiles, ...secondProfiles]
  const hasMonoamineOxidaseInhibitor = pairProfiles.some((profile) => (
    profile.mechanism === 'monoamineOxidase'
  ))
  const hasTramadol = hasSubstance(firstEntity, 'tramadol') || hasSubstance(secondEntity, 'tramadol')
  const hasHighRiskTramadolCombination = hasTramadol && pairProfiles.some((profile) => (
    profile.riskWeight >= 2 && profile.mechanism !== 'serotonergicOpioid'
  ))
  const hasTwoReuptakeInhibitors =
    firstProfiles.some((profile) => profile.mechanism === 'serotoninReuptake')
    && secondProfiles.some((profile) => profile.mechanism === 'serotoninReuptake')
  const combinedRiskWeight = Math.max(...firstProfiles.map((profile) => profile.riskWeight))
    + Math.max(...secondProfiles.map((profile) => profile.riskWeight))

  if (hasMonoamineOxidaseInhibitor || hasHighRiskTramadolCombination || hasTwoReuptakeInhibitors || combinedRiskWeight >= 6) {
    return {
      severity: 'avoid',
      title: 'Не рекомендуется сочетать',
      summary: 'Комбинация может существенно повысить риск серотонинового синдрома.',
      reasons: getSerotoninReasons(firstEntity, secondEntity, firstProfiles, secondProfiles),
      recommendations: [
        'По возможности выбрать альтернативный препарат без серотонинергического действия.',
        'Если замена невозможна, использовать только по строгим показаниям, снизить лекарственную нагрузку и обеспечить мониторинг температуры, поведения, мышечного тонуса, рефлексов, частоты сердечных сокращений и давления.',
        'При появлении возбуждения, тремора, гиперрефлексии, диареи или гипертермии отменить подозреваемые препараты и рассмотреть серотониновый синдром как неотложное состояние.',
      ],
    }
  }

  return {
    severity: 'caution',
    title: 'Ограниченное использование',
    summary: 'Сочетание имеет серотонинергический потенциал и требует клинического контроля.',
    reasons: getSerotoninReasons(firstEntity, secondEntity, firstProfiles, secondProfiles),
    recommendations: [
      'Избегать добавления третьего серотонинергического препарата.',
      'Использовать минимально эффективные дозы и фиксировать исходное неврологическое состояние пациента.',
      'Мониторировать возбуждение, тремор, гиперрефлексию, диарею, гипертермию и сердечно-сосудистые изменения.',
    ],
  }
}

function getSubstanceCompatibilityEntity(item: ActiveSubstanceReferenceItem): CompatibilityEntity {
  return {
    id: item.id,
    label: `${item.russianName} / ${item.englishName}`,
    searchText: normalizeCompatibilitySearch([
      item.id,
      item.russianName,
      item.englishName,
      item.mainPharmacologicalGroup,
      ...item.pharmacologicalGroups,
      ...item.tradeNames.map((tradeName) => tradeName.name),
      ...item.tags,
    ].join(' ')),
    substanceIds: [item.id],
    subtitle: item.mainPharmacologicalGroup,
  }
}

function getPreparationCompatibilityEntity(item: VeterinaryPreparationReferenceItem): CompatibilityEntity {
  return {
    id: item.id,
    label: item.name,
    searchText: normalizeCompatibilitySearch([
      item.name,
      item.englishName,
      item.form,
      item.dosage,
      item.manufacturer,
      ...item.pharmacologicalGroups,
      ...item.activeSubstances.flatMap((substance) => [substance.id ?? '', substance.name]),
    ].join(' ')),
    substanceIds: item.activeSubstances.flatMap((substance) => (
      substance.id === undefined ? [] : [substance.id]
    )),
    subtitle: item.pharmacologicalGroups.join(', '),
  }
}

function normalizeCompatibilitySearch(value: string) {
  return value.trim().toLowerCase()
}

function getProfilesForEntity(entity: CompatibilityEntity) {
  return entity.substanceIds.flatMap((id) => {
    const profile = serotonergicProfiles.get(id)

    return profile === undefined ? [] : [profile]
  })
}

function hasSubstance(entity: CompatibilityEntity, substanceId: string) {
  return entity.substanceIds.includes(substanceId)
}

function getSerotoninReasons(
  firstEntity: CompatibilityEntity,
  secondEntity: CompatibilityEntity,
  firstProfiles: readonly SerotonergicProfile[],
  secondProfiles: readonly SerotonergicProfile[],
) {
  return [
    `${firstEntity.label}: ${firstProfiles.map((profile) => profile.label).join(', ')}.`,
    `${secondEntity.label}: ${secondProfiles.map((profile) => profile.label).join(', ')}.`,
    'При сочетании серотонинергических механизмов повышается риск возбуждения, тремора, гиперрефлексии, диареи, сердечно-сосудистых изменений и гипертермии.',
  ]
}
