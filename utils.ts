
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

const REALISTIC_SNIPPETS = [
  "Analysts predict a sustained bull run as major technology companies report record-breaking quarterly earnings, driving investor confidence across global indices.",
  "The successful test flight marks a pivotal moment in interplanetary travel, with engineers confirming that all primary systems functioned nominally during the ascent.",
  "Researchers have achieved a long-sought milestone, demonstrating a qubit architecture that remains stable for significantly longer periods, opening doors for complex calculations.",
  "New data suggests that the transition to renewable energy is accelerating faster than anticipated, with solar panel efficiency reaching new commercial peaks.",
  "Experts are calling this the 'GPT moment' for reasoning, as the latest model solves complex mathematical problems and coding challenges with unprecedented accuracy.",
  "As hybrid models solidify, companies are reimagining office spaces to prioritize collaboration while investing heavily in digital infrastructure for remote teams.",
  "Consumer preference has shifted dramatically this quarter, with EV market share crossing the 50% threshold in key Scandinavian markets, signaling a tipping point.",
  "Clinical trials have shown a 90% efficacy rate in early-stage patients, offering hope for a cure to a condition that affects millions worldwide.",
  "The new System 03 has successfully deployed, collecting tons of plastic waste from the ocean surface while minimizing impact on marine life.",
  "World leaders have convened to sign a binding agreement that aims to reduce carbon emissions by 40% within the next five years through aggressive policy changes.",
  "The device promises to seamlessly blend digital information with the physical world, featuring a lightweight design that could finally make AR mainstream.",
  "Venture capital funding is pouring into decentralized infrastructure projects, with a focus on privacy-preserving technologies and scalable blockchain solutions."
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
      const seedNum = title.length + idx;
      const snippet = REALISTIC_SNIPPETS[seedNum % REALISTIC_SNIPPETS.length];
      
      return {
          id: `art-${idx}-${Date.now()}-${Math.random()}`,
          title: title,
          snippet: snippet,
          url: c.web?.uri || '#',
          source: c.web?.uri ? new URL(c.web.uri).hostname.replace('www.', '') : 'Source',
          // Use Picsum for consistent, nice looking placeholder images
          imageUrl: `https://picsum.photos/seed/${encodeURIComponent(title.substring(0,10))}/800/600`,
          publishedAt: 'Today' // Mock date
      };
    });
};