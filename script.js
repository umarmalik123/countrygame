let guessedCountries = [];
let totalCountries = Object.values(countries).flat().length;

let letterProgress = {};

function initializeLetterProgress() {
    for (let letter in countries) {
        letterProgress[letter] = {
            total: countries[letter].length,
            guessed: 0
        };
    }
}

function updateLetterBreakdown() {
    const breakdownContainer = document.getElementById('letter-breakdown');
    breakdownContainer.innerHTML = '';

    for (let letter in letterProgress) {
        const letterDiv = document.createElement('div');
        letterDiv.className = 'letter-progress';
        
        const labelSpan = document.createElement('span');
        labelSpan.className = 'letter-label';
        labelSpan.textContent = `${letter}: ${letterProgress[letter].guessed}/${letterProgress[letter].total}`;
        
        const blocksDiv = document.createElement('div');
        blocksDiv.className = 'letter-blocks';
        
        for (let i = 0; i < letterProgress[letter].total; i++) {
            const block = document.createElement('div');
            block.className = i < letterProgress[letter].guessed ? 'block filled' : 'block';
            blocksDiv.appendChild(block);
        }
        
        letterDiv.appendChild(labelSpan);
        letterDiv.appendChild(blocksDiv);
        breakdownContainer.appendChild(letterDiv);
    }
}

// Function to display messages
function displayMessage(message) {
    document.getElementById('messages').innerHTML = message;
}

// Modify the checkCountry function
function checkCountry(guess) {
    console.log(`Checking country: ${guess}`);
    
    // Normalize the guess
    const normalizedGuess = normalizeCountryName(guess);
    console.log(`Normalized guess: ${normalizedGuess}`);

    // Find the closest match
    const match = findClosestMatch(normalizedGuess);
    console.log(`Closest match: ${match}`);

    if (match) {
        if (!guessedCountries.includes(match)) {
            guessedCountries.push(match);
            const firstLetter = match.charAt(0).toUpperCase();
            letterProgress[firstLetter].guessed++;
            updateProgressBar();
            updateLetterBreakdown();
            const flag = getCountryFlag(match);
            const fact = countryFacts[match] || 'No fact available for this country.';
            displayMessage(`✅<br><b>${match} ${flag} is correct!</b><br><i>💡${fact}</i>`);
            console.log(`Added ${match} to guessed countries`);
            saveProgress(); // Add this line to auto-save
            updatePlayersProgress();
        } else {
            displayMessage(`😬<br>${match} has already been guessed.`);
            console.log(`${match} was already guessed`);
        }
    } else {
        displayMessage(`❌<br>No match found for ${guess}.`);
        console.log(`No match found for ${guess}`);
    }
    
    console.log(`Updated guessed countries:`, guessedCountries);
}

function normalizeCountryName(name) {
    return name.toLowerCase()
        .replace(/^(north|south|east|west)\s/, '')
        .replace(/^s\.?\s/, 'south ')
        .replace(/^n\.?\s/, 'north ')
        .replace(/^e\.?\s/, 'east ')
        .replace(/^w\.?\s/, 'west ')
        .trim();
}

const fuseOptions = {
    includeScore: true,
    threshold: 0.2,
    keys: ['name']
};

const countryList = Object.values(countries).flat().map(country => ({ name: country }));
const fuse = new Fuse(countryList, fuseOptions);

function findClosestMatch(guess) {
    const results = fuse.search(guess);
    return results.length > 0 ? results[0].item.name : null;
}

// Add this new function to get the country flag
function getCountryFlag(countryName) {
    
    const code = countryToCode[countryName];
    if (!code) return '';
    
    // Convert country code to regional indicator symbols
    return code.toUpperCase().replace(/./g, char => 
        String.fromCodePoint(char.charCodeAt(0) + 127397)
    );
}

// Function to update the progress bar
function updateProgressBar() {
    const progress = (guessedCountries.length / totalCountries) * 100;
    const progressBar = document.querySelector('#progress-bar > div');
    const progressPercentage = document.getElementById('progress-percentage');
    
    progressBar.style.width = `${progress}%`;
    progressPercentage.textContent = `${Math.round(progress)}%`;
}

// Event listeners for buttons
document.getElementById('guess-button').addEventListener('click', () => {
    const guess = document.getElementById('guess-input').value.trim();
    if (guess.length >= 3) {
        checkCountry(guess);
        document.getElementById('guess-input').value = '';
    } else {
        displayMessage('❌<br>Please enter at least 3 letters.');
    }
});

document.getElementById('list-button').addEventListener('click', () => {
    displayGuessedCountries();
    document.getElementById('list-button').style.display = 'none';
    document.getElementById('hide-list-button').style.display = 'inline-block';
});

document.getElementById('hide-list-button').addEventListener('click', () => {
    document.getElementById('guessed-countries').innerHTML = '';
    document.getElementById('list-button').style.display = 'inline-block';
    document.getElementById('hide-list-button').style.display = 'none';
});

// Initialize the game
function initializeGame() {
    guessedCountries = [];
    initializeLetterProgress();
    updateProgressBar();
    updateLetterBreakdown();
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', initializeGame);

function displayGuessedCountries() {
    const guessedList = document.getElementById('guessed-countries');
    guessedList.innerHTML = '<h3>Guessed Countries:</h3>';
    guessedList.innerHTML += guessedCountries.join(', ');
}

function updateGuessButton() {
    const guessInput = document.getElementById('guess-input');
    const guessButton = document.getElementById('guess-button');
    guessButton.disabled = guessInput.value.trim().length < 3;
}

// Modify the DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    
    // Add event listener for input changes
    document.getElementById('guess-input').addEventListener('input', updateGuessButton);
    
    // Initial button state
    updateGuessButton();
});

let playerName = '';

// Add this new function
function updatePlayerName() {
    const nameInput = document.getElementById('player-name');
    playerName = nameInput.value.trim();
    // Removed the welcome message
}

// Modify the startNewGame function
function startNewGame() {
    // Show a confirmation dialog
    if (confirm("Are you sure you want to start a new game? Your current progress will be lost!")) {
        updatePlayerName();
        if (playerName) {
            localStorage.removeItem(playerName);
            initializeGame();
            displayMessage(`Welcome, ${playerName}! Let's start a new game.`);
            updatePlayersProgress();
        } else {
            displayMessage('Please enter your name to start a new game.');
        }
    }
    // If the user clicks "Cancel" in the confirmation dialog, nothing happens
}

function resumeGame() {
    updatePlayerName(); // Add this line
    if (playerName) {
        const savedProgress = localStorage.getItem(playerName);
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            guessedCountries = progress.guessedCountries;
            letterProgress = progress.letterProgress;
            updateProgressBar();
            updateLetterBreakdown();
            displayMessage(`👋 Welcome back, ${playerName}! Your progress is waiting. Let\'s conquer more countries!`);
        } else {
            displayMessage(`🌍 Welcome ${playerName}! Your adventure begins here. Let\'s start discovering new countries!`);
            initializeGame();
        }
        updatePlayersProgress(); // Add this line
    } else {
        displayMessage('Please enter your name to resume your game.');
    }
}

function saveProgress() {
    if (playerName) {
        const progress = {
            guessedCountries: guessedCountries,
            letterProgress: letterProgress
        };
        localStorage.setItem(playerName, JSON.stringify(progress));
        console.log(`Progress saved for ${playerName}.`);
    }
}

// Modify the DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    
    document.getElementById('guess-input').addEventListener('input', updateGuessButton);
    document.getElementById('player-name').addEventListener('input', updatePlayerName); // Add this line
    document.getElementById('new-game-button').addEventListener('click', startNewGame);
    document.getElementById('resume-game-button').addEventListener('click', resumeGame);
    // Remove the following line:
    // document.getElementById('save-progress-button').addEventListener('click', saveProgress);
    
    updateGuessButton();
    updatePlayersProgress(); // Add this line
});

function updatePlayersProgress() {
    const playersProgressDiv = document.getElementById('players-progress');
    playersProgressDiv.innerHTML = '';

    let playersData = [];

    for (let i = 0; i < localStorage.length; i++) {
        const playerName = localStorage.key(i);
        const savedProgress = JSON.parse(localStorage.getItem(playerName));
        
        if (savedProgress && savedProgress.guessedCountries) {
            const progressPercentage = Math.round(savedProgress.guessedCountries.length / totalCountries * 100);
            playersData.push({
                name: playerName,
                percentage: progressPercentage,
                count: savedProgress.guessedCountries.length
            });
        }
    }

    // Sort players by percentage in descending order
    playersData.sort((a, b) => b.percentage - a.percentage);

    playersData.forEach((player, index) => {
        const playerDiv = document.createElement('div');
        playerDiv.innerHTML = `${index + 1}. <strong>${player.name}</strong>: ${player.percentage}% (${player.count}/${totalCountries} countries)`;
        playersProgressDiv.appendChild(playerDiv);
    });
}