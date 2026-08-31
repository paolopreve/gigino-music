document.getElementById('fetchDataBtn').addEventListener('click', async () => {
    const displayElement = document.getElementById('displayMessage');
    
    try {
        // Fetch data from the backend API
        const response = await fetch('/api/message');
        const data = await response.json();
        
        // Display the data on the page
        displayElement.innerText = data.text;
    } catch (error) {
        displayElement.innerText = "Error fetching data!";
        console.error("Error:", error);
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