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