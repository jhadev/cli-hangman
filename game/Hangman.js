import inquirer from 'inquirer';
import Word from './Word';
import words from './words';

class Hangman {
  constructor() {
    this.guessesLeft = 10;
    this.currentWord = {};
  }

  playGame() {
    this.guessesLeft = 10;
    this.nextWord();
  }

  nextWord() {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    this.currentWord = new Word(randomWord);
    console.log(`
    ${this.currentWord}
    `);
    this.makeGuess();
  }

  async askForLetter() {
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'letterChoice',
        message: 'Guess a letter',
        validate: value => /[a-z1-9]/gi.test(value)
      }
    ]);

    if (answer) {
      const isCorrectGuess = this.currentWord.guessLetter(answer.letterChoice);
      if (isCorrectGuess) {
        console.log(`CORRECT`);
      } else {
        this.guessesLeft -= 1;
        console.log(`INCORRECT`);
        console.log(`${this.guessesLeft} guesses left...`);
      }
    }
  }

  makeGuess() {
    this.askForLetter().then(() => {
      if (this.guessesLeft < 1) {
        console.log(
          `No guesses left... The word was ${this.currentWord.solution()}`
        );
        this.playAgain();
      } else if (this.currentWord.correctGuess()) {
        console.log(`WINNER WINNER!`);
        this.guessesLeft = 10;
        this.nextWord();
      } else {
        this.makeGuess();
      }
    });
  }

  async playAgain() {
    const answer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'choice',
        message: 'Play Again?'
      }
    ]);

    if (answer) {
      if (answer.choice) {
        this.playGame();
      } else {
        this.quitGame();
      }
    }
  }

  quitGame() {
    console.log(`Hangman out!`);
    process.exit(0);
  }
}

export default Hangman;
