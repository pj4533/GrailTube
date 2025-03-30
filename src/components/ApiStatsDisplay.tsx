interface ApiStatsProps {
  searchApiCalls: number;
  videoDetailApiCalls: number;
  totalApiCalls: number;
  cachedSearches: number;
  cachedVideoDetails: number;
}

export default function ApiStatsDisplay({
  searchApiCalls,
  videoDetailApiCalls,
  totalApiCalls,
  cachedSearches,
  cachedVideoDetails
}: ApiStatsProps) {
  return (
    <div className="mt-4 text-xs text-gray-500 bg-gray-100 p-3 rounded">
      <h4 className="font-semibold">YouTube API Usage:</h4>
      <div className="grid grid-cols-2 gap-1 mt-1">
        <div>Search API calls:</div>
        <div>{searchApiCalls}</div>
        
        <div>Video detail API calls:</div>
        <div>{videoDetailApiCalls}</div>
        
        <div>Total API calls:</div>
        <div className="font-semibold">{totalApiCalls}</div>
        
        <div>Cached searches:</div>
        <div>{cachedSearches}</div>
        
        <div>Cached video details:</div>
        <div>{cachedVideoDetails}</div>
      </div>
    </div>
  );
}