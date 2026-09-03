const fetch = require('isomorphic-unfetch');
const { getTracks, getData } = require('spotify-url-info')(fetch);

async function getPlaylistSongs(playlistUrl) {
    try {
        // Fetch the playlist title
        const data = await getData(playlistUrl);
        const playlistTitle = data.name || "Spotify Playlist";

        const tracks = await getTracks(playlistUrl);
        
        const songs = tracks.map(track => {
            const trackName = track.name || "Unknown Track";
            const rawArtist = (track.artists && track.artists.length > 0 && track.artists[0].name)
                ? track.artists[0].name
                : (track.artist || "Unknown Artist"); 

            const mainArtist = rawArtist.split(/,|&|\bfeat\b/i)[0].trim();
            return `${mainArtist} - ${trackName} lyrics`;
        });
        
        // Return both the name and the array of songs
        return { playlistTitle, songs };
    } catch (error) {
        console.error("Failed to scrape Spotify link:", error);
        return { playlistTitle: null, songs: [] };
    }
}

module.exports = { getPlaylistSongs };