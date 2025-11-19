
import { GroundingChunk, ZoneSource, ZoneContentResponse } from "../types";

export { type ZoneContentResponse };

/**
 * Helper to discover RSS feed URL from a homepage HTML.
 */
const findRssLinkFromHtml = async (url: string): Promise<string | null> => {
  try {
    // Use AllOrigins to bypass CORS for HTML fetching
    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (!data.contents) return null;

    const parser = new DOMParser();
    const doc = parser.parseFromString(data.contents, 'text/html');
    
    // Look for RSS
    let link = doc.querySelector('link[type="application/rss+xml"]');
    // Look for Atom
    if (!link) link = doc.querySelector('link[type="application/atom+xml"]');
    
    if (link) {
        const href = link.getAttribute('href');
        if (href) {
            try {
                // Handle relative URLs
                return new URL(href, url).href;
            } catch (e) {
                return href;
            }
        }
    }
    
    return null;
  } catch (e) {
    console.warn(`RSS discovery failed for ${url}`, e);
    return null;
  }
};

/**
 * Fetches raw text content from a URL using multiple CORS proxies for reliability.
 * Strategy:
 * 1. Try AllOrigins (JSON mode) - Good for standard headers
 * 2. Fallback to CorsProxy.io (Raw mode) - Fast, usually reliable
 * 3. Fallback to CodeTabs (Raw mode) - Very reliable for redirects (FeedBurner)
 * 4. Fallback to ThingProxy (Raw mode) - Reliable backup
 */
const fetchWithBackups = async (url: string): Promise<string | null> => {
  const timeout = 15000; // Increased to 15 seconds

  // Helper for timeout fetch
  const fetchWithTimeout = async (fetchUrl: string) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(fetchUrl, { signal: controller.signal });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  };

  // Proxy 1: AllOrigins (Returns JSON with .contents)
  try {
    const response = await fetchWithTimeout(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
    if (response.ok) {
      const data = await response.json();
      if (data.contents) return data.contents;
    }
  } catch (err) {
    // console.warn(`Primary proxy (AllOrigins) failed for ${url}`);
  }

  // Proxy 2: CorsProxy.io (Returns Raw Text)
  try {
    const response = await fetchWithTimeout(`https://corsproxy.io/?${encodeURIComponent(url)}`);
    if (response.ok) {
      const text = await response.text();
      if (text.length > 50 && !text.includes('Error 404') && !text.includes('Proxy Error')) {
          return text;
      }
    }
  } catch (err) {
    // console.warn(`Secondary proxy (CorsProxy) failed for ${url}`);
  }

  // Proxy 3: CodeTabs (Returns Raw Text)
  try {
    const response = await fetchWithTimeout(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`);
    if (response.ok) {
      return await response.text();
    }
  } catch (err) {
    // console.warn(`Tertiary proxy (CodeTabs) failed for ${url}`);
  }

   // Proxy 4: ThingProxy (Returns Raw Text)
  try {
    const response = await fetchWithTimeout(`https://thingproxy.freeboard.io/fetch/${encodeURIComponent(url)}`);
    if (response.ok) {
      return await response.text();
    }
  } catch (err) {
    // console.warn(`Quaternary proxy (ThingProxy) failed for ${url}`);
  }

  return null;
};

/**
 * Safe RSS Fetcher
 * 1. Tries standard XML fetch via Proxies + DOMParser.
 * 2. Fallback: RSS2JSON API.
 * 3. Fallback: Vercel RSS Parser API.
 * 4. Fallback: FactMaven XML-to-JSON API.
 * 5. Fallback: Feed2Json API.
 */
export const fetchZoneNews = async (zoneTitle: string, sources: ZoneSource[]): Promise<ZoneContentResponse> => {
  if (!sources || sources.length === 0) {
    return { text: '', chunks: [] };
  }

  try {
    const promises = sources.map(async (source) => {
      if (!source.url) return [];

      let fetchUrl = source.url;

      // Auto-Discovery Logic: 
      // If URL doesn't look like a feed, try to find one on the page.
      const lowerUrl = fetchUrl.toLowerCase();
      const isLikelyFeed = lowerUrl.includes('rss') || 
                           lowerUrl.includes('feed') || 
                           lowerUrl.includes('.xml') || 
                           lowerUrl.includes('.json') ||
                           lowerUrl.includes('feeds.');
      
      if (!isLikelyFeed) {
         const discoveredUrl = await findRssLinkFromHtml(fetchUrl);
         if (discoveredUrl) {
             console.log(`Auto-discovered RSS for ${source.name}: ${discoveredUrl}`);
             fetchUrl = discoveredUrl;
         }
      }

      let chunks: GroundingChunk[] = [];
      let success = false;

      // STRATEGY 1: Raw Fetch + DOMParser
      // Best for feeds that work with simple CORS proxies
      try {
        const xmlContent = await fetchWithBackups(fetchUrl);
        
        if (xmlContent) {
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
          } else {
            console.warn(`XML Parsing error for ${source.name}, trying fallback...`);
          }
        }
      } catch (err) {
         console.warn(`Raw fetch failed for ${source.name}, trying fallback...`);
      }

      // STRATEGY 2: RSS2JSON Fallback
      // Robust for FeedBurner or valid RSS blocked by simple proxies
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
            console.error(`Fallback 1 (rss2json) failed for ${source.name}`, fallbackErr);
        }
      }

      // STRATEGY 3: Vercel RSS Parser Fallback
      // Another specialized parser if rss2json fails
      if (!success || chunks.length === 0) {
         try {
            const vercelUrl = `https://rss-to-json-serverless-api.vercel.app/api?feedURL=${encodeURIComponent(fetchUrl)}`;
            const response = await fetch(vercelUrl);
            if (response.ok) {
                const data = await response.json();
                if (data.items && Array.isArray(data.items)) {
                    chunks = data.items.map((item: any) => {
                         // Try to find image in enclosure or media
                         let img = '';
                         if (item.enclosure && item.enclosure.type && item.enclosure.type.startsWith('image')) {
                             img = item.enclosure.url;
                         }
                         if (!img && item.media && item.media.content && item.media.content.url) {
                             img = item.media.content.url;
                         }

                        return {
                            web: {
                                title: item.title,
                                uri: item.url || item.link
                            },
                            meta: {
                                sourceName: source.name,
                                publishedAt: item.created ? new Date(item.created).toISOString() : item.published,
                                imageUrl: img,
                                description: (item.description || '').replace(/<[^>]*>?/gm, '').substring(0, 150)
                            }
                        };
                    });
                    if (chunks.length > 0) success = true;
                }
            }
         } catch (fallbackErr2) {
             console.error(`Fallback 2 (vercel-rss) failed for ${source.name}`, fallbackErr2);
         }
      }

      // STRATEGY 4: FactMaven XML-to-JSON Fallback
      // Final backup
      if (!success || chunks.length === 0) {
          try {
              const factMavenUrl = `https://api.factmaven.com/xml-to-json?xml=${encodeURIComponent(fetchUrl)}`;
              const response = await fetch(factMavenUrl);
              if (response.ok) {
                  const data = await response.json();
                  // Handles structure { rss: { channel: { item: [] } } } or { channel: { item: [] } }
                  const items = data.rss?.channel?.item || data.channel?.item || [];
                  const itemsArray = Array.isArray(items) ? items : (items ? [items] : []);
                  
                  if (itemsArray.length > 0) {
                      chunks = itemsArray.map((item: any) => {
                          let img = '';
                          if (item.enclosure && item.enclosure.url) img = item.enclosure.url;
                          if (!img && item.media_content && item.media_content.url) img = item.media_content.url;
                          
                          return {
                              web: {
                                  title: item.title || 'No Title',
                                  uri: item.link || ''
                              },
                              meta: {
                                  sourceName: source.name,
                                  publishedAt: item.pubDate || '',
                                  imageUrl: img,
                                  description: (item.description || '').replace(/<[^>]*>?/gm, '').substring(0, 150)
                              }
                          };
                      });
                      if (chunks.length > 0) success = true;
                  }
              }
          } catch (fallbackErr3) {
              console.error(`Fallback 3 (factmaven) failed for ${source.name}`, fallbackErr3);
          }
      }

      // STRATEGY 5: Feed2Json Fallback
      // Another highly reliable parser
      if (!success || chunks.length === 0) {
          try {
              const f2jUrl = `https://feed2json.org/convert?url=${encodeURIComponent(fetchUrl)}`;
              const response = await fetch(f2jUrl);
              if (response.ok) {
                  const data = await response.json();
                  if (data.items && Array.isArray(data.items)) {
                      chunks = data.items.map((item: any) => ({
                          web: {
                              title: item.title,
                              uri: item.url
                          },
                          meta: {
                              sourceName: source.name,
                              publishedAt: item.date_published,
                              imageUrl: item.image || item.banner_image || '',
                              description: (item.content_text || item.summary || '').replace(/<[^>]*>?/gm, '').substring(0, 150)
                          }
                      }));
                      if (chunks.length > 0) success = true;
                  }
              }
          } catch (fallbackErr4) {
               console.error(`Fallback 5 (feed2json) failed for ${source.name}`, fallbackErr4);
          }
      }

      if (!success) {
          console.error(`All strategies failed for ${source.name}`);
          // Return empty to avoid breaking Promise.all, let Toast handle the error notification logic via NewsFeed
          return [];
      }

      return chunks;
    });

    const results = await Promise.all(promises);
    // Identify failed sources (empty results) to notify user if needed
    // Logic in NewsFeed component handles empty results handling, here we just return what we got.
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

    // Check if completely empty but sources existed - implies error
    if (validChunks.length === 0 && sources.length > 0) {
        throw new Error(`Failed to fetch news for ${zoneTitle}`);
    }

    return {
      text: `Aggregated ${validChunks.length} articles.`,
      chunks: validChunks
    };

  } catch (error: any) {
    console.error("Critical error in fetchZoneNews:", error);
    // Throw string error to be caught by NewsFeed and shown in Toast
    throw error.message || "Error loading feeds.";
  }
};

export const generateDailyBriefing = async (zones: any[]): Promise<string> => {
  return "Daily briefing generation requires backend API configuration. Please enable the Gemini API to use this feature.";
};
