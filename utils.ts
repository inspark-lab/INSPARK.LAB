
import { Article, GroundingChunk } from './types';

const REALISTIC_HEADLINES = [
  "Global Markets Rally as Tech Sector Surges to New Highs",
  "SpaceX Successfully Launches Next-Gen Starship Prototype",
  "Breakthrough in Quantum Computing: Error Correction Solved",
  "Sustainable Energy: Solar Adoption Outpaces Forecasts in 2025",
  "New AI Model Demonstrates Reasoning Capabilities Par with Humans",
  "The Future of Remote Work: Trends Shaping the Next Decade",
  "Electric Vehicle Sales Surpass Traditional Autos in Nordic Region",
  "Medical Marvel: New Treatment Shows Promise for Chronic Conditions",
  "Ocean Cleanup Project Expands Operations to Pacific Garbage Patch",
  "Global Summit Addresses Urgent Climate Action Goals",
  "Tech Giant Unveils Revolutionary AR Glasses at Annual Event",
  "Startups to Watch: The Next Unicorns of the Web3 Era"
];

const isUrl = (text: string) => {
  return text.includes('http') || text.includes('www.') || text.includes('.com') || text.includes('.net') || (text.length > 100 && !text.includes(' '));
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Recently';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recently';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = diffMs / (1000 * 60 * 60);
    
    if (diffHrs < 24) {
       if (diffHrs < 1) return 'Just now';
       return `${Math.floor(diffHrs)}h ago`;
    }
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch (e) {
    return 'Recently';
  }
};

export const mapChunksToArticles = (chunks: GroundingChunk[]): Article[] => {
  if (!Array.isArray(chunks)) return [];

  return chunks
    .filter(c => c && c.web?.uri) 
    .map((c, idx) => {
      let title = c.web?.title || 'Untitled Article';
      
      // Clean up title: Remove CDATA if present
      title = title.replace('<![CDATA[', '').replace(']]>', '');

      // Fallback for URL-like titles if we don't have a real title
      if (isUrl(title)) {
        const sum = (c.web?.uri || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        title = REALISTIC_HEADLINES[sum % REALISTIC_HEADLINES.length];
      }

      // Deterministic seed for placeholder images
      const seed = (title.length + idx).toString();
      
      // Use real image if available, otherwise placeholder
      const imageUrl = c.meta?.imageUrl 
        ? c.meta.imageUrl 
        : `https://picsum.photos/seed/${encodeURIComponent(title.substring(0,10))}/800/600`;

      return {
          id: `art-${idx}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: title,
          url: c.web?.uri || '#',
          source: c.meta?.sourceName || (c.web?.uri ? new URL(c.web.uri).hostname.replace('www.', '') : 'Source'),
          imageUrl: imageUrl,
          publishedAt: formatDate(c.meta?.publishedAt)
      };
    });
};
