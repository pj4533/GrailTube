#!/bin/bash

echo "Starting GrailTube..."
echo "Make sure you've added your YouTube API key to .env.local"
echo "Opening http://localhost:3000 in your default browser..."

# Wait a moment before opening the browser
(sleep 2 && open http://localhost:3000) &

# Start the Next.js development server
npm run dev