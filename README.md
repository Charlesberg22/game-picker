# Backlog Tracker / Game Picker

## background ##
I made this dockerised next.js app to improve upon a backlog tracking spreadsheet I had, and I am self-hosting it in unraid.
This is my first experience with next.js and typescript, and first use of sqlite outside of CS50.

It includes typical CRUD operations into the sqlite database, as well as a randomiser to suggest a next game to play that pulls from a subset of games in the list, based on the retro/modern and handheld/desktop tags.

The biggest improvement over my old spreadsheet is the inclusion of cover art pulled from SteamGridDB.com (or uploaded manually) and ability to pull game length data directly from howlongtobeat.com using functions based on those in https://github.com/ckatzorke/howlongtobeat/.

The original style of the app is based on the next.js tutorial app, but with a fair bit of modification by now.

### known issues ###
When adding new cover images in the deployed container, the container has to be restarted for them to be accessible. This may be a permissions thing but I am not yet well-versed enough to troubleshoot fully. This issue isn't present when running the dev server.