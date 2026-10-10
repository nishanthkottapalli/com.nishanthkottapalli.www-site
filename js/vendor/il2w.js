
const contextDate = document.getElementById('il2wFreeWritingEntry').dataset.date
document.getElementById('il2wFreeWritingEntry').innerHTML += `<p style="text-align: right;">${contextDate}</p>`;
// 1. Define array of emojis
const freeWritingEmojis = ['🌲', '🍂'];

// 2. random index from the array
const randomIndex = Math.floor(Math.random() * freeWritingEmojis.length);
const selectedEmojiForFreeWriting = freeWritingEmojis[randomIndex];

// 3. paragraph element
const freeWritingEntryElement = document.querySelector('.il2w-free-writing-entry');

// 4. Inject the chosen freeWriting emoji into the CSS variable (wrapped in quotes)
freeWritingEntryElement.style.setProperty('--random', `"${selectedEmojiForFreeWriting}"`);
