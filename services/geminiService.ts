
import { GoogleGenAI } from "@google/genai";
import { GroundingChunk, ZoneSource } from "../types";

// Initialize Gemini Client
// The API key must be obtained exclusively from the environment variable process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface ZoneContentResponse {
  text: string;
  chunks: GroundingChunk[];
}

/**
 * Fetches news for a specific zone using Google Search Grounding.
 * This simulates an "RSS Aggregator" by finding the latest content for the user's defined topics.
 */
export const fetchZoneNews = async (zoneTitle: string, sources: ZoneSource[]): Promise<ZoneContentResponse> => {
  try {
    const queryList = sources.map(s => `${s.name} (${s.url})`).join(", ");
    // We ask for a digest. The links will come from the grounding metadata.
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

    return { text, chunks };
  } catch (error) {
    console.error("Error fetching zone news:", error);
    throw error;
  }
};

/**
 * Simulates the "Notification System" by generating a newsletter summary
 * of all active zones.
 */
export const generateDailyBriefing = async (zones: { title: string, sources: ZoneSource[] }[]): Promise<string> => {
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
    return "Error generating daily briefing due to API limitations.";
  }
};
