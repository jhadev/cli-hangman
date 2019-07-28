import moment from 'moment';
import { readFileSync, writeFileSync } from 'fs';
const highScorePath = './logs/highScore.txt';

class Game {
  constructor() {
    this.wins = 0;
    this.losses = 0;
    this.score = 0;
    this.gamesPlayed = 0;
    this.avgGuessesToWin = 0;
    this.highScore = 0;
    this.guessesLeft = 10;
  }

  checkHighScore() {
    // FIXME: this is messy
    const now = moment().format('dddd MMMM Do YYYY h:mm:ss a');
    const scoreData = `${this.score},${now}`;
    try {
      const highScoreFile = readFileSync(highScorePath);

      if (highScoreFile) {
        const arr = highScoreFile.toString().split(',');
        const [highScore, date] = arr;

        if (highScore) {
          if (this.score > parseInt(highScore)) {
            this.highScore = this.score;
            try {
              console.log(
                `  You've beaten the high score of ${parseInt(
                  highScore
                )} logged on ${date}!`
              );
              writeFileSync(highScorePath, scoreData);
            } catch (err) {
              console.log(err);
            }
          } else {
            this.highScore = parseInt(highScore);
          }
        } else {
          this.highScore = this.score;
          try {
            writeFileSync(highScorePath, scoreData);
          } catch (err) {
            console.log(err);
          }
        }
      }
    } catch (err) {
      console.log(
        `\n  Please create a file named highScore.txt in the logs folder to keep track of high scores and make this message go away. `
      );
    }
  }

  calculateScore(arg) {
    if (arg === 'win') {
      this.score += this.guessesLeft;
      this.avgGuessesToWin =
        (this.wins * 10 - (this.score + this.losses * 2)) / this.wins;
    } else {
      this.score -= 2;
    }
    this.checkHighScore();
  }

  avgGuess() {
    return this.wins === 0 ? 'N/A' : this.avgGuessesToWin.toFixed(2);
  }
}

export default Game;
