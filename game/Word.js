import Letter from './Letter';

class Word {
  constructor(word) {
    // create an array of letter objects from the word
    this.letters = word.split('').map(character => new Letter(character));
  }

  solution() {
    // create an array of only the characters of the word object and join them together to display in the terminal when user loses
    const fullWord = this.letters.map(letter => letter.solution());
    return fullWord.join('');
  }

  toString() {
    // will display every char in word as string separated by a space so underscores don't get bunched up
    return this.letters.join(' ');
  }

  // loop through letter objects by passing in the character the user selects
  guessLetter(character) {
    let foundLetter = false;
    this.letters.forEach(letter => {
      // for each letter object if the guessLetter method returns true set foundLetter to true
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
    // a win happens when every letter object isLetter flag is set to true
    return this.letters.every(letter => letter.isLetter);
  }
}

export default Word;
