'use server';

import { GoogleGenAI } from "@google/genai";
import { LinkItem } from "../types";

// Helper to initialize Gemini
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set the API_KEY environment variable.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Generates a creative description for a collection based on its items.
 */
export async function generateCollectionDescription(title: string, items: LinkItem[]): Promise<string> {
  try {
    const ai = getAiClient();
    const itemSummaries = items.map(i => `- ${i.title} (${i.url})`).join('\n');
    
    const prompt = `
      I have a collection of links titled "${title}". 
      Here are the items:
      ${itemSummaries}
      
      Please write a short, engaging, and aesthetic description (max 2 sentences) for this collection that would make people want to click. 
      Tone: Curated, professional yet inviting.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "A curated collection of interesting links."; // Fallback
  }
}

/**
 * Suggests a title for a link based on its URL.
 */
export async function suggestLinkTitle(url: string): Promise<string> {
  try {
      const ai = getAiClient();
      const prompt = `
        I have a URL: "${url}".
        Please generate a clean, human-readable title for this link. 
        If it looks like a specific article or product, guess the title. 
        If not, just format the domain name nicely.
        Return ONLY the title string.
      `;

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
      });

      return response.text.trim();
  } catch (error) {
      // Fallback to simple domain parsing
      try {
          const domain = new URL(url).hostname.replace('www.', '');
          return domain.charAt(0).toUpperCase() + domain.slice(1);
      } catch {
          return "New Link";
      }
  }
}