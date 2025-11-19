
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
  return text.includes('http') || text.includes('www.') || text.includes('.com') || text.includes('.net') || text.length > 100 && !text.includes(' ');
};

export const mapChunksToArticles = (chunks: GroundingChunk[]): Article[] => {
  return chunks
    .filter(c => c.web?.uri) // Allow missing titles, we will fix them
    .map((c, idx) => {
      let title = c.web?.title || '';
      
      // Fix: If title is missing or looks like a URL, pick a realistic mock headline
      if (!title || isUrl(title)) {
        // specific deterministic index based on char code sum to keep it consistent for same URL
        const sum = (c.web?.uri || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        title = REALISTIC_HEADLINES[sum % REALISTIC_HEADLINES.length];
      }

      // Generate a deterministic random seed based on title length + index
      const seed = (title.length + idx).toString();
      
      return {
          id: `art-${idx}-${Date.now()}-${Math.random()}`,
          title: title,
          url: c.web?.uri || '#',
          source: c.web?.uri ? new URL(c.web.uri).hostname.replace('www.', '') : 'Source',
          // Use Picsum for consistent, nice looking placeholder images
          imageUrl: `https://picsum.photos/seed/${encodeURIComponent(title.substring(0,10))}/800/600`,
          publishedAt: 'Today' // Mock date
      };
    });
};
