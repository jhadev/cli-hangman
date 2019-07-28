import Hangman from './Hangman';

class Score extends Hangman {
  constructor() {
    super();

    this.wins = 0;
    this.losses = 0;
    this.score = 0;
    this.gamesPlayed = 0;
    this.avgGuessesToWin = 0;
    this.highScore = 0;
  }
}

export default Score;
