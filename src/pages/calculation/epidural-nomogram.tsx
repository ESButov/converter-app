import { useMemo, useState, type ReactNode } from 'react';
import {
  calculateEpiduralNomogram,
  epiduralAdjuvants,
  epiduralAnesthetics,
  formatEpiduralNumber,
  getEpiduralAdjuvantById,
  getEpiduralAnestheticById,
  type EpiduralAdjuvantId,
  type EpiduralAnestheticId,
  type EpiduralBlockUnit,
} from '../../domain/epiduralNomogram';
import AppScreen from '../../ui/AppScreen';
import './epidural-nomogram.css';

const parseNumber = (value: string) => {
  const normalized = value.replace(',', '.');
  const numberValue = Number(normalized);
  return Number.isFinite(numberValue) ? numberValue : Number.NaN;
};

function NomogramField({
  children,
  helper,
  label,
}: {
  children: ReactNode;
  helper?: string;
  label: string;
}) {
  return (
    <label className="epidural-field">
      <span className="epidural-field__label">{label}</span>
      {children}
      {helper ? <span className="epidural-field__helper">{helper}</span> : null}
    </label>
  );
}

function ResultLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="epidural-result-line">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function EpiduralNomogramPage() {
  const [weightKg, setWeightKg] = useState('');
  const [occipitoCoccygealLengthCm, setOccipitoCoccygealLengthCm] = useState('');
  const [blockValue, setBlockValue] = useState('');
  const [blockUnit, setBlockUnit] = useState<EpiduralBlockUnit>('percent');
  const [anestheticId, setAnestheticId] = useState<EpiduralAnestheticId>('lidocaine');
  const [concentrationPercent, setConcentrationPercent] = useState(2);
  const [adjuvantId, setAdjuvantId] = useState<EpiduralAdjuvantId>('none');
  const [adjuvantDosePerKg, setAdjuvantDosePerKg] = useState('');

  const selectedAnesthetic = useMemo(() => getEpiduralAnestheticById(anestheticId), [anestheticId]);
  const selectedAdjuvant = useMemo(() => getEpiduralAdjuvantById(adjuvantId), [adjuvantId]);

  const result = useMemo(
    () =>
      calculateEpiduralNomogram({
        weightKg: parseNumber(weightKg),
        occipitoCoccygealLengthCm: parseNumber(occipitoCoccygealLengthCm),
        blockValue: parseNumber(blockValue),
        blockUnit,
        anestheticId,
        concentrationPercent,
        adjuvantId,
        adjuvantDosePerKg:
          adjuvantId === 'none' ? undefined : parseNumber(adjuvantDosePerKg),
      }),
    [
      adjuvantDosePerKg,
      adjuvantId,
      anestheticId,
      blockUnit,
      blockValue,
      concentrationPercent,
      occipitoCoccygealLengthCm,
      weightKg,
    ],
  );

  const handleAnestheticChange = (value: string) => {
    const nextAnesthetic = getEpiduralAnestheticById(value as EpiduralAnestheticId);
    setAnestheticId(nextAnesthetic.id);
    setConcentrationPercent(nextAnesthetic.defaultConcentrationPercent);
  };

  const handleAdjuvantChange = (value: string) => {
    const nextAdjuvant = getEpiduralAdjuvantById(value as EpiduralAdjuvantId);
    setAdjuvantId(nextAdjuvant.id);
    setAdjuvantDosePerKg(
      nextAdjuvant.id === 'none' ? '' : String(nextAdjuvant.defaultDosePerKg).replace('.', ','),
    );
  };

  return (
    <AppScreen
      ariaLabel="Калькулятор эпидуральной номограммы для собак"
      backLabel="Назад на главную"
      backTo="/home"
      screenClassName="epidural-screen"
      title="Номограмма (собаки)"
    >
      <div className="epidural-page">
        <section className="epidural-panel" aria-label="Исходные данные">
          <div className="epidural-grid">
            <NomogramField label="Масса, кг">
              <input
                inputMode="decimal"
                placeholder="например 24"
                type="text"
                value={weightKg}
                onChange={(event) => setWeightKg(event.target.value)}
              />
            </NomogramField>

            <NomogramField label="Затылочно-копчиковая длина, см">
              <input
                inputMode="decimal"
                placeholder="например 72"
                type="text"
                value={occipitoCoccygealLengthCm}
                onChange={(event) => setOccipitoCoccygealLengthCm(event.target.value)}
              />
            </NomogramField>

            <NomogramField label="Желаемый блок">
              <div className="epidural-combo">
                <input
                  inputMode="decimal"
                  placeholder={blockUnit === 'percent' ? 'например 55' : 'например 38'}
                  type="text"
                  value={blockValue}
                  onChange={(event) => setBlockValue(event.target.value)}
                />
                <select
                  value={blockUnit}
                  onChange={(event) => setBlockUnit(event.target.value as EpiduralBlockUnit)}
                >
                  <option value="percent">% блока</option>
                  <option value="cm">длина в см</option>
                </select>
              </div>
            </NomogramField>

            <NomogramField
              helper={`Ориентир по дозе: ${selectedAnesthetic.recommendedDose}`}
              label="Местный анестетик"
            >
              <div className="epidural-combo">
                <select
                  value={anestheticId}
                  onChange={(event) => handleAnestheticChange(event.target.value)}
                >
                  {epiduralAnesthetics.map((anesthetic) => (
                    <option key={anesthetic.id} value={anesthetic.id}>
                      {anesthetic.label}
                    </option>
                  ))}
                </select>
                <select
                  value={concentrationPercent}
                  onChange={(event) => setConcentrationPercent(Number(event.target.value))}
                >
                  {selectedAnesthetic.concentrationsPercent.map((concentration) => (
                    <option key={concentration} value={concentration}>
                      {concentration.toLocaleString('ru-RU')}%
                    </option>
                  ))}
                </select>
              </div>
            </NomogramField>

            <NomogramField
              helper={
                selectedAdjuvant.id === 'none'
                  ? undefined
                  : `${selectedAdjuvant.hint} Концентрация для расчета: ${selectedAdjuvant.concentrationMgMl.toLocaleString('ru-RU')} мг/мл.`
              }
              label="Адъювант"
            >
              <div className="epidural-combo">
                <select value={adjuvantId} onChange={(event) => handleAdjuvantChange(event.target.value)}>
                  {epiduralAdjuvants.map((adjuvant) => (
                    <option key={adjuvant.id} value={adjuvant.id}>
                      {adjuvant.label}
                    </option>
                  ))}
                </select>
                <input
                  disabled={adjuvantId === 'none'}
                  inputMode="decimal"
                  placeholder={selectedAdjuvant.doseUnit === 'mcg' ? 'мкг/кг' : 'мг/кг'}
                  type="text"
                  value={adjuvantDosePerKg}
                  onChange={(event) => setAdjuvantDosePerKg(event.target.value)}
                />
              </div>
            </NomogramField>
          </div>
        </section>

        {result ? (
          <>
            <section className="epidural-panel" aria-label="Результаты расчета">
              <div className="epidural-result-stack">
                <ResultLine
                  label={`Количество препарата: ${selectedAnesthetic.label}`}
                  value={`${formatEpiduralNumber(result.anestheticVolumeMl)} мл`}
                />
                {selectedAdjuvant.id !== 'none' ? (
                  <ResultLine
                    label={`Количество адъюванта: ${selectedAdjuvant.label}`}
                    value={`${formatEpiduralNumber(result.adjuvantVolumeMl)} мл`}
                  />
                ) : null}
                <ResultLine
                  label="Натрия хлорид 0,9% для разбавления"
                  value={`${formatEpiduralNumber(result.salineVolumeMl)} мл`}
                />
                <ResultLine
                  label="Итоговый объем раствора"
                  value={`${formatEpiduralNumber(result.finalSolutionVolumeMl)} мл`}
                />
                <ResultLine
                  label="Доза действующего вещества"
                  value={`${formatEpiduralNumber(result.localAnestheticDoseMgKg)} мг/кг`}
                />
                <ResultLine
                  label="Расчетный объем по номограмме"
                  value={`${formatEpiduralNumber(result.nomogramVolumeMl)} мл`}
                />
              </div>
            </section>

            {result.warnings.length > 0 ? (
              <section className="epidural-alert" aria-label="Предупреждения">
                {result.warnings.map((warning) => (
                  <p key={warning}>{warning}</p>
                ))}
              </section>
            ) : null}

            <section className="epidural-panel" aria-label="Комментарий">
              <div className="epidural-comment">
                <h2>Комментарий по анестетику</h2>
                <p>{result.anestheticComment}</p>
              </div>
              <div className="epidural-comment">
                <h2>Предполагаемая граница</h2>
                <p>
                  {result.spread.boundary}. {result.spread.blocked}
                </p>
              </div>
            </section>
          </>
        ) : (
          <section className="epidural-empty" aria-label="Ожидание данных">
            Заполните массу, затылочно-копчиковую длину и желаемый блок, чтобы получить расчет.
          </section>
        )}
      </div>
    </AppScreen>
  );
}
