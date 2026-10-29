// constants.js — unchanged from Lesson 5
export const AGE = { KIDS: 'kids', TEEN: 'teen', ADULT: 'adult' };
export const STAGE = {
  NAME: 'name', GREET_MOOD: 'greet_mood', AGE: 'age',
  CATEGORIES: 'categories', MOVIE_MOOD: 'movie_mood', LANGUAGE: 'language', CHAT: 'chat',
};
export const CATEGORIES_BY_AGE = {
  kids:  [
    { id: 'animation', label: '🎨 Animation' }, { id: 'adventure', label: '🌟 Adventure' },
    { id: 'comedy',    label: '😂 Comedy'    }, { id: 'fantasy',   label: '✨ Fantasy'    },
    { id: 'musical',   label: '🎵 Musical'   }, { id: 'family',    label: '👨‍👩‍👧 Family'  },
  ],
  teen:  [
    { id: 'action',    label: '⚡ Action'    }, { id: 'adventure', label: '🌟 Adventure' },
    { id: 'scifi',     label: '🚀 Sci-Fi'    }, { id: 'comedy',    label: '😂 Comedy'    },
    { id: 'thriller',  label: '🔍 Thriller'  }, { id: 'romance',   label: '💕 Romance'   },
    { id: 'superhero', label: '🦸 Superhero' }, { id: 'horror',    label: '👻 Horror'    },
  ],
  adult: [
    { id: 'action',      label: '⚡ Action'     }, { id: 'drama',       label: '🎭 Drama'       },
    { id: 'thriller',    label: '🔍 Thriller'   }, { id: 'comedy',      label: '😂 Comedy'      },
    { id: 'romance',     label: '💕 Romance'    }, { id: 'scifi',       label: '🚀 Sci-Fi'      },
    { id: 'horror',      label: '👻 Horror'     }, { id: 'crime',       label: '🕵️ Crime'       },
    { id: 'documentary', label: '📽️ Documentary'}, { id: 'animation',   label: '🎨 Animation'   },
  ],
};
export const LANGUAGES = [
  'Any Language', 'English', 'Hindi', 'Kannada',
  'Tamil', 'Telugu', 'Spanish', 'French', 'Japanese', 'Korean',
];
export const MOODS_BY_AGE = {
  kids: [
    { label: '⚡ Action & Fun',    value: 'something exciting and action-packed for kids' },
    { label: '😂 Make me laugh',   value: 'something really funny that will make me laugh' },
    { label: '✨ Magic & Fantasy', value: 'something magical and full of fantasy'          },
    { label: '🎵 Musical',         value: 'a fun musical with great songs'                 },
    { label: '🎲 Surprise me!',    value: 'something amazing, just surprise me!'           },
  ],
  other: [
    { label: '⚡ Exciting',        value: 'something exciting and action-packed'           },
    { label: '😂 Make me laugh',   value: 'something funny to make me laugh out loud'      },
    { label: '💛 Heartwarming',    value: 'something emotional and heartwarming'           },
    { label: '🤯 Mind-blowing',    value: 'something that will absolutely blow my mind'    },
    { label: '💕 Romantic',        value: 'something romantic and beautiful'               },
    { label: '🎲 Surprise me!',    value: 'surprise me with something great'               },
  ],
};
export const FILTER_WORDS = [
  'cG9ybg==', 'eHh4', 'c2V4IHRhcGU=', 'ZXJvdGlj', 'bnVkZQ==', 'bmFrZWQ=', 'aGVudGFp',
].map(w => atob(w));
export const MAX_CHAT_HISTORY = 20;
