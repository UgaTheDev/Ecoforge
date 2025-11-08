import * as FileSystem from 'expo-file-system';

const API_URL = 'http://172.20.10.3:5001';

export interface ClassificationResult {
  isTrash: boolean;
  isFood: boolean;
  confidence: number;
  rawScore: number;
}

export const classifyImage = async (imageUri: string): Promise<ClassificationResult> => {
  try {
    // Convert image to base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: 'base64',
    });

    const response = await fetch(`${API_URL}/api/classify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: `data:image/jpeg;base64,${base64}`
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Classification failed');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Classification error:', error);
    throw error;
  }
};

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
};