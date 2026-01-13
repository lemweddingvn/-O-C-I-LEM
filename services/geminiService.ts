
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  /**
   * Tạo prompt nghệ thuật dựa trên ý tưởng người dùng
   * Sử dụng gemini-3-flash-preview cho tác vụ văn bản
   */
  async generateCreativePrompt(userIdea: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Act as a professional photography prompt engineer. 
        Create a concise, high-end artistic prompt (30-50 words) in English.
        Aesthetic style: "White Tone", pure, minimalist, elegant, luxury, soft natural lighting, high-key photography.
        User's base idea: ${userIdea || "Romantic wedding portrait"}
        Output ONLY the English prompt text, no commentary.`,
      });
      return response.text?.trim() || "";
    } catch (error) {
      console.error("AI Prompt Generation Error:", error);
      return userIdea;
    }
  }

  /**
   * Phối trộn nhân vật vào bối cảnh
   * Sử dụng gemini-2.5-flash-image cho tác vụ hình ảnh
   */
  async blendImages(portraitBase64: string, backgroundBase64: string, prompt: string, variationType: string): Promise<string> {
    try {
      let variationDetail = "";
      switch (variationType) {
        case 'natural':
          variationDetail = "PURE NATURAL: Focus on neutral white balance, soft shadows, and high-key exposure. Maintain a clean, airy feel.";
          break;
        case 'cinematic':
          variationDetail = "ETHEREAL CINEMATIC: Add a subtle dreamlike glow, soft rim lighting on the subject, and creamy bokeh backgrounds.";
          break;
        case 'studio':
          variationDetail = "MINIMALIST LUXE: Precision studio lighting (5500K), flawless skin texture, and high-fashion composition.";
          break;
      }

      const systemInstruction = `
        YOU ARE A MASTER COMPOSITOR AT LEM WEDDING STUDIO.
        TASK: Harmoniously blend the subject (Image 1) into the background (Image 2).
        
        MANDATORY AESTHETIC RULES:
        1. WHITE TONE: Neutralize yellow/blue tints. Focus on whites, creams, and clean neutral colors.
        2. LIGHTING MATCH: Analyze background light source. Apply identical light angle, intensity, and temperature to the subject.
        3. REALISM: Create realistic contact shadows at feet/base. Ensure Ambient Occlusion is present.
        4. FIDELITY: Maintain the subject's original facial features and sharp resolution. Do not distort proportions.
        5. COMPOSITION: Scale the subject realistically according to the background's perspective.
        
        STYLE DIRECTION: ${variationDetail}
        ADDITIONAL REQUEST: ${prompt}
        
        RETURN ONLY THE BASE64 IMAGE DATA. NO TEXT IN RESPONSE.
      `;

      const extractBase64 = (dataUrl: string) => dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: extractBase64(portraitBase64), mimeType: 'image/png' } },
            { inlineData: { data: extractBase64(backgroundBase64), mimeType: 'image/png' } },
            { text: systemInstruction }
          ]
        },
        config: {
          imageConfig: {
            aspectRatio: "3:4"
          }
        }
      });

      if (!response.candidates?.[0]?.content?.parts) {
        throw new Error("AI did not return any content parts.");
      }
      
      const imagePart = response.candidates[0].content.parts.find(p => p.inlineData);
      if (imagePart?.inlineData) {
        return `data:image/png;base64,${imagePart.inlineData.data}`;
      }
      
      throw new Error("No image data found in AI response.");
    } catch (error) {
      console.error("Gemini Image Blending Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
