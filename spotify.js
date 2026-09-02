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

            // Get the raw artist string
            const rawArtist = (track.artists && track.artists.length > 0 && track.artists[0].name)
                ? track.artists[0].name
                : (track.artist || "Unknown Artist"); 

            // Split by comma, '&', or 'feat' and keep only the first part
            const mainArtist = rawArtist.split(/,|&|\bfeat\b/i)[0].trim();

            return `${mainArtist} - ${trackName} lyrics`;
        });
        console.log(songs.length);
        return songs;
    } catch (error) {
        console.error("Failed to scrape Spotify link:", error);
        return [];
    }
}

module.exports = { getPlaylistSongs };