//musicplayer.js

document.addEventListener('DOMContentLoaded', async () => {
    const songListElement = document.getElementById('songList');
    const musicPlayer = document.getElementById('musicPlayer'); 
    
    try {
        // Fetch the list of songs from your API
        const response = await fetch('/api/songs');
        const data = await response.json();
        
        if (response.ok) {
            // Clear any loading text
            songListElement.innerHTML = '';
            
            // If the folder is empty
            if (data.songs.length === 0) {
                songListElement.innerHTML = '<li>No songs found.</li>';
                return;
            }

            // Loop through the array and create an <li> for each song
            data.songs.forEach(song => {
                const li = document.createElement('li');
                li.textContent = song;
                
                // Make it look clickable
                li.style.cursor = 'pointer';
                li.style.padding = '5px 0';
                
                // Add click logic to play the song
                li.addEventListener('click', () => {
                    // Point the player to the static route we created in server.js
                    musicPlayer.src = `/media/${encodeURIComponent(song)}`;
                    musicPlayer.play(); 
                });

                songListElement.appendChild(li);
            });
        } else {
            songListElement.innerHTML = `<li>Error: ${data.error}</li>`;
        }
    } catch (error) {
        console.error("Failed to load songs:", error);
        songListElement.innerHTML = '<li>Error connecting to server.</li>';
    }
});