//index.js

// 1. Navigate to the Music Player
const playerBtn = document.getElementById('musicPlayerBtn');
if (playerBtn) {
    playerBtn.addEventListener('click', () => {
        window.location.href = '/musicplayer.html';
    });
}

// 2. Navigate to the Music Editor
const editorBtn = document.getElementById('musicEditorBtn');
if (editorBtn) {
    editorBtn.addEventListener('click', () => {
        window.location.href = '/musiceditor.html';
    });
}