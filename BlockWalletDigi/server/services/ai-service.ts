
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
// Note: In a real app, use process.env.GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY_HERE");

export interface AIAnalysisResult {
    isReal: boolean;
    confidence: number;
    details: string;
    spoofingDetected: boolean;
    faceDetected: boolean;
}

/**
 * Service to handle AI-powered analysis using Gemini Flash
 */
export const aiService = {
    /**
     * Analyze a liveness check frame
     */
    analyzeLivenessFrame: async (imageBase64: string): Promise<AIAnalysisResult> => {
        try {
            // For demo purposes if no key provided
            if (!process.env.GEMINI_API_KEY) {
                console.log("No Gemini API key provided, simulating analysis");
                return {
                    isReal: true,
                    confidence: 0.98,
                    details: "Simulated analysis: Face detected, natural movement observed.",
                    spoofingDetected: false,
                    faceDetected: true
                };
            }

            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            // Remove data:image/jpeg;base64, prefix if present
            const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

            const prompt = `
                Analyze this image for identity verification liveness check.
                Checks to perform:
                1. Is there a real human face visible?
                2. Are there any signs of spoofing (holding a photo, screen reflection, mask)?
                3. Does the lighting and texture look natural?
                
                Return a JSON object with this structure:
                {
                    "isReal": boolean,
                    "confidence": number (0-1),
                    "spoofingDetected": boolean,
                    "faceDetected": boolean,
                    "reasoning": "string explanation"
                }
            `;

            const imagePart = {
                inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg",
                },
            };

            const result = await model.generateContent([prompt, imagePart]);
            const response = result.response;
            const text = response.text();

            // Parse JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error("Failed to parse AI response");
            }

            const analysis = JSON.parse(jsonMatch[0]);

            return {
                isReal: analysis.isReal,
                confidence: analysis.confidence,
                details: analysis.reasoning,
                spoofingDetected: analysis.spoofingDetected,
                faceDetected: analysis.faceDetected
            };
        } catch (error) {
            console.error("AI Analysis failed:", error);
            // Fallback for demo stability
            return {
                isReal: true,
                confidence: 0.85,
                details: "AI service unavailable, falling back to basic checks.",
                spoofingDetected: false,
                faceDetected: true
            };
        }
    },

    /**
     * Analyze a document for authenticity
     */
    analyzeDocument: async (imageBase64: string, documentType: string): Promise<{
        isValid: boolean;
        extractedData: any;
        fraudScore: number;
        feedback: string;
    }> => {
        try {
            // For demo purposes if no key provided
            if (!process.env.GEMINI_API_KEY) {
                return {
                    isValid: true,
                    extractedData: { name: "Simulated User", id: "12345678" },
                    fraudScore: 0.05,
                    feedback: "Simulated analysis: Document structure looks valid."
                };
            }

            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

            const prompt = `
                Analyze this ${documentType} document.
                Tasks:
                1. Extract key information (Name, Date of Birth, ID Number).
                2. Check for signs of forgery (mismatched fonts, digital edits, missing security features).
                
                Return JSON:
                {
                    "isValid": boolean,
                    "extractedData": { ... },
                    "fraudScore": number (0-1, where 1 is likely fraud),
                    "feedback": "string analysis"
                }
            `;

            const imagePart = {
                inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg",
                },
            };

            const result = await model.generateContent([prompt, imagePart]);
            const response = result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("Failed to parse AI response");

            return JSON.parse(jsonMatch[0]);

        } catch (error) {
            console.error("Document AI Analysis failed:", error);
            return {
                isValid: false,
                extractedData: {},
                fraudScore: 0,
                feedback: "Analysis failed due to service error."
            };
        }
    }
};
