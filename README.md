# gigino-music

## What is this?
This is a webapp that allows you to download spotify playlists as mp3 on a server. You can then choose to download your server files locally or play them with jellyfin. The program can download given a public spotify playlist link, a .csv file which you can export from (https://exportify.net/) or a youtube video link. It then saves the name of the playlist and groups all your downloaded songs in that playlist without you having to group them manually. It also propely save the songs and titles so when you are playing a specific song you can correctly see the title and the artist in their correct locations. It uses docker to properly configure the folder in which the music will be saved in the server to be read by the deafult /media/music/ of jellyfin. 

## How do i configure this?
Testing needed in configuration. Idealy you shouldn't need any configuration except jellyfin configuration.

## How do i run this?
First open the visual studio terminal inside the folder gigino music, or open the terminal inside the folder.
Then run `chmod +x start.sh` to allow the .sh to properly execute
Then simply run `./start.sh` and wait for docker to do the rest