async function loadData() {
    try {
        const response = await fetch('songs/concat_songs_non_VS.json'); // Pauses here until fetch completes
        const data = await response.json();       // Pauses again for JSON parsing
        console.log("Data loaded:", data);

        // ✅ Now you can safely use `data` here
        return data
    } catch (error) {
        console.error("Failed to load JSON:", error);
    }
}

let SongDict;
let ArrGuesses = [];

const order = [145, 192, 9, 112, 98, 328, 210, 316, 160, 200, 295, 375, 298, 23, 317, 228, 162, 333, 75, 390, 4, 242, 330, 281, 190, 346, 279, 231, 154, 172, 18, 186, 226, 134, 363, 120, 15, 68, 81, 287, 351, 188, 33, 48, 246, 111, 404, 272, 181, 116, 241, 62, 90, 126, 319, 326, 16, 347, 236, 388, 108, 114, 371, 63, 310, 359, 392, 321, 255, 60, 19, 96, 194, 143, 140, 193, 196, 256, 136, 12, 178, 305, 209, 381, 32, 275, 2, 400, 185, 72, 224, 268, 55, 258, 69, 182, 1, 247, 325, 73, 117, 267, 45, 357, 204, 30, 260, 79, 345, 65, 269, 132, 306, 164, 215, 213, 28, 74, 257, 212, 201, 235, 252, 129, 189, 52, 389, 262, 332, 244, 156, 34, 406, 361, 386, 411, 10, 219, 158, 264, 384, 93, 77, 349, 322, 94, 280, 205, 365, 277, 285, 175, 67, 197, 320, 41, 214, 238, 176, 261, 85, 167, 26, 40, 245, 110, 165, 153, 339, 399, 157, 270, 20, 353, 291, 369, 104, 372, 393, 102, 184, 344, 61, 315, 133, 155, 380, 151, 179, 311, 340, 397, 44, 163, 170, 409, 218, 31, 253, 91, 229, 59, 341, 195, 334, 83, 169, 259, 101, 47, 412, 146, 342, 202, 329, 119, 254, 379, 71, 17, 168, 354, 174, 57, 410, 147, 314, 87, 89, 53, 177, 187, 138, 266, 8, 398, 171, 128, 121, 54, 217, 323, 159, 113, 82, 271, 206, 36, 58, 237, 294, 370, 122, 337, 352, 336, 300, 118, 243, 29, 22, 308, 24, 208, 106, 27, 76, 276, 109, 297, 373, 265, 402, 152, 99, 95, 80, 191, 173, 3, 37, 383, 39, 331, 360, 66, 293, 309, 141, 38, 216, 239, 64, 225, 303, 86, 292, 150, 124, 198, 251, 395, 137, 97, 278, 5, 289, 107, 240, 103, 13, 115, 46, 367, 100, 248, 21, 307, 199, 296, 43, 376, 301, 25, 180, 92, 408, 232, 230, 125, 401, 385, 250, 51, 396, 130, 161, 407, 249, 144, 11, 207, 7, 377, 84, 127, 220, 284, 313, 166, 148, 283, 382, 387, 343, 368, 223, 364, 378, 302, 350, 405, 391, 203, 394, 290, 324, 123, 348, 221, 356, 286, 299, 263, 211, 142, 222, 374, 131, 403, 273, 139, 362, 183, 149, 312, 355, 78, 358, 304, 35, 42, 233, 327, 338, 282, 234, 105, 227, 50, 366, 14, 288, 49, 6, 318, 335, 274, 70, 56, 88, 135, 0]

const STARTDATE = "2025-08-04";

const OFFSET = 3;

const searchInput = document.getElementById('search-input');
const suggestionsContainer = document.getElementById('suggestions');
const submitBtn = document.getElementById('submit-btn');
const skipBtn = document.getElementById('skip-btn');

// Array to keep track of wrong guesses
let wrongGuesses = [];
const wrongGuessSecondsReceived = [1, 2, 3, 4, 5]
const wrongGuessSecondsCumulative = [1, 2, 4, 7, 11, 16, 16]

// Current answer
let Number = order[daysSinceStartDate()];
let Answer;
let URL;
let mode = "Daily";

// popup
let ucpopup;

// countdown recording
let countdown;

const btnPlay = document.getElementById('btnPlay');
const progressBar = document.getElementById('progressBar');
const currentTimeDisplay = document.getElementById('currentTime');
const durationDisplay = document.getElementById('duration');

let player;
let isPlaying = false;
let playTimer;
let progressInterval;
const maxDuration = 16; // Progress bar goes up to 16 seconds

// Initialize the player
function initPlayer() {
    const iframe = document.createElement('iframe');
    // Replace iframe.style.display = 'none' with:
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.style.position = 'absolute';
    iframe.style.visibility = 'hidden';
    iframe.allow = "encrypted-media; autoplay";
    iframe.src = 'https://w.soundcloud.com/player/?url=' + URL + '&auto_play=false&buying=false&liking=false&download=false&sharing=false&show_artwork=false&show_comments=false&show_playcount=false&show_user=false&hide_related=true&visual=false';
    document.body.appendChild(iframe);

    player = SC.Widget(iframe);

    player.bind(SC.Widget.Events.READY, function () {
        console.log('Player is ready');
        durationDisplay.textContent = '0:16';
    });

    player.bind(SC.Widget.Events.ERROR, function (error) {
        console.log('Player error:', error);
    });
}

document.addEventListener('DOMContentLoaded', async function () {
    // Format seconds into MM:SS
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Update progress bar
    function updateProgress(currentTime) {
        const progressPercent = ((currentTime - OFFSET) / maxDuration) * 100;
        progressBar.style.width = `${progressPercent}%`;
        currentTimeDisplay.textContent = formatTime(currentTime - OFFSET);
    }

    // Play the first OFFSET seconds
    function playFirstFewSeconds() {
        player.seekTo(OFFSET * 1000);
        player.play();
        isPlaying = true;
        btnPlay.innerHTML = '&#10074;&#10074;';

        let currentTime = OFFSET;
        updateProgress(currentTime);

        progressInterval = setInterval(() => {
            currentTime += 0.1;
            updateProgress(currentTime);

            if (currentTime - OFFSET >= wrongGuessSecondsCumulative[wrongGuesses.length]) {
                stopPlayback();
            }
        }, 100);

        // Stop after OFFSET seconds
        playTimer = setTimeout(stopPlayback, (wrongGuessSecondsCumulative[wrongGuesses.length] + OFFSET) * 1000);
    }

    // Stop playback
    function stopPlayback() {
        clearInterval(progressInterval);
        clearTimeout(playTimer);
        player.pause();
        isPlaying = false;
        btnPlay.innerHTML = "&#9658;";
    }

    // Event listener for play button
    btnPlay.addEventListener('click', async function () {
        if (isPlaying) {
            stopPlayback();
        } else {
            // First resume any suspended AudioContext
            if (typeof player.resume === 'function') {
                await player.resume();
            }
            playFirstFewSeconds();
        }
    });

    SongDict = await loadData()

    console.log(SongDict)
    console.log(SongDict.length)

    for (let i = 0; i < SongDict.length; i++) {
        let singers = ""
        for (let j = 0; j < SongDict[i]["Singers"].length; j++) {
            singers += SongDict[i]["Singers"][j];
            if (j !== SongDict[i]["Singers"].length - 1){
                singers += ", "
            }
        }
        ArrGuesses.push(`${SongDict[i]["Song title"]} (${SongDict[i]["Producer"]}) - ${SongDict[i]["Unit"]}: ${singers}`);
    }

    Answer = ArrGuesses[Number];
    URL = SongDict[Number]['URL'];

    console.log(ArrGuesses);
    console.log(Answer);
    console.log(URL);

    // Initialize the player
    initPlayer();
});

// Function to check if input matches any item (case-insensitive)
function isValidInput(input) {
    return ArrGuesses.some(item =>
        item.toLowerCase() === input.toLowerCase().trim()
    );
}

function daysSinceStartDate() {
    // Parse the STARTDATE string into a Date object in UTC
    const startDate = new Date(STARTDATE);
    const startDateUTC = Date.UTC(
        startDate.getUTCFullYear(),
        startDate.getUTCMonth(),
        startDate.getUTCDate()
    );

    // Get current UTC date (with time set to midnight for accurate comparison)
    const now = new Date();
    const todayUTC = Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate()
    );

    // Calculate the difference in milliseconds
    const diffTime = todayUTC - startDateUTC;

    // Convert milliseconds to days
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Return 0 if negative (future date) or the day count
    return Math.max(0, diffDays);
}

// Function to filter items based on search input
function getSuggestions(searchTerm) {
    return ArrGuesses.filter(item =>
        item.toLowerCase().includes(searchTerm.toLowerCase())
    );
}

// Function to display suggestions
function showSuggestions(suggestions) {
    if (suggestions.length === 0 || searchInput.value === '') {
        suggestionsContainer.style.display = 'none';
        return;
    }

    suggestionsContainer.innerHTML = '';
    suggestions.forEach(suggestion => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.textContent = suggestion;
        div.addEventListener('click', () => {
            searchInput.value = suggestion;
            suggestionsContainer.style.display = 'none';
            validateInput();
        });
        suggestionsContainer.appendChild(div);
    });
    suggestionsContainer.style.display = 'block';
}

// Function to validate input and update UI
function validateInput() {
    const inputValue = searchInput.value.trim();
    const isValid = isValidInput(inputValue);

    // Update submit button state
    submitBtn.disabled = !isValid;

    // Update input border color
    if (inputValue === '') {
        searchInput.classList.remove('valid-input', 'invalid-input');
    } else {
        searchInput.classList.toggle('valid-input', isValid);
        searchInput.classList.toggle('invalid-input', !isValid);
    }
}

function checkGuess(inputValue) {
    // Get the input value (assuming INPUT is a variable containing the current guess)
    const guess = inputValue;

    // Check if the guess matches the ANSWER
    if (guess === Answer) {
        // Handle correct guess (you can add your logic here)
        console.log("Correct guess!");
        ucpopup = createUnclosablePopup(`You got today's Project Sekai Heardle within ${wrongGuessSecondsCumulative[wrongGuesses.length]} second(s).`, {
            title: 'Correct guess!',
            backgroundColor: '#f8d7da',
            textColor: '#721c24',
            guessed: true
        });
        return true;
    } else {
        // Add wrong guess to the array
        wrongGuesses.push(guess);

        // Set Guess Skip Number
        if (wrongGuesses.length < 5) {
            skipBtn.textContent = "Skip (+" + wrongGuessSecondsReceived[wrongGuesses.length] + "s)";
        } else {
            skipBtn.textContent = "Skip";
        }

        // Update HTML elements with wrong guesses
        for (let i = 0; i < Math.min(wrongGuesses.length, 6); i++) {
            const element = document.getElementById(`guess${i + 1}`);
            if (element) {
                element.textContent = wrongGuesses[i];
                if (i === Math.min(wrongGuesses.length, 6) - 1) {
                    element.classList.remove('col-sm-middle');
                    element.classList.add('col-sm-middle-guessed');
                }
            }
        }

        // light the next one
        console.log(wrongGuesses.length);
        const element = document.getElementById(`guess${wrongGuesses.length + 1}`);
        if (element) {
            element.classList.remove('col-sm-middle');
            element.classList.add('col-sm-middle-guessed');
        }

        if (wrongGuesses.length === 6) {
            const popup = createUnclosablePopup("You didn't get today's Project Sekai Heardle. Better luck tomorrow!", {
                title: 'Nice Try!',
                backgroundColor: '#f8d7da',
                textColor: '#721c24',
                guessed: false
            });
        }

        return false;
    }
}

// Function to handle the submitted input
function handleSubmit() {
    const inputValue = searchInput.value.trim();
    console.log('Submitted value:', inputValue);
    // You can do whatever you need with the input value here
    checkGuess(inputValue);
}

// Function to handle skipped guesses
function handleSkip() {
    console.log("Skipped Guess");
    checkGuess("Skipped...");
}

// Event listeners
searchInput.addEventListener('input', () => {
    const suggestions = getSuggestions(searchInput.value);
    showSuggestions(suggestions);
    validateInput();
});

searchInput.addEventListener('focus', () => {
    const suggestions = getSuggestions(searchInput.value);
    showSuggestions(suggestions);
    validateInput();
});

// Submit button click handler
submitBtn.addEventListener('click', handleSubmit);
// Skip button click handler
skipBtn.addEventListener('click', handleSkip);

// Also allow Enter key in the input field to submit
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !submitBtn.disabled) {
        handleSubmit();
    }
});

// Hide suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (e.target !== searchInput && e.target !== submitBtn) {
        suggestionsContainer.style.display = 'none';
    }
});

document.addEventListener('DOMContentLoaded', function () {
    // Get modal elements
    const modal = document.getElementById('customModal');
    const modalTitle = document.getElementById('customModalLabel');
    const modalBody = document.getElementById('customModalBody');

    // When a popup link is clicked
    document.querySelectorAll('.popup-link').forEach(link => {
        link.addEventListener('click', function () {
            // Set modal title and content from data attributes
            const title = this.getAttribute('data-popup-title') || 'Modal';
            const content = this.getAttribute('data-popup-content') || 'Content not specified';

            modalTitle.textContent = title;
            modalBody.innerHTML = content;
        });
    });

    // Optional: Reset modal content when closed
    modal.addEventListener('hidden.bs.modal', function () {
        modalTitle.textContent = 'Modal Title';
        modalBody.textContent = 'Modal content will appear here...';
    });
});

function createUnclosablePopup(content, options = {}) {
    // Set default options
    const config = {
        title: options.title || 'Important Notice',
        backgroundColor: options.backgroundColor || '#ffffff',
        textColor: options.textColor || '#000000',
        ...options
    };

    // Create overlay and popup if they don't exist
    let overlay = document.getElementById('unclosableOverlay');
    let popup = document.getElementById('unclosablePopup');

    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'unclosableOverlay';
        overlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.7);
                    z-index: 9998;
                `;
        document.body.appendChild(overlay);
    }

    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'unclosablePopup';
        popup.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background-color: black;
                    color: #999999;
                    padding: 30px;
                    border-radius: 5px;
                    border: 1px solid #999999;
                    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
                    z-index: 9999;
                    max-width: 80%;
                    max-height: 80vh;
                    overflow-y: auto;
                    text-align: center; /* Center text */
                    display: flex; /* Flexbox for better centering */
                    flex-direction: column; /* Stack children vertically */
                    align-items: center; /* Center horizontally */
                    justify-content: center; /* Center vertically */
                `;
        document.body.appendChild(popup);
    }

    // Set the popup content
    popup.innerHTML = `
                <h4 id="end-result"> ${config.title} </h4>
                <p>The correct answer was "${Answer}"</p>
                <p id="tries-used">${content}</p>
                <button id="share-btn"> 
                    SHARE 
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-share" viewBox="0 0 16 16">
                      <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.5 2.5 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5m-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3"/>
                    </svg>
                </button>
                <div id="status"></div>
                <p class="description">Time until the next song: </p>
                <div class="countdown-display" id="countdown">23:59:59</div>
                <button id="endless-btn"> 
                    ENDLESS MODE 
                </button>
            `;

    // Assign countdown
    countdown = document.getElementById('countdown');

    // Show the popup and overlay
    overlay.style.display = 'block';
    popup.style.display = 'block';
    document.body.classList.add('unclosable-popup-open');

    // Button click handler
    document.getElementById('share-btn').addEventListener('click', async () => {
        const button = document.getElementById('share-btn');
        const status = document.getElementById('status');

        // Call your function to get the content
        const content = generateContent(options.guessed);

        // Try to copy to clipboard
        const success = await copyToClipboard(content);

        if (success) {
            // Visual feedback
            button.textContent = 'Copied!';
            button.classList.add('copied');
            status.textContent = 'Content copied to clipboard!';

            // Reset button after 2 seconds
            setTimeout(() => {
                button.textContent = 'Copy to Clipboard';
                button.classList.remove('copied');
                status.textContent = '';
            }, 2000);
        } else {
            status.textContent = 'Failed to copy to clipboard.';
        }
    });

    document.getElementById('endless-btn').addEventListener('click', async () => {
        Number = getRandomInt(0, 156);

        Answer = ArrGuesses[Number];
        URL = SongDict[Number]['url'];
        console.log(Answer);

        // clear wrong answers
        wrongGuesses = [];
        // Un-update HTML elements with wrong guesses
        for (let i = 0; i < 6; i++) {
            const element = document.getElementById(`guess${i + 1}`);
            if (element) {
                element.innerHTML = "<br><br>";
                if (i !== 0) {
                    // unlight it
                    element.classList.remove('col-sm-middle-guessed');
                    element.classList.add('col-sm-middle');
                }
            }
        }

        // set mode to endless
        mode = "Endless";

        // reset skip btn content
        skipBtn.textContent = "Skip (+" + wrongGuessSecondsReceived[wrongGuesses.length] + "s)";

        // re-initialize the player
        initPlayer();

        // Close the popup
        overlay.style.display = 'none';
        popup.style.display = 'none';
        document.body.classList.remove('unclosable-popup-open');
        window.close = originalWindowClose;
    });

    // Disable all methods of closing
    // 1. Prevent clicking outside
    overlay.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
    });

    // 2. Prevent Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);

    // 3. Prevent right-click context menu
    popup.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    // 4. Prevent any other potential closing methods
    const originalWindowClose = window.close;
    window.close = function () {
        console.log('Window closing has been disabled while the popup is active');
        return null;
    };

    // Return a function that can close the popup (if you need it)
    return {
        close: () => {
            overlay.style.display = 'none';
            popup.style.display = 'none';
            document.body.classList.remove('unclosable-popup-open');
            window.close = originalWindowClose;
        }
    };
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatDateUTC(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const utcYear = date.getUTCFullYear();
    const utcMonth = months[date.getUTCMonth()]; // Get month name (e.g., "Aug")
    const utcDay = date.getUTCDate();

    return `${utcMonth} ${utcDay}, ${utcYear}`; // Example: "Aug 7, 2025"
}

// Function that generates the content to be copied
function generateContent(isGuessed) {
    const date = new Date();
    const formattedDate = formatDateUTC(date)

    let answer = ""
    if (mode == "Endless") {
        answer = "\n\n Song: " + Answer;
    }

    return `Project Sekai ${mode} Heardle #${Number}, ${formattedDate} (UTC) ${answer}

${generateGuessNumbers(isGuessed)}`;
}

function generateGuessNumbers(isGuessed) {
    const right = "🟩";
    const rightSound = "🔊";
    const wrong = "⬛️";
    const wrongSound = "🔇";
    const unguessed = "⬜️";

    let clipboardemojis = "";

    if (isGuessed) {
        clipboardemojis += rightSound;
    } else {
        clipboardemojis += wrongSound;
    }

    for (let i = 0; i < wrongGuesses.length; i++) {
        clipboardemojis += wrong;
    }

    if (!isGuessed) {
        return clipboardemojis;
    } else {
        clipboardemojis += right;
    }
    console.log(clipboardemojis.length);

    for (let i = clipboardemojis.length / 2; i < 7; i++) {
        clipboardemojis += unguessed;
        console.log("called");
    }

    return clipboardemojis;
}

// Function to copy text to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy: ', err);
        return false;
    }
}

function updateCountdown() {
    // Get current UTC time
    const now = new Date();

    // Calculate time until next UTC day (midnight)
    const nextDay = new Date(now);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    nextDay.setUTCHours(0, 0, 0, 0);

    const diff = nextDay - now;

    // Convert milliseconds to hours, minutes, seconds
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    // Format with leading zeros

    if (countdown) {
        // Update the display
        countdown.textContent = String(hours).padStart(2, '0') + ":" +
            String(minutes).padStart(2, '0') + ":" +
            String(seconds).padStart(2, '0');
    }
}

// Update immediately and then every second
updateCountdown();
setInterval(updateCountdown, 1000);