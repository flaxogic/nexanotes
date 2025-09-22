
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export async function summarizeNote(content: string): Promise<string> {
  if (!process.env.API_KEY) {
    return "API Key not configured. Please set the API_KEY environment variable.";
  }
  if (!content || content.trim().length < 10) {
    return "Note content is too short to summarize.";
  }

  try {
    // FIX: Added explicit GenerateContentResponse type for the response object.
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Summarize the following note into a single, compelling sentence that captures its main point. The summary should be concise and engaging. Note:\n\n---\n\n${content}`,
        config: {
          temperature: 0.7,
          topP: 1,
          topK: 32,
        },
    });

    // FIX: Per coding guidelines, access the text property directly for the response.
    return response.text;
  } catch (error) {
    console.error("Error summarizing note:", error);
    return "Could not generate summary. The content may be too sensitive or the API call failed.";
  }
}

export async function searchGifs(query: string): Promise<{ url: string; alt: string }[]> {
  if (!process.env.API_KEY) {
    console.error("API Key not configured for GIF search.");
    return [];
  }
  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Act as a GIF search engine. Find 12 high-quality, publicly accessible GIFs related to the query: "${query}". Provide a short, descriptive alt text for each. IMPORTANT: The URLs must be direct links to GIF files (ending in .gif) from domains that explicitly allow hotlinking and have permissive CORS policies, like i.imgur.com. Do not provide links to pages like giphy.com or tenor.com, only direct image URLs.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            gifs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  url: {
                    type: Type.STRING,
                    description: 'Direct URL to the GIF file.',
                  },
                  alt: {
                    type: Type.STRING,
                    description: 'A short, descriptive alt text for the GIF.',
                  },
                },
              },
            },
          },
        },
      },
    });

    const jsonString = response.text.trim();
    if (jsonString) {
      const parsed = JSON.parse(jsonString);
      return parsed.gifs || [];
    }
    return [];
  } catch (error) {
    console.error("Error searching for GIFs:", error);
    return [];
  }
}