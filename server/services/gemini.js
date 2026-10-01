import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

/**
 * Classifies an artifact image using Google Gemini Vision API
 * @param {string} imageFilePath - Absolute path to the image file
 * @param {string} mimeType - Image MIME type
 * @returns {Promise<Object|null>} Structured classification object
 */
export async function classifyArtifactImage(imageFilePath, mimeType = 'image/png') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    console.warn('[Gemini] GEMINI_API_KEY is not configured. Classification pending user API key.');
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
    const imageBuffer = fs.readFileSync(imageFilePath);
    const base64Data = imageBuffer.toString('base64');

    const prompt = `You are a specialist in archaeology, digital preservation, and museum artifact curation.
Analyze this archaeological artifact image and provide a structured JSON classification with these exact keys:
{
  "category": "Primary category (e.g., Ceramic Pottery, Bronze Weapon, Gold Jewelry, Stone Sculpture, Ritual Vessel, Ancient Coin)",
  "confidence": 94,
  "era": "Estimated historical era or dynasty (e.g., Late Bronze Age (~1200 BCE))",
  "region": "Likely geographical origin or culture (e.g., Eastern Mediterranean / Aegean)",
  "material": "Primary materials identified (e.g., Terracotta with iron oxide slip)",
  "condition": "Physical condition (e.g., Well Preserved, Repaired, Minor Fractures)",
  "description": "2-3 comprehensive sentences describing the artistic styling, preservation state, and cultural significance."
}
Return ONLY valid raw JSON with no markdown formatting.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType || 'image/png',
                data: base64Data,
              },
            },
          ],
        },
      ],
    });

    let rawText = response.text || '';
    rawText = rawText.trim();
    if (rawText.startsWith('```json')) {
      rawText = rawText.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (rawText.startsWith('```')) {
      rawText = rawText.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const classification = JSON.parse(rawText);
    console.log('[Gemini] Classification successfully generated:', classification.category);
    return classification;
  } catch (error) {
    console.error('[Gemini] Vision classification error:', error.message || error);
    return null;
  }
}

/**
 * Generates vector text embeddings for artifact curatorial descriptions
 * @param {string} text - Curatorial description text
 * @returns {Promise<number[]>} Float array of vector embedding
 */
export async function generateTextEmbedding(text) {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return [];
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    console.warn('[Gemini] GEMINI_API_KEY not configured for text embedding.');
    return [];
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
    
    // We try gemini-embedding-001 first, then text-embedding-004 as fallback
    let res;
    try {
      res = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: text.trim(),
      });
    } catch (embErr) {
      console.warn('[Gemini] gemini-embedding-001 attempt failed, trying text-embedding-004:', embErr.message);
      res = await ai.models.embedContent({
        model: 'text-embedding-004',
        contents: text.trim(),
      });
    }

    const values = res.embeddings?.[0]?.values || [];
    console.log(`[Gemini] Text embedding generated successfully (${values.length} dimensions)`);
    return values;
  } catch (error) {
    console.error('[Gemini] Embedding generation error:', error.message || error);
    return [];
  }
}

/**
 * Calculates cosine similarity between two numeric embedding vectors
 * @param {number[]} a 
 * @param {number[]} b 
 * @returns {number} Cosine similarity (-1 to 1, typically 0 to 1 for text embeddings)
 */
export function cosineSimilarity(a, b) {
  if (
    !a ||
    !b ||
    !Array.isArray(a) ||
    !Array.isArray(b) ||
    a.length === 0 ||
    b.length === 0 ||
    a.length !== b.length
  ) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

