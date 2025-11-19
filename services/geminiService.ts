
import { GroundingChunk, ZoneSource, ZoneContentResponse } from "../types";

export { type ZoneContentResponse };

/**
 * Safe RSS Fetcher
 * Uses the backend serverless API (/api/fetch-rss) to fetch feeds.
 * The backend handles CORS, User-Agents, and Suffix Guessing.
 */
export const fetchZoneNews = async (zoneTitle: string, sources: ZoneSource[]): Promise<ZoneContentResponse> => {
  if (!sources || sources.length === 0) {
    return { text: '', chunks: [] };
  }

  try {
    const promises = sources.map(async (source) => {
      if (!source.url) return [];

      // URL Normalization
      let fetchUrl = source.url.trim();
      if (!fetchUrl.match(/^https?:\/\//i)) {
          fetchUrl = `https://${fetchUrl}`;
      }

      let chunks: GroundingChunk[] = [];
      let success = false;

      // STRATEGY 1: Local Serverless API (The Reliable Proxy)
      try {
        const apiUrl = `/api/fetch-rss?url=${encodeURIComponent(fetchUrl)}`;
        const response = await fetch(apiUrl);
        
        if (response.ok) {
          const contentType = response.headers.get('content-type') || '';
          
          if (contentType.includes('application/json')) {
             // Handle JSON Feed response if backend decided to return JSON
             const data = await response.json();
             // (Assuming backend passes raw text, but if it parsed Feed2Json it might be object. 
             //  Our backend currently returns raw text, so this block catches raw JSON text if valid)
             // Not typically hit with our current backend logic unless we extend it, 
             // but kept safe. 
          } else {
             // Handle XML Response (Standard)
             const xmlContent = await response.text();
             const parser = new DOMParser();
             const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
             const parseError = xmlDoc.querySelector('parsererror');
             
             if (!parseError) {
                const items = Array.from(xmlDoc.querySelectorAll("item, entry"));
                chunks = items.map(item => {
                  const title = item.querySelector("title")?.textContent?.trim() || "No Title";
                  let link = item.querySelector("link")?.textContent?.trim() || "";
                  if (!link) {
                     const linkNode = item.querySelector("link");
                     if (linkNode) link = linkNode.getAttribute("href") || "";
                  }
                  const pubDate = item.querySelector("pubDate, date, updated")?.textContent?.trim() || "";
                  const description = item.querySelector("description, summary, content")?.textContent || "";
                  const contentEncoded = item.getElementsByTagNameNS("*", "encoded")[0]?.textContent || "";

                  // Image Extraction
                  let imageUrl = "";
                  const mediaContent = item.getElementsByTagNameNS("*", "content"); 
                  if (mediaContent.length > 0) imageUrl = mediaContent[0].getAttribute("url") || "";
                  
                  if (!imageUrl) {
                      const mediaThumbnail = item.getElementsByTagNameNS("*", "thumbnail");
                      if (mediaThumbnail.length > 0) imageUrl = mediaThumbnail[0].getAttribute("url") || "";
                  }
                  if (!imageUrl) {
                     const enclosure = item.querySelector("enclosure");
                     if (enclosure && enclosure.getAttribute("type")?.startsWith("image")) {
                        imageUrl = enclosure.getAttribute("url") || "";
                     }
                  }
                  if (!imageUrl) {
                     const textToSearch = contentEncoded || description;
                     const match = textToSearch.match(/<img[^>]+src="([^">]+)"/);
                     if (match) imageUrl = match[1];
                  }

                  return {
                    web: { title, uri: link },
                    meta: {
                      sourceName: source.name,
                      publishedAt: pubDate,
                      imageUrl: imageUrl,
                      description: description.replace(/<[^>]*>?/gm, '').substring(0, 150)
                    }
                  };
                });
                if (chunks.length > 0) success = true;
             }
          }
        }
      } catch (err) {
         console.warn(`API fetch failed for ${source.name}`, err);
      }

      // STRATEGY 2: Fallback - RSS2JSON (Public API)
      // Kept as a backup in case the local API hits limits or fails
      if (!success || chunks.length === 0) {
        try {
            const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(fetchUrl)}`;
            const response = await fetch(rss2jsonUrl);
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'ok' && Array.isArray(data.items)) {
                    chunks = data.items.map((item: any) => ({
                        web: {
                            title: item.title,
                            uri: item.link
                        },
                        meta: {
                            sourceName: source.name,
                            publishedAt: item.pubDate,
                            imageUrl: item.thumbnail || item.enclosure?.link || '',
                            description: (item.description || '').replace(/<[^>]*>?/gm, '').substring(0, 150)
                        }
                    }));
                    if (chunks.length > 0) success = true;
                }
            }
        } catch (fallbackErr) {
            console.warn(`Fallback (rss2json) failed for ${source.name}`);
        }
      }

      if (!success) {
          return [];
      }

      return chunks;
    });

    const results = await Promise.all(promises);
    const allChunks = results.flat();

    // Sort by date (newest first)
    allChunks.sort((a, b) => {
      const dateA = a.meta?.publishedAt ? new Date(a.meta.publishedAt).getTime() : 0;
      const dateB = b.meta?.publishedAt ? new Date(b.meta.publishedAt).getTime() : 0;
      if (isNaN(dateA)) return 1;
      if (isNaN(dateB)) return -1;
      return dateB - dateA;
    });

    // Filter valid items
    const validChunks = allChunks.filter(c => c.web?.uri);

    if (validChunks.length === 0 && sources.length > 0) {
        return { text: 'No articles found', chunks: [] };
    }

    return {
      text: `Aggregated ${validChunks.length} articles.`,
      chunks: validChunks
    };

  } catch (error: any) {
    console.error("Critical error in fetchZoneNews:", error);
    return { text: 'Error loading feeds', chunks: [] };
  }
};

export const generateDailyBriefing = async (zones: any[]): Promise<string> => {
  return "Daily briefing generation requires backend API configuration.";
};
