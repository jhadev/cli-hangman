import Letter from './Letter';

class Word {
  constructor(word) {
    this.letters = word.split('').map(character => new Letter(character));
  }

  solution() {
    const word = this.letters.map(letter => letter.solution());
    return word.join('');
  }

  toString() {
    return this.letters.join(' ');
  }

  guessLetter(character) {
    let foundLetter = false;
    this.letters.forEach(letter => {
      if (letter.guessLetter(character)) {
        foundLetter = true;
      }
    });

    console.log(`
    ${this}
    `);

    return foundLetter;
  }

  correctGuess() {
    return this.letters.every(letter => letter.isLetter);
  }
}

export default Word;
