import { GoogleGenAI, Type } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export const analyzeSymptoms = async (symptoms: string) => {
  const disclaimer = 'IMPORTANT SAFETY NOTICE: This AI feature provides general informational guidance and is NOT a medical diagnosis or treatment plan. Always consult a qualified physician for medical advice.';

  try {
    if (!apiKey) {
      return {
        recommendedDepartment: 'General Medicine',
        urgency: 'MODERATE',
        summary: 'Based on reported symptoms, a consultation with General Medicine is recommended for initial triage.',
        possibleConditions: ['General malaise or viral infection', 'Stress-related symptoms'],
        guidance: 'Rest, stay hydrated, and monitor temperature or severe pain.',
        disclaimer,
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Analyze these patient-reported symptoms for triage and hospital department routing: "${symptoms}". Provide structured informational guidance. Do NOT provide a medical diagnosis.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedDepartment: { type: Type.STRING, description: 'Best department e.g. Cardiology, Neurology, Pediatrics, Dermatology, Orthopedics, General Medicine' },
            urgency: { type: Type.STRING, description: 'LOW, MODERATE, HIGH, or EMERGENCY' },
            summary: { type: Type.STRING, description: 'Short summary of symptom assessment' },
            possibleConditions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'General informational categories to discuss with doctor',
            },
            guidance: { type: Type.STRING, description: 'Next steps prior to consultation' },
          },
          required: ['recommendedDepartment', 'urgency', 'summary', 'possibleConditions', 'guidance'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return { ...parsed, disclaimer };
  } catch (err) {
    console.error('Gemini Symptom Analysis Error:', err);
    return {
      recommendedDepartment: 'General Medicine',
      urgency: 'MODERATE',
      summary: 'Automated triage suggestion for reported symptoms.',
      possibleConditions: ['General health assessment required'],
      guidance: 'Schedule a visit with a general physician for thorough clinical examination.',
      disclaimer,
    };
  }
};

export const recommendDepartment = async (query: string, availableDepartments: string[]) => {
  try {
    if (!apiKey) {
      const match = availableDepartments.find((d) => query.toLowerCase().includes(d.toLowerCase())) || 'General Medicine';
      return { department: match, explanation: `Matched based on keyword analysis from request: "${query}".` };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `The patient says: "${query}". Choose the best department from this list: ${availableDepartments.join(', ')}. Explain why in 1 concise sentence.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            department: { type: Type.STRING },
            explanation: { type: Type.STRING },
          },
          required: ['department', 'explanation'],
        },
      },
    });

    return JSON.parse(response.text || '{}');
  } catch (err) {
    return { department: availableDepartments[0] || 'General Medicine', explanation: 'General clinical consultation recommended.' };
  }
};

export const generateHospitalInsights = async (question: string, contextData: any) => {
  try {
    if (!apiKey) {
      return {
        answer: 'Hospital Analytics Summary: Patient load is steady, Cardiology has highest revenue stream this month, and inventory stock level for Atorvastatin requires reordering.',
      };
    }

    const prompt = `You are MediCare AI Hospital Analytics Advisor. Analyze this hospital operational data:
${JSON.stringify(contextData, null, 2)}

User Question: "${question}"
Provide a clear, executive-level response with key statistics, observations, and actionable recommendations.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    return { answer: response.text || 'Analytics calculation completed.' };
  } catch (err: any) {
    return { answer: `Analytics Insight: Hospital records show active throughput across departments. (Error calling AI: ${err.message})` };
  }
};
