
import { GroundingChunk, ZoneSource, ZoneContentResponse } from "../types";

export { type ZoneContentResponse };

/**
 * Safe RSS Fetcher
 * Fetches news from RSS feeds using a CORS proxy to avoid browser restrictions.
 * Returns empty arrays on failure instead of throwing errors.
 */
export const fetchZoneNews = async (zoneTitle: string, sources: ZoneSource[]): Promise<ZoneContentResponse> => {
  if (!sources || sources.length === 0) {
    return { text: '', chunks: [] };
  }

  console.log(`Fetching RSS for zone: ${zoneTitle} with sources:`, sources);

  try {
    const promises = sources.map(async (source) => {
      if (!source.url) return [];

      try {
        // Use allorigins.win as a free CORS proxy
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(source.url)}`;
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
          console.warn(`Failed to fetch ${source.name}: ${response.statusText}`);
          return [];
        }

        const data = await response.json();
        if (!data.contents) return [];

        // Parse XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data.contents, "text/xml");
        
        const items = Array.from(xmlDoc.querySelectorAll("item, entry"));
        
        return items.map(item => {
          const title = item.querySelector("title")?.textContent || "No Title";
          
          // Extract Link
          let link = item.querySelector("link")?.textContent || "";
          if (!link) {
             // Atom feeds often have <link href="..." />
             const linkNode = item.querySelector("link");
             if (linkNode) link = linkNode.getAttribute("href") || "";
          }

          // Extract Date
          const pubDate = item.querySelector("pubDate, date, updated")?.textContent || "";
          
          // Extract Description/Content for Image parsing
          const description = item.querySelector("description, summary, content")?.textContent || "";

          // Attempt to find an image
          let imageUrl = "";
          const mediaContent = item.getElementsByTagNameNS("*", "content"); // media:content
          if (mediaContent.length > 0) {
             imageUrl = mediaContent[0].getAttribute("url") || "";
          }
          
          if (!imageUrl) {
             const enclosure = item.querySelector("enclosure");
             if (enclosure && enclosure.getAttribute("type")?.startsWith("image")) {
                imageUrl = enclosure.getAttribute("url") || "";
             }
          }

          if (!imageUrl && description) {
             // Regex to find first img src in description HTML
             const match = description.match(/<img[^>]+src="([^">]+)"/);
             if (match) imageUrl = match[1];
          }

          const chunk: GroundingChunk = {
            web: {
              title: title,
              uri: link
            },
            meta: {
              sourceName: source.name,
              publishedAt: pubDate,
              imageUrl: imageUrl,
              description: description.substring(0, 150) // Brief snippet
            }
          };
          return chunk;
        });

      } catch (err) {
        console.error(`Error parsing feed for ${source.name}:`, err);
        return []; // Return empty for this source, don't crash entire batch
      }
    });

    const results = await Promise.all(promises);
    const allChunks = results.flat();

    // Sort by date (newest first) if possible
    allChunks.sort((a, b) => {
      const dateA = new Date(a.meta?.publishedAt || 0).getTime();
      const dateB = new Date(b.meta?.publishedAt || 0).getTime();
      return dateB - dateA;
    });

    // Filter out items with no link
    const validChunks = allChunks.filter(c => c.web?.uri);

    return {
      text: `Aggregated ${validChunks.length} articles.`,
      chunks: validChunks
    };

  } catch (error) {
    console.error("Critical error in fetchZoneNews:", error);
    // Return safe fallback to prevent white screen
    return { text: "Error loading feeds.", chunks: [] };
  }
};

// Placeholder for briefing generation - keeping it safe
export const generateDailyBriefing = async (zones: any[]): Promise<string> => {
  return "Daily briefing generation requires backend API configuration. Please enable the Gemini API to use this feature.";
};
