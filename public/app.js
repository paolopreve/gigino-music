// This runs automatically as soon as the page loads
document.addEventListener('DOMContentLoaded', async () => {
    const songListElement = document.getElementById('songList');
    
    try {
        // Fetch the list of songs from your new API
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

document.addEventListener('DOMContentLoaded', async () => {
    const songListElement = document.getElementById('songList');
    const musicPlayer = document.getElementById('musicPlayer'); // Get the player
    
    try {
        const response = await fetch('/api/songs');
        const data = await response.json();
        
        if (response.ok) {
            songListElement.innerHTML = '';
            
            if (data.songs.length === 0) {
                songListElement.innerHTML = '<li>No songs found.</li>';
                return;
            }

            data.songs.forEach(song => {
                const li = document.createElement('li');
                li.textContent = song;
                
                // Make it look clickable
                li.style.cursor = 'pointer';
                li.style.padding = '5px 0';
                
                // Add click logic to play the song
                li.addEventListener('click', () => {
                    // Point the player to the static route we created in server.js
                    // encodeURIComponent handles spaces and special characters in the filename safely
                    musicPlayer.src = `/media/${encodeURIComponent(song)}`;
                    musicPlayer.play(); // Auto-start the song
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

document.getElementById('downloadBtn').addEventListener('click', async () => {
    // 1. Grab the URL from your input field and the display element
    const urlValue = document.getElementById('urlInput').value.trim();
    const displayElement = document.getElementById('displayMessage2');
    
    if (!urlValue) {
        displayElement.innerText = "Please enter a valid YouTube URL.";
        return;
    }

    displayElement.innerText = "Downloading... please wait.";
    
    try {
        // 2. Change to a POST request and send the URL in the body
        const response = await fetch('/api/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: urlValue }) // Send the payload
        });
        
        const data = await response.json();
        
        // 3. Handle success or failure based on the server response
        if (response.ok) {
            displayElement.innerText = "Success: " + data.message;
        } else {
            displayElement.innerText = "Error: " + data.error;
        }
    } catch (error) {
        displayElement.innerText = "Error connecting to the server!";
        console.error("Error:", error);
    }
});

document.getElementById('uploadBtn').addEventListener('click', async () => {
    const fileInput = document.getElementById('musicFileInput');
    const displayElement = document.getElementById('displayMessage3');

    if (fileInput.files.length === 0) {
        displayElement.innerText = "Please select a file first.";
        return;
    }

    const file = fileInput.files[0];
    displayElement.innerText = `Uploading ${file.name}...`;

    // 1. Bundle the file into FormData
    const formData = new FormData();
    formData.append('musicFile', file); // 'musicFile' is the key the server will look for

    try {
        // 2. Send the POST request (do NOT set Content-Type manually, the browser handles it for FormData)
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            displayElement.innerText = "Success: " + result.message;
        } else {
            displayElement.innerText = "Error: " + result.error;
        }
    } catch (error) {
        console.error("Upload error:", error);
        displayElement.innerText = "Error connecting to the server!";
    }
});

document.getElementById('downloadCsvBtn').addEventListener('click', async () => {
    const fileInput = document.getElementById('csvFileInput');
    const displayElement = document.getElementById('displayMessage4');

    if (fileInput.files.length === 0) {
        displayElement.innerText = "Please select a CSV file first.";
        return;
    }

    displayElement.innerText = `Uploading and processing ${fileInput.files[0].name}...`;

    const formData = new FormData();
    formData.append('csvFile', fileInput.files[0]);

    try {
        const response = await fetch('/api/process-csv', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            displayElement.innerText = "Success: " + result.message;
        } else {
            displayElement.innerText = "Error: " + result.error;
        }
    } catch (error) {
        console.error("Upload error:", error);
        displayElement.innerText = "Error connecting to the server!";
    }
});