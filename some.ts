const { useState, useEffect } = React;

const greatingsContent = {
  title: 'Welcom to Digital Pet Game!',
  subtitle: 'Take care of your digital pet!',
}

export const GreatingsPage = ({ callback }: { callback: (v: string) => void }) => {
  const [val, setVal] = useState('');

  function handleSubmit() {
    if (!val) return;

    callback(val);
  }

  return (
    <>
      <header>
        <h1>{greatingsContent.title}</h1>
        <p>{greatingsContent.subtitle}</p>
      </header>
      <section className="base-container info-panel">
        <form className="start-questions">
          <label htmlFor="pet-name">
            What's your pet's name
          </label>
          <input type="text" id="pet-name" value={val} onChange={(e) => setVal(e.target.value)}/>
          <button id="set-name-btn" type="submit" onClick={() => handleSubmit()}>Start game!</button>
        </form>
      </section>
    </>
  )
}

enum GameActions {
  EAT = 'eat',
  PLAY = 'play',
  SLEEP = 'sleep',
}

interface PetStat extends Record<string, number> {
  hunger: number,
  energy: number,
  happines: number,
}

enum PetMood {
  HAPPY,
  EXCITED,
  CONTENT,
  SAD,
  TIRED,
  SICK,
  HUNGRY,
}

const mapMoodToSprite: Record<PetMood, string> = {
  [PetMood.HAPPY]: '🐶'
}

export const GameBoard = ({ name }: { name: string }) => {

  const [stats, setStats] = useState<PetStat>({
    hunger: 0,
    energy: 100,
    happines: 100,
  })

  const handleAction =(act: GameActions): void => {
    switch (act) {
      case GameActions.EAT:
        setStats({
          ...stats,
          hunger: Math.max(0, stats.hunger - 10),
          energy: Math.min(100, stats.energy + 5),
        })
        return;
      case GameActions.PLAY:
        setStats({
          ...stats,
          energy: Math.max(0, stats.energy - 5),
          happines: Math.min(100, stats.happines + 5),
        })
        return;
      case GameActions.SLEEP:
        setStats({
          ...stats,
          hunger: Math.min(100, stats.hunger + 5),
          energy: Math.min(100, stats.energy + 10),
        })
        return;
      default:
        throw Error('Unsupported operation!');
    }
  }

  const processPrefix = (name: string, reversed: boolean = false): string => {
    if (stats[name] > 66 || (reversed && stats[name] < 33)) return 'high';
    if (stats[name] > 33 || (reversed && stats[name] < 66)) return 'medium';
    return 'low';
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        hunger: Math.min(100, stats.hunger + 10),
        energy: Math.min(stats.energy + 5, 100),
        happines: Math.max(stats.happines - 5, 0),
      })
    }, 5000)

    return () => clearTimeout(timer);
  }, [stats])

  return (
    <>
      <section className="base-container game-container">
        <div className="pet-sprite">🐶</div>
        <h2 className="pet-name">{name}</h2>
        <div className='pet-buttons'>
        {Object.entries(GameActions).map(([el, v]) => (
          <button id={`${v}-action`} className="pet-button" key={`${v}-action`} onClick={() => handleAction(v)}>{el}</button>
        ))}
        </div>
      </section>
      <section className="stats-grid">
        {
          Object.keys(stats).map((stat: string) => (
            <div key={`stat-${stat}`} className="stat stat-bar">
              <div className="stat-header">
                <div className="stat-label">
                  <span className="stat-icon">
                  A
                  </span>
                  <span className="stat-name">{`${stat[0].toUpperCase()}${stat.slice(1)}`}</span>
                </div>
                <div className="stat-value">
                  {stats[stat]}%
                </div>
              </div>
              <div className="stat-progress">
                <div className={`stat-fill ${processPrefix(stat, stat === 'hunger')}`} style={{ width: `${stats[stat]}%` }}/>
              </div>
            </div>
          ))
        }
        
      </section>
    </>
  )
}

export const PetGame = () => {
  const [petName, setPetName] = useState<string>('Muhtar')

  return (
    <main>
      {!petName &&<GreatingsPage callback={setPetName}/>}
      {petName && <GameBoard name={petName}/>}
    </main>
  )
};