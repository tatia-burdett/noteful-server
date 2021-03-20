CREATE TABLE noteful_folder (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  folder_name TEXT NOT NULL
);

CREATE TABLE noteful_note {
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  note_name TEXT NOT NULL,
  modified TIMESPAMPTZ DEFAULT now() NOT NULL,
  content TEXT,
  folder_id INTEGER REFRENCES noteful_folder(id) ON DELETE CASCADE NOT NULL 
};