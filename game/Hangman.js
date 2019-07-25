import inquirer from 'inquirer';
import handlePromise from '../utils/promiseHandler';
import Word from './Word';
import words from './words';

class Hangman {
  constructor() {
    this.guessesLeft = 10;
    this.currentWord = {};
    this.selectedLetters = [];
  }

  playGame() {
    this.guessesLeft = 10;
    this.nextWord();
  }

  nextWord() {
    this.selectedLetters = [];
    const randomWord = words[Math.floor(Math.random() * words.length)];
    this.currentWord = new Word(randomWord);
    console.log(`
    ${this.currentWord}
    `);
    this.makeGuess();
  }

  async askForLetter() {
    const answer = await handlePromise(
      inquirer.prompt([
        {
          type: 'input',
          name: 'letterChoice',
          message: 'Guess a letter',
          validate: value => /[a-z1-9]/gi.test(value)
        }
      ])
    );

    const [answerError, answerSuccess] = answer;

    if (answerError) {
      console.log(answerError);
      return;
    }

    if (answerSuccess) {
      const { letterChoice } = answerSuccess;
      const hasLetterBeenChosen = this.wasLetterChosen(letterChoice);

      if (hasLetterBeenChosen) {
        console.log('Letter has already been chosen try again');
      } else {
        const isCorrectGuess = this.currentWord.guessLetter(letterChoice);

        if (isCorrectGuess) {
          this.selectedLetters.push(letterChoice.toLowerCase());
          console.log(`CORRECT`);
        } else if (letterChoice.length > 1) {
          console.log(
            `You can only select one letter at a time... please try again.`
          );
        } else {
          this.selectedLetters.push(letterChoice.toLowerCase());
          this.guessesLeft -= 1;
          console.log(`INCORRECT`);
          console.log(`${this.guessesLeft} guesses left...`);
        }
      }
    }
  }

  wasLetterChosen(letter) {
    if (this.selectedLetters.includes(letter.toLowerCase())) {
      return true;
    }

    return false;
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
    const answer = await handlePromise(
      inquirer.prompt([
        {
          type: 'confirm',
          name: 'choice',
          message: 'Play Again?'
        }
      ])
    );

    const [answerError, answerSuccess] = answer;

    if (answerError) {
      console.log(answerError);
      return;
    }

    if (answerSuccess) {
      const { choice } = answerSuccess;
      if (choice) {
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
