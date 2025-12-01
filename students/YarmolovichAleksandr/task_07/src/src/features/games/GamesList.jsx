import GameCard from './GameCard'
import './GamesList.css'

const GamesList = ({ games }) => {
  if (games.length === 0) {
    return (
      <div className="empty-state">
        <h3>Игры не найдены</h3>
        <p>Попробуйте изменить параметры поиска или добавьте первую игру</p>
      </div>
    )
  }

  return (
    <div className="games-list">
      {games.map(game => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  )
}

export default GamesList