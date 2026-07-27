// Option lists for the RSVP form (ported from the old runtime's `opts`).
// Edit these to change the choices — the page renders chips from them.
export const options = {
  age: ['Under 16', '16–18', '19–22', '23–26', '27–30', '31+'],
  describe: ['Secondary School', 'Junior College / IB', 'Polytechnic', 'ITE', 'University', 'NS', 'Working Adult', 'Between jobs', 'Other'],
  music: ['I play an instrument', 'I sing', 'I produce music', 'I write songs', 'I just enjoy listening', "I'm completely new"],
  instruments: ['Vocals', 'Guitar', 'Bass', 'Drums', 'Keys', 'Violin', 'Saxophone', 'DJ', 'Producer', 'Other'],
  listen: ['Pop', 'Indie', 'Rock', 'R&B', 'Jazz', 'Funk', 'Hip-Hop', 'Metal', 'Classical', 'Mandopop', 'K-pop', 'EDM', 'Singer-songwriter', 'Other'],
  why: ['Meet new people', 'Support a friend', 'Perform', 'Watch performances', 'Find a new hobby', 'Looking for a community', 'Just curious', 'Other'],
  find: ['New friends', 'Bandmates', 'People to jam with', 'Creative collaborators', 'A hobby', 'Performance opportunities', 'Just checking it out'],
  showup: ['Open Jams', 'Workshops', 'Songwriting Sessions', 'Open Mic', 'Café Hangouts', 'Outdoor Performances', 'Creative Markets', 'Volunteer Projects'],
  first: ['Yes — my first one', "No — I've been before"],
  heard: ['Instagram', 'TikTok', 'Friend', 'School', 'Telegram', 'Discord', 'Poster', 'Website', 'Returning attendee', 'Other'],
};

// If any of these "music" answers is chosen, the instruments question appears.
export const performing = ['I play an instrument', 'I sing', 'I produce music', 'I write songs'];
