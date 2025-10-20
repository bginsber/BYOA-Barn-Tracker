/**
 * Vision Service
 *
 * AI-powered image analysis using Google Gemini Vision API
 * Supports:
 * - Food/meal calorie estimation
 * - Horse blanket detection
 * - General image description
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import * as FileSystem from 'expo-file-system';
import { PhotoAnalysis, PhotoAnalysisRequest } from '../types/journal';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || '');

/**
 * Convert image URI to base64 for Gemini API
 */
async function imageToBase64(uri: string): Promise<string> {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw new Error('Failed to process image');
  }
}

/**
 * Analyze food/meal in photo and estimate calories
 */
async function analyzeFoodPhoto(base64Image: string): Promise<Partial<PhotoAnalysis>> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are a nutrition expert analyzing a food photo. Please analyze this image and provide:

1. List of food items visible
2. Estimated portion size for each item
3. Estimated calories for each item
4. Total estimated calories for the meal

Format your response as JSON with this structure:
{
  "foodDetected": true/false,
  "foodItems": [
    {
      "name": "food name",
      "quantity": "estimated portion",
      "calories": estimated_number,
      "confidence": 0.0-1.0
    }
  ],
  "totalCalories": total_number,
  "description": "brief description of the meal"
}

If no food is detected, set foodDetected to false and provide a brief description of what you see instead.
Be realistic with calorie estimates and indicate confidence levels.
`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image,
        },
      },
    ]);

    const response = result.response;
    const text = response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return {
        foodDetected: analysis.foodDetected,
        foodItems: analysis.foodItems,
        totalCalories: analysis.totalCalories,
        description: analysis.description,
        analyzedAt: Date.now(),
      };
    }

    // Fallback if JSON parsing fails
    return {
      foodDetected: false,
      description: text,
      analyzedAt: Date.now(),
    };
  } catch (error) {
    console.error('Error analyzing food photo:', error);
    throw new Error('Failed to analyze food in photo');
  }
}

/**
 * Analyze horse photo for blanket status
 */
async function analyzeHorsePhoto(base64Image: string): Promise<Partial<PhotoAnalysis>> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are an experienced equestrian expert analyzing a horse photo. Please analyze this image and provide:

1. Whether a horse is visible in the photo
2. If the horse is wearing a blanket/rug (yes/no/uncertain)
3. If blanketed, estimate the blanket type (none, light, medium, heavy)
4. Visible coat condition (clipped, short, medium, long)
5. Any other relevant observations about the horse's condition

Format your response as JSON with this structure:
{
  "horseDetected": true/false,
  "blanketStatus": "blanketed" | "not_blanketed" | "uncertain",
  "blanketType": "none" | "light" | "medium" | "heavy" | "uncertain",
  "horseCondition": {
    "visible": true/false,
    "coatCondition": "clipped" | "short" | "medium" | "long",
    "notes": "any other observations"
  },
  "description": "brief description of what you see",
  "confidence": 0.0-1.0
}

If no horse is detected, set horseDetected to false and describe what you see instead.
`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image,
        },
      },
    ]);

    const response = result.response;
    const text = response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return {
        horseDetected: analysis.horseDetected,
        blanketStatus: analysis.blanketStatus,
        blanketType: analysis.blanketType,
        horseCondition: analysis.horseCondition,
        description: analysis.description,
        confidence: analysis.confidence,
        analyzedAt: Date.now(),
      };
    }

    // Fallback if JSON parsing fails
    return {
      horseDetected: false,
      description: text,
      analyzedAt: Date.now(),
    };
  } catch (error) {
    console.error('Error analyzing horse photo:', error);
    throw new Error('Failed to analyze horse in photo');
  }
}

/**
 * General photo analysis - barn activities, animals, etc.
 */
async function analyzeGeneralPhoto(base64Image: string): Promise<Partial<PhotoAnalysis>> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are analyzing a barn/farm photo. Please provide:

1. General description of what's in the photo
2. Any animals detected (horses, dogs, cats, chickens, etc.)
3. Any barn activities or tasks visible
4. Overall scene context

Format your response as JSON with this structure:
{
  "description": "detailed description of the scene",
  "animalsDetected": ["list", "of", "animals"],
  "barnActivity": "description of any activities/tasks visible",
  "confidence": 0.0-1.0
}

Be specific and observant. This is for a barn management journal.
`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image,
        },
      },
    ]);

    const response = result.response;
    const text = response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return {
        description: analysis.description,
        animalsDetected: analysis.animalsDetected,
        barnActivity: analysis.barnActivity,
        confidence: analysis.confidence,
        analyzedAt: Date.now(),
      };
    }

    // Fallback if JSON parsing fails
    return {
      description: text,
      analyzedAt: Date.now(),
    };
  } catch (error) {
    console.error('Error analyzing general photo:', error);
    throw new Error('Failed to analyze photo');
  }
}

/**
 * Main photo analysis function
 */
export async function analyzePhoto(request: PhotoAnalysisRequest): Promise<PhotoAnalysis> {
  try {
    // Convert image to base64
    const base64Image = await imageToBase64(request.photoUri);

    let analysis: PhotoAnalysis = {
      analyzedAt: Date.now(),
    };

    // Run appropriate analysis based on type
    switch (request.analysisType) {
      case 'food':
        const foodAnalysis = await analyzeFoodPhoto(base64Image);
        analysis = { ...analysis, ...foodAnalysis };
        break;

      case 'horse':
        const horseAnalysis = await analyzeHorsePhoto(base64Image);
        analysis = { ...analysis, ...horseAnalysis };
        break;

      case 'general':
        const generalAnalysis = await analyzeGeneralPhoto(base64Image);
        analysis = { ...analysis, ...generalAnalysis };
        break;

      case 'all':
        // Run all analyses in parallel
        const [food, horse, general] = await Promise.all([
          analyzeFoodPhoto(base64Image).catch(() => ({})),
          analyzeHorsePhoto(base64Image).catch(() => ({})),
          analyzeGeneralPhoto(base64Image).catch(() => ({})),
        ]);
        analysis = { ...analysis, ...food, ...horse, ...general };
        break;
    }

    return analysis;
  } catch (error) {
    console.error('Error in photo analysis:', error);
    throw error;
  }
}

/**
 * Batch analyze multiple photos
 */
export async function analyzePhotos(
  photoUris: string[],
  analysisType: PhotoAnalysisRequest['analysisType'] = 'general'
): Promise<PhotoAnalysis[]> {
  const analysisPromises = photoUris.map((uri) =>
    analyzePhoto({ photoUri: uri, analysisType })
  );

  return Promise.all(analysisPromises);
}

export const visionService = {
  analyzePhoto,
  analyzePhotos,
};
