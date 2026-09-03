//musiceditor.js 

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Fixed the ID to match your HTML
    const dropdown = document.getElementById('playlistDropdown'); 
    dropdown.innerHTML = ''; // Clear any existing options

    try {
        const response = await fetch('/api/playlists');
        const data = await response.json(); // Data is now an object, not an array

        // 2. Handle the Empty State using ion-select-option
        if (data.playlists.length === 0 && !data.hasSongs) {
            const option = document.createElement('ion-select-option');
            option.value = "";
            option.textContent = data.message;
            option.disabled = true;
            dropdown.appendChild(option);
            return;
        }

        // 4. Loop through the playlists array inside the data object
        data.playlists.forEach(playlistName => {
            // Must use ion-select-option for Ionic framework
            const option = document.createElement('ion-select-option'); 
            option.value = playlistName;
            option.textContent = playlistName;
            dropdown.appendChild(option);
        });

                // 3. Add the "All Songs" option if music exists
        if (data.hasSongs) {
            const allOption = document.createElement('ion-select-option');
            allOption.value = "ALL_SONGS_DOWNLOAD";
            allOption.textContent = "⭐ All Downloaded Songs";
            dropdown.appendChild(allOption);
        }
    } catch (error) {
        console.error("Could not load playlists:", error);
        dropdown.innerHTML = '<ion-select-option value="">Error loading playlists</ion-select-option>';
    }
});

document.getElementById('downloadZipBtn').addEventListener('click', async () => {
    const dropdown = document.getElementById('playlistDropdown');
    // Ensure you have an element to display statuses, like <p id="displayMessage"></p>
    const displayElement = document.getElementById('displayMessage5'); 
    const selectedPlaylist = dropdown.value;
    
    if (!selectedPlaylist) {
        if (displayElement) displayElement.innerText = "Please select a playlist from the dropdown first.";
        else alert("Please select a playlist from the dropdown first.");
        return;
    }

    if (displayElement) displayElement.innerText = "Zipping playlist... please wait.";
    
    try {
        // Fetch the ZIP file from your existing playlist route
        const response = await fetch(`/api/download-existing-playlist?name=${encodeURIComponent(selectedPlaylist)}`);
        
        if (response.ok) {
            // Read the response as a binary blob
            const blob = await response.blob(); 
            
            // Create a temporary object URL for the browser
            const downloadUrl = window.URL.createObjectURL(blob); 
            
            // Generate a hidden anchor tag to trigger the browser's download prompt
            const a = document.createElement('a');
            a.href = downloadUrl;
            // Clean the filename using the same regex to match the backend
            a.download = `${selectedPlaylist.replace(/[\\/:*?"<>|]/g, '').trim()}.zip`; 
            document.body.appendChild(a);
            a.click();
            a.remove();
            
            // Clear the memory after the download starts
            window.URL.revokeObjectURL(downloadUrl);
            
            if (displayElement) displayElement.innerText = "Success: Playlist downloaded to your device!";
            dropdown.value = ''; // Reset the dropdown
        } else {
            const errorText = await response.text();
            if (displayElement) displayElement.innerText = "Error: " + errorText;
        }
    } catch (error) {
        if (displayElement) displayElement.innerText = "Error connecting to the server!";
        console.error("Error:", error);
    }
});

document.getElementById('downloadBtn').addEventListener('click', async () => {
    // 1. Grab the URL from your input field and the display element
    const urlValue = document.getElementById('urlInput').value.trim();
    const displayElement = document.getElementById('displayMessage');
    
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
    const displayElement = document.getElementById('displayMessage2');

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
    const displayElement = document.getElementById('displayMessage3');

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

document.getElementById('downloadSpotifyBtn').addEventListener('click', async () => {
    // 1. Grab the URL from your input field and the display element
    const urlValue = document.getElementById('spotifyUrlInput').value.trim();
    const displayElement = document.getElementById('displayMessage4');
    
    if (!urlValue) {
        displayElement.innerText = "Please enter a valid spotify playlist";
        return;
    }
    
    displayElement.innerText = "Downloading... please wait.";
    
    try {
        // 2. Change to a POST request and send the URL in the body
        const response = await fetch('/api/downloadSpotify', {
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