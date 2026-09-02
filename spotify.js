const fetch = require('isomorphic-unfetch');
const { getTracks } = require('spotify-url-info')(fetch);

async function getPlaylistSongs(playlistUrl) {
    try {
        // Fetches the public metadata directly from the link
        const tracks = await getTracks(playlistUrl);

        // Map the results to your format
        console.log(tracks.length);
        const songs = tracks.map(track => {
            const trackName = track.name || "Unknown Track";

            // Safely check if artists exist and have at least one entry
            const artistName = (track.artists && track.artists.length > 0 && track.artists[0].name)
                ? track.artists[0].name
                : (track.artist || "Unknown Artist"); // Fallback check

            return `${artistName} - ${trackName} lyrics`;
        });
        console.log(songs.length);
        return songs;
    } catch (error) {
        console.error("Failed to scrape Spotify link:", error);
        return [];
    }
}

module.exports = { getPlaylistSongs };