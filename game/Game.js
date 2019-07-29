import moment from 'moment';
import { readFileSync, writeFileSync } from 'fs';
const highScorePath = './logs/highScore.txt';

class Game {
  constructor(title, instructions) {
    this.wins = 0;
    this.losses = 0;
    this.score = 0;
    this.gamesPlayed = 0;
    this.avgGuessesToWin = 0;
    this.highScore = 0;
    this.guessesLeft = 10;
    this.title = title;
    this.winStreak = 0;
    this.winStreakBonusCount = 0;
    this.instructions = instructions;
    this.lossPoints = 5;
    this.winStreakBonus = 10;
    this.winsNeededToGetBonus = 5;
  }

  displayTitle() {
    return console.log(this.title);
  }

  displayInstructions() {
    return console.log(this.instructions);
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

  winStreakBonusCheck(num) {
    if (this.winStreak === num) {
      this.winStreakBonusCount += 1;
      this.score += this.winStreakBonus;
      this.winStreak = 0;
      console.log(
        `  You are saving lives! Here's an extra 10 points for saving ${num} in a row.`
      );
    }
    return;
  }

  handleWin() {
    this.wins += 1;
    this.winStreak += 1;
    this.gamesPlayed += 1;
    this.score += this.guessesLeft;
  }

  handleLoss() {
    this.winStreak = 0;
    this.losses += 1;
    this.gamesPlayed += 1;
    this.score -= this.lossPoints;
  }

  calculateScore(arg) {
    if (arg === 'win') {
      this.handleWin();
      this.winStreakBonusCheck(this.winsNeededToGetBonus);
      // maybe move this??
      this.avgGuessesToWin =
        (this.wins * 10 -
          (this.score +
            this.losses * this.lossPoints -
            this.winStreakBonusCount * this.winStreakBonus)) /
        this.wins;
    } else {
      this.handleLoss();
    }
    this.checkHighScore();
  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  avgGuess() {
    return this.wins === 0 ? 'N/A' : this.avgGuessesToWin.toFixed(2);
  }
}

export default Game;
