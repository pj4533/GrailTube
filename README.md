# GrailTube

GrailTube is a web application that helps you discover ultra-rare YouTube videos with less than 5 views. It randomly searches for videos uploaded during a 10-minute window from YouTube's past and shows you the ones that almost nobody has seen.

## Setup

1. Clone this repository
2. Create a `.env.local` file in the root directory with the following:
   ```
   NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key_here
   ```
   You can get a YouTube API key from the [Google Cloud Console](https://console.cloud.google.com/) by enabling the YouTube Data API v3.

3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## How It Works

1. Click the "Find Rare Gems" button
2. GrailTube selects a random 10-minute window from YouTube's history
3. It searches for videos uploaded during that time period
4. It filters for videos with less than 5 views
5. Click any video thumbnail to watch it

## Features

- Discovers ultra-rare YouTube videos with less than 5 views
- Shows video thumbnails, titles, and channel information
- Allows you to watch the videos directly on the site
- Simple, clean interface

## Technologies Used

- Next.js
- TypeScript
- Tailwind CSS
- YouTube Data API v3

## License

MIT