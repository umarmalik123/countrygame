import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';

const supabaseUrl = 'https://fewmxheuuyotbfcklkcf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZld214aGV1dXlvdGJmY2tsa2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUwNDA5NDksImV4cCI6MjA0MDYxNjk0OX0.0XcBvmtxCKWU7deN5uz8q58f6gcJ-OdkrH9jB0mbkNg';

// Initialize the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

import { countries, countryToCode, countryFacts, countryHints, countryNot } from './countryData.js';

let guessedCountries = [];
let totalCountries = Object.values(countries).flat().length;

let letterProgress = {};
let hintIndices = {};

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
        
        // Add hint button
        const hintButton = document.createElement('button');
        hintButton.className = 'hint-button';
        hintButton.innerHTML = '💡';
        hintButton.addEventListener('click', () => showHint(letter));
        
        // Check if there are unguessed countries for this letter
        const unguessedCountries = countries[letter].filter(country => !guessedCountries.includes(country));
        if (unguessedCountries.length === 0) {
            hintButton.style.display = 'none'; // Hide the button if no unguessed countries
        }
        
        blocksDiv.appendChild(hintButton);
        
        letterDiv.appendChild(labelSpan);
        letterDiv.appendChild(blocksDiv);
        breakdownContainer.appendChild(letterDiv);
    }
}

function showHint(letter) {
    const unguessedCountries = countries[letter].filter(country => !guessedCountries.includes(country));
    if (unguessedCountries.length > 0) {
        if (!hintIndices[letter]) {
            hintIndices[letter] = 0;
        }
        const currentCountry = unguessedCountries[hintIndices[letter]];
        const hint = countryHints[currentCountry];
        displayMessage(`💡 Hint for a country starting with "${letter}": ${hint}`);
        
        // Move to the next hint index, or back to 0 if we've reached the end
        hintIndices[letter] = (hintIndices[letter] + 1) % unguessedCountries.length;
    } else {
        displayMessage(`🎉 Awesome! You've guessed all countries starting with "${letter}".`);
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

    // Check if the guess is in the countryNot list (case-insensitive)
    const notCountryKey = Object.keys(countryNot).find(key => key.toLowerCase() === normalizedGuess.toLowerCase());
    if (notCountryKey) {
        displayMessage(`❌<br><i>${countryNot[notCountryKey]}</i>`);
        console.log(`${notCountryKey} is in the countryNot list`);
        return;
    }

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
            const fact = countryFacts[match] || 'Oops! No fact available for this country.';
            displayMessage(`✅<br><b>${match} ${flag} is correct!</b><br><i>💡${fact}</i>`);
            console.log(`Added ${match} to guessed countries`);
            saveProgress();
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

    // Clear the input field and update the guess button state
    document.getElementById('guess-input').value = '';
    updateGuessButton();
}

function normalizeCountryName(name) {
    return name.toLowerCase()
        .replace(/^(s\.?|south)\s(korea|sudan)/, 'south $2')
        .replace(/^(n\.?|north)\s(korea|macedonia)/, 'north $2')
        .replace(/^(e\.?|east)\s(timor)/, 'east $2')
        .replace(/^(w\.?|west)\s(sahara)/, 'west $2')
        .trim();
}

const fuseOptions = {
    includeScore: true,
    threshold: 0.2,
    keys: ['name']
};

let fuse;

function initializeFuse() {
    const countryList = Object.values(countries).flat().map(country => ({ name: country }));
    fuse = new Fuse(countryList, fuseOptions);
}

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
    const progress = Math.round((guessedCountries.length / totalCountries) * 100);
    const progressBar = document.querySelector('#progress-bar > div');
    const progressPercentage = document.getElementById('progress-percentage');
    
    progressBar.style.width = `${progress}%`;
    progressPercentage.textContent = `${progress}%`;
}

// Event listeners for buttons
document.getElementById('guess-button').addEventListener('click', () => {
    const guess = document.getElementById('guess-input').value.trim();
    if (guess.length >= 3) {
        checkCountry(guess);
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

// Modify the initializeGame function
function initializeGame() {
    guessedCountries = [];
    initializeLetterProgress();
    updateProgressBar();
    updateLetterBreakdown();
}

// Add this function call at the end of your script
document.addEventListener('DOMContentLoaded', initializeGame);

function displayGuessedCountries() {
    const guessedList = document.getElementById('guessed-countries');
    guessedList.innerHTML = '<h3>Guessed Countries:</h3>';
    
    if (guessedCountries.length === 0) {
        guessedList.innerHTML += 'Zero guesses so far. Start naming those countries above!';
    } else {
        // Sort the guessedCountries array alphabetically
        const sortedCountries = [...guessedCountries].sort((a, b) => a.localeCompare(b));
        guessedList.innerHTML += sortedCountries.join(', ');
    }
}

function updateGuessButton() {
    const guessInput = document.getElementById('guess-input');
    const guessButton = document.getElementById('guess-button');
    guessButton.disabled = guessInput.value.trim().length < 4;
}

// Modify the DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    updateGuessButton();
    updatePlayersProgress();

    document.getElementById('guess-input').addEventListener('input', updateGuessButton);
    document.getElementById('guess-input').addEventListener('keyup', function(event) {
        if (event.key === 'Enter' && this.value.trim().length >= 4) {
            document.getElementById('guess-button').click();
        }
        // Enable or disable the guess button based on input length
        document.getElementById('guess-button').disabled = this.value.trim().length < 4;
    });
    
    document.getElementById('player-name').addEventListener('input', updatePlayerName);
    document.getElementById('new-game-button').addEventListener('click', startNewGame);
    document.getElementById('resume-game-button').addEventListener('click', resumeGame);
    document.getElementById('help-button').addEventListener('click', function() {
        const instructions = document.getElementById('instructions');
        if (instructions.style.display === 'none') {
            instructions.style.display = 'block';
            this.textContent = 'X';
        } else {
            instructions.style.display = 'none';
            this.textContent = '?';
        }
    });

    initializeFuse();
});

let playerName = '';

// Add this new function
function updatePlayerName() {
    const nameInput = document.getElementById('player-name');
    playerName = nameInput.value.trim().toLowerCase(); // Convert to lowercase
}

// Modify the startNewGame function
async function startNewGame() {
    // Show a confirmation dialog
    if (confirm("Are you sure you want to start a new game? Your current progress will be lost!")) {
        updatePlayerName();
        if (playerName) {
            try {
                // Delete the player's progress from Supabase
                const { error } = await supabase
                    .from('player_progress')
                    .delete()
                    .eq('player_name', playerName);

                if (error) throw error;

                initializeGame();
                updatePlayersProgress();
                displayMessage(`🌍 Welcome ${playerName}! Your new adventure begins here.`);
            } catch (error) {
                console.error('Error starting new game:', error);
                displayMessage('An error occurred while starting a new game. Please try again.');
            }
        } else {
            displayMessage('Please enter your name to start a new game.');
        }
    }
    // If the user clicks "Cancel" in the confirmation dialog, nothing happens
}

async function resumeGame() {
    updatePlayerName();
    if (playerName) {
        try {
            const { data, error } = await supabase
                .from('player_progress')
                .select('progress')
                .eq('player_name', playerName.toLowerCase())
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No data found, start a new game
                    const displayName = playerName.charAt(0).toUpperCase() + playerName.slice(1);
                    displayMessage(`🌍 Welcome ${displayName}!<br>Your adventure begins here. Let's start discovering new countries!`);
                    initializeGame();
                } else {
                    throw error;
                }
            }

            const displayName = playerName.charAt(0).toUpperCase() + playerName.slice(1);
            if (data && data.progress) {
                const progress = data.progress;
                guessedCountries = progress.guessedCountries;
                letterProgress = progress.letterProgress;
                updateProgressBar();
                updateLetterBreakdown();
                displayMessage(`👋 Welcome back, ${displayName}!<br>Your progress is waiting. Let's conquer more countries!`);
            } else {
                displayMessage(`🌍 Welcome ${displayName}!<br>Your adventure begins here. Let's start discovering new countries!`);
                initializeGame();
            }
        } catch (error) {
            console.error('Error resuming game:', error);
            displayMessage('An error occurred while resuming the game. Please try again.');
            initializeGame();
        }
        updatePlayersProgress();
    } else {
        displayMessage('🌍 Enter your name to start or resume your conquest!');
    }
}

async function saveProgress() {
    const playerName = document.getElementById('player-name').value.trim().toLowerCase();
    if (!playerName) return;

    const progress = {
        guessedCountries: guessedCountries,
        letterProgress: letterProgress
    };

    try {
        const { data, error } = await supabase
            .from('player_progress')
            .upsert({ player_name: playerName, progress: progress }, { onConflict: 'player_name' });

        if (error) throw error;
        console.log('Progress saved to Supabase');
    } catch (error) {
        console.error('Error saving progress:', error);
        displayMessage('An error occurred while saving progress. Please try again.');
    }
}

async function updatePlayersProgress() {
    console.log('Updating players progress...');
    const playersProgressDiv = document.getElementById('players-progress');
    playersProgressDiv.innerHTML = '';

    try {
        const { data, error } = await supabase
            .from('player_progress')
            .select('player_name, progress');

        if (error) throw error;

        console.log('Received data from Supabase:', data);

        let playersData = data.map(player => {
            const progressPercentage = Math.round(player.progress.guessedCountries.length / totalCountries * 100);
            return {
                name: player.player_name,
                percentage: progressPercentage,
                count: player.progress.guessedCountries.length
            };
        });

        // Sort players by count (number of countries guessed) in descending order
        playersData.sort((a, b) => b.count - a.count);

        playersData.forEach((player, index) => {
            const playerDiv = document.createElement('div');
            // Capitalize the first letter of the name for display
            const displayName = player.name.charAt(0).toUpperCase() + player.name.slice(1);
            playerDiv.innerHTML = `${index + 1}. <strong>${displayName}</strong>: ${player.count}/${totalCountries} countries (${player.percentage}%)`;
            playersProgressDiv.appendChild(playerDiv);
        });
    } catch (error) {
        console.error('Error updating players progress:', error);
        playersProgressDiv.innerHTML = 'Error loading leaderboard. Please try again later.';
    }
}