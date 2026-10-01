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
