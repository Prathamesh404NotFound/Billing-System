/**
 * Google Gemini API Service
 * Handles bill image extraction using Gemini Vision API
 */

export interface ExtractedBillData {
  dealerName?: string;
  items: Array<{
    itemName: string;
    quantity: number;
    size?: string;
    costPrice: number;
  }>;
  totalAmount?: number;
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent';

/**
 * Convert image file to base64
 */
export async function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Extract bill data from image using Gemini Vision API
 */
export async function extractBillData(imageFile: File): Promise<ExtractedBillData> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.');
  }

  try {
    const base64Image = await imageToBase64(imageFile);

    const prompt = `You are reading a dealer purchase bill image.

Extract the following information in JSON format only (no markdown, no code blocks, just pure JSON):

{
  "dealerName": "string or null",
  "items": [
    {
      "itemName": "string",
      "quantity": number,
      "size": "string or null",
      "costPrice": number
    }
  ],
  "totalAmount": number or null
}

Rules:
- Sort items clearly and normalize names
- Handle handwritten bills and partial unreadable data gracefully
- If any field cannot be read, use null or 0
- Extract only valid numeric values for prices and quantities
- Return valid JSON only, no explanations or additional text`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
            {
              inline_data: {
                mime_type: imageFile.type || 'image/jpeg',
                data: base64Image,
              },
            },
          ],
        },
      ],
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Gemini API error: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();

    // Extract text from Gemini response
    const textResponse =
      data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!textResponse) {
      throw new Error('No response from Gemini API');
    }

    // Try to extract JSON from the response (handle markdown code blocks)
    let jsonText = textResponse.trim();
    
    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Try to find JSON object in the response
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    const parsed = JSON.parse(jsonText) as ExtractedBillData;

    // Validate and normalize the response
    return {
      dealerName: parsed.dealerName || undefined,
      items: Array.isArray(parsed.items)
        ? parsed.items.map((item) => ({
            itemName: String(item.itemName || '').trim(),
            quantity: Number(item.quantity) || 0,
            size: item.size ? String(item.size).trim() : undefined,
            costPrice: Number(item.costPrice) || 0,
          }))
        : [],
      totalAmount: parsed.totalAmount ? Number(parsed.totalAmount) : undefined,
    };
  } catch (error) {
    console.error('[Gemini] Error extracting bill data:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to extract bill data from image');
  }
}

/**
 * Fuzzy match item name with existing items
 */
export function fuzzyMatchItem(
  searchName: string,
  items: Array<{ name: string; id: string }>
): { id: string; name: string; score: number } | null {
  const normalizedSearch = searchName.toLowerCase().trim();

  let bestMatch: { id: string; name: string; score: number } | null = null;
  let bestScore = 0;

  for (const item of items) {
    const normalizedItem = item.name.toLowerCase().trim();

    // Exact match
    if (normalizedItem === normalizedSearch) {
      return { id: item.id, name: item.name, score: 1 };
    }

    // Contains match
    if (normalizedItem.includes(normalizedSearch) || normalizedSearch.includes(normalizedItem)) {
      const score = Math.min(normalizedSearch.length, normalizedItem.length) / Math.max(normalizedSearch.length, normalizedItem.length);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = { id: item.id, name: item.name, score };
      }
    }

    // Word-based match
    const searchWords = normalizedSearch.split(/\s+/);
    const itemWords = normalizedItem.split(/\s+/);
    const matchingWords = searchWords.filter((word) =>
      itemWords.some((itemWord) => itemWord.includes(word) || word.includes(itemWord))
    );
    if (matchingWords.length > 0) {
      const score = matchingWords.length / Math.max(searchWords.length, itemWords.length);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = { id: item.id, name: item.name, score };
      }
    }
  }

  // Return match if score is above threshold (0.5 = 50% similarity)
  return bestScore >= 0.5 ? bestMatch : null;
}

