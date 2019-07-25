import inquirer from 'inquirer';
import handlePromise from '../utils/promiseHandler';
import { guessPrompt, playPrompt } from '../utils/prompts';
import Word from './Word';
import words from './words';

class Hangman {
  constructor() {
    this.guessesLeft = 10;
    this.currentWord = {};
    this.selectedLetters = [];
    this.wins = 0;
    this.losses = 0;
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
    const answer = await handlePromise(inquirer.prompt(guessPrompt));

    const [answerError, answerSuccess] = answer;

    if (answerError) {
      console.log(answerError);
      return;
    }

    if (answerSuccess) {
      const { letterChoice } = answerSuccess;
      const hasLetterBeenChosen = this.wasLetterChosen(letterChoice);

      if (hasLetterBeenChosen) {
        console.log(`  ${letterChoice} has already been chosen try again`);
        return;
      }

      if (letterChoice.length > 1) {
        console.log(
          `  You can only select one letter at a time... please try again.`
        );
        return;
      }

      const isCorrectGuess = this.currentWord.guessLetter(letterChoice);

      if (isCorrectGuess) {
        this.selectedLetters.push(letterChoice.toLowerCase());
        console.log(`  DING DING DING! CORRECT!`);
      } else {
        this.selectedLetters.push(letterChoice.toLowerCase());
        this.guessesLeft -= 1;
        console.log(
          `  INCORRECT! UH OH, the hangman lost a vital organ and/or body part!`
        );
        console.log(`  ${this.guessesLeft} guesses left...`);
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
        this.losses += 1;
        console.log(`
  No guesses left...
  The word was ${this.currentWord.solution()}`);
        console.log(`
  You have committed murder ${this.losses} time(s).
  RIP Hangman.
          `);
        this.playAgain();
      } else if (this.currentWord.correctGuess()) {
        this.wins += 1;
        console.log(`  You won!, the hangman has been spared.`);
        console.log(`  You have saved the hangman ${this.wins} time(s).`);
        this.guessesLeft = 10;
        this.nextWord();
      } else {
        this.makeGuess();
      }
    });
  }

  async playAgain() {
    const answer = await handlePromise(inquirer.prompt(playPrompt));

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
    console.log(`Wins: ${this.wins}`);
    console.log(`Losses: ${this.losses}`);
    process.exit(0);
  }
}

export default Hangman;
