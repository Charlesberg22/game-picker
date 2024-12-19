CREATE TABLE platforms (
    platform_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE games (
    game_id INTEGER PRIMARY KEY,
    platform_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    licence TEXT NOT NULL,
    play_method TEXT NOT NULL,
    retro INTEGER NOT NULL CHECK("retro" in (0, 1)),
    handheld INTEGER NOT NULL CHECK("handheld" in (0, 1)),
    prequel_id INTEGER, -- references another game within this table, but can be NULL
    hltb FLOAT,
    tried INTEGER CHECK("tried" in (0, 1)),
    finished INTEGER CHECK("finished" in (0, 1)),
    rating FLOAT,
    when_played DATE,
    FOREIGN KEY(platform_id) REFERENCES platforms(platform_id)
);