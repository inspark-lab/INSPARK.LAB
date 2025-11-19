
import { GoogleGenAI } from "@google/genai";
import { GroundingChunk, ZoneSource } from "../types";

// Initialize Gemini Client safely
// The API key must be obtained exclusively from the environment variable process.env.API_KEY
const apiKey = process.env.API_KEY;
let ai: GoogleGenAI | null = null;

// Robust initialization: only create client if key exists
if (apiKey) {
  try {
    ai = new GoogleGenAI({ apiKey: apiKey });
  } catch (error) {
    console.warn("Failed to initialize GoogleGenAI client:", error);
  }
} else {
  console.warn("API Key missing or invalid. Using Mock Data mode.");
}

export interface ZoneContentResponse {
  text: string;
  chunks: GroundingChunk[];
}

/**
 * Generates realistic mock data when API is unavailable
 */
const getMockNews = (zoneTitle: string, count: number = 8): ZoneContentResponse => {
  const baseTitles = [
    `Major Breakthrough in ${zoneTitle} Announced Today`,
    `Global ${zoneTitle} Trends: What You Need to Know`,
    `Top Experts Discuss the Future of ${zoneTitle}`,
    `New Regulations Impacting the ${zoneTitle} Sector`,
    `Innovation Spotlight: ${zoneTitle} Startups to Watch`,
    `Market Analysis: ${zoneTitle} Sees Unprecedented Growth`,
    `Exclusive: Behind the Scenes of the Latest ${zoneTitle} Event`,
    `Guide: How to Navigate the Changing Landscape of ${zoneTitle}`
  ];

  // Scramble/select distinct titles based on requested count
  const selectedTitles = baseTitles.slice(0, count);

  const chunks: GroundingChunk[] = selectedTitles.map((title, i) => ({
    web: {
      title: title,
      uri: `https://example.com/mock-news/${zoneTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/${i + 1}`
    }
  }));

  return {
    text: `## Latest Headlines for ${zoneTitle} (Mock Data)\n\nSystem is currently running in fallback mode due to missing API configuration.`,
    chunks
  };
};

/**
 * Fetches news for a specific zone using Google Search Grounding.
 * Includes fallback to mock data if API is missing or fails.
 */
export const fetchZoneNews = async (zoneTitle: string, sources: ZoneSource[]): Promise<ZoneContentResponse> => {
  // 1. Check if API client is available
  if (!ai || !apiKey) {
    console.log(`API Key missing. Returning mock news for zone: ${zoneTitle}`);
    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 800));
    return getMockNews(zoneTitle);
  }

  try {
    const queryList = sources.map(s => `${s.name} (${s.url})`).join(", ");
    const prompt = `
      You are a news aggregator backend. 
      Find the absolute latest and most important news headlines for the following websites/sources: ${queryList}.
      Focus on the category: ${zoneTitle}.
      Provide a concise markdown summary of the top 5-8 stories. 
      Do not use strictly JSON, just readable markdown text with bullet points.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "No news found at this time.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];

    // If API returns no chunks (sometimes happens), fallback to mock to keep UI populated
    if (chunks.length === 0) {
      console.warn("API returned no chunks, using fallback.");
      return getMockNews(zoneTitle);
    }

    return { text, chunks };
  } catch (error) {
    // 2. Catch-all for API errors (Network, 401, 500, Quota)
    console.error("Error fetching zone news (API failure). Using fallback mock data.", error);
    return getMockNews(zoneTitle);
  }
};

/**
 * Simulates the "Notification System" by generating a newsletter summary.
 */
export const generateDailyBriefing = async (zones: { title: string, sources: ZoneSource[] }[]): Promise<string> => {
  if (!ai || !apiKey) {
    return `
# INSpark Daily Briefing (Preview Mode)

*System Note: API Key is missing. Displaying template.*

## Good Morning!
Here is your daily summary for **${new Date().toLocaleDateString()}**.

### ${zones[0]?.title || 'General News'}
* **Top Story:** Major industry shifts observed this week.
* **Highlight:** Key players announce new strategic partnerships.
* **Insight:** Analysts predict positive trends for the upcoming quarter.

### ${zones[1]?.title || 'Technology'}
* **Innovation:** New AI models demonstrate reasoning capabilities.
* **Update:** Security patches released for major platforms.

*To see real AI-generated summaries, please configure a valid Google Gemini API Key.*
    `;
  }

  try {
    const topics = zones.map(z => `${z.title}: ${z.sources.map(s => s.name).join(', ')}`).join('\n');
    
    const prompt = `
      Generate a "Daily Morning Briefing" email content for a user interested in these areas:
      ${topics}

      Use Google Search to find the very latest headlines for these topics right now.
      Format the output as a clean, professional email body.
      Start with "Good Morning, here is your INSpark Daily Briefing."
      Group by Zone Title.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
         tools: [{ googleSearch: {} }],
      },
    });

    return response.text || "Unable to generate briefing.";
  } catch (error) {
    console.error("Error generating briefing:", error);
    return "Error generating daily briefing due to API limitations. Please try again later.";
  }
};
