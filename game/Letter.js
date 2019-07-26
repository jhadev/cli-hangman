class Letter {
  constructor(character) {
    // whether letter is displayed as letter in the terminal
    this.isLetter = !/[a-z1-9]/i.test(character);
    // the actual character from the word itself
    this.character = character;
  }

  // if isLetter is true display the character else display an underscore
  toString() {
    return this.isLetter ? this.character : '_';
  }

  // return the character itself
  solution() {
    return this.character;
  }

  // if the uppercase guessed letter = the uppercase character, display it on the terminal
  guessLetter(guess) {
    if (guess.toUpperCase() === this.character.toUpperCase()) {
      this.isLetter = true;
      return true;
    }

    return false;
  }
}

export default Letter;
