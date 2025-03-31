// API configuration
export const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

// Time-related constants
export const YOUTUBE_FOUNDING_DATE = new Date(2005, 3, 23); // April 23, 2005 - when YouTube was first launched
export const STATUS_MESSAGE_DELAY_MS = 1200;

// Search parameters
export const RARE_VIEW_THRESHOLD = 0; // Only true treasures with 0 views
export const MAX_BATCH_SIZE = 50; // Maximum videos per API call

// Reroll settings
export const MAX_REROLLS = 7;  // Maximum number of rerolls before giving up

// YouTube Video Category IDs
// Reference: https://developers.google.com/youtube/v3/docs/videoCategories/list
export const VIDEO_CATEGORIES = {
  FILM_AND_ANIMATION: '1',
  AUTOS_AND_VEHICLES: '2',
  MUSIC: '10',
  PETS_AND_ANIMALS: '15',
  SPORTS: '17',
  SHORT_MOVIES: '18',
  TRAVEL_AND_EVENTS: '19',
  GAMING: '20',
  VIDEOBLOGGING: '21',
  PEOPLE_AND_BLOGS: '22',
  COMEDY: '23',
  ENTERTAINMENT: '24',
  NEWS_AND_POLITICS: '25',
  HOWTO_AND_STYLE: '26',
  EDUCATION: '27',
  SCIENCE_AND_TECHNOLOGY: '28',
  NONPROFITS_AND_ACTIVISM: '29',
  MOVIES: '30',
  ANIME_AND_ANIMATION: '31',
  ACTION_AND_ADVENTURE: '32',
  CLASSICS: '33',
  COMEDY_MOVIES: '34',
  DOCUMENTARY: '35',
  DRAMA: '36',
  FAMILY: '37',
  FOREIGN: '38',
  HORROR: '39',
  SCI_FI_AND_FANTASY: '40',
  THRILLER: '41',
  SHORTS: '42',
  SHOWS: '43',
  TRAILERS: '44'
};

// Categories to exclude from our searches
export const EXCLUDED_CATEGORIES = [
  VIDEO_CATEGORIES.FILM_AND_ANIMATION,
  VIDEO_CATEGORIES.SHORT_MOVIES,
  VIDEO_CATEGORIES.MOVIES,
  VIDEO_CATEGORIES.ACTION_AND_ADVENTURE,
  VIDEO_CATEGORIES.CLASSICS,
  VIDEO_CATEGORIES.COMEDY_MOVIES,
  VIDEO_CATEGORIES.DOCUMENTARY,
  VIDEO_CATEGORIES.DRAMA,
  VIDEO_CATEGORIES.FAMILY,
  VIDEO_CATEGORIES.FOREIGN,
  VIDEO_CATEGORIES.HORROR,
  VIDEO_CATEGORIES.SCI_FI_AND_FANTASY,
  VIDEO_CATEGORIES.THRILLER,
  VIDEO_CATEGORIES.SHOWS,
  VIDEO_CATEGORIES.TRAILERS
];