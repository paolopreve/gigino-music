//index.js

// 1. Navigate to the Music Player
const playerBtn = document.getElementById('musicPlayerBtn');
if (playerBtn) {
    playerBtn.addEventListener('click', () => {
        // Automatically grabs whatever IP or "localhost" you are currently using
        const currentHost = window.location.hostname;

        // Build the Jellyfin URL using port 8096
        const jellyfinUrl = `http://${currentHost}:8096`;

        // Redirect the browser
        //
        window.open(jellyfinUrl, "_blank");
    });
}

// 2. Navigate to the Music Editor
const editorBtn = document.getElementById('musicEditorBtn');
if (editorBtn) {
    editorBtn.addEventListener('click', () => {
        window.location.href = '/musiceditor.html';
    });
}