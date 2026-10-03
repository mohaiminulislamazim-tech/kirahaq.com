import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { paymentRouter } from "./server/payment/routes";

async function startServer() {
  const app = express();
  // Hosting platforms (cPanel / Namecheap / CloudLinux Passenger) inject PORT.
  // Local development falls back to 3000.
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", brand: "Kira Haq" });
  });

  // Dedicated Payment API Router (bKash, Nagad, Card, Refund, Webhooks)
  app.use("/api/payments", paymentRouter);

  // AI Islamic Wellness & Sunnah Health Advisor endpoint
  app.post("/api/ai-advisor", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query parameter is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Fallback intelligent response if API key is not set
        return res.json({
          response: `In Islamic Sunnah traditions, natural foods like Pure Honey, Black Seed (Kalonji), Extra Virgin Olive Oil, and Ajwa Dates are highly recommended for overall health, immunity, and vitality. For your query: "${query}", we recommend trying our Sidr Honey for digestion & energy, or Black Seed Oil for immune defense!`,
          recommendations: ["Sidr Honey (Premium)", "Black Seed (Kalonji) Oil", "Extra Virgin Olive Oil"]
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `You are an expert Islamic Sunnah & Holistic Health Consultant for 'Kira Haq' (Pure by Nature, Guided by Sunnah). 
You give warm, respectful, science-backed and Hadith/Sunnah-informed wellness advice.
Our product store features:
1. Sidr Honey (Premium) - $24.99 USD / ৳ 2,999 BDT
2. Black Seed (Kalonji) Oil / Seeds - $12.99 USD / ৳ 1,550 BDT
3. Extra Virgin Olive Oil - $19.99 USD / ৳ 2,390 BDT
4. Ajwa Dates (Madina) - $15.99 USD / ৳ 2,990 BDT
5. Raw Honey Comb - $18.99 USD / ৳ 2,250 BDT
6. Hijama & Ruqyah Health Consultation services

Provide a concise, polite, helpful response in 2-3 paragraphs. Include relevant Quran/Hadith references where applicable, and recommend specific products from Kira Haq catalog that match their concern.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: query,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      return res.json({
        response: response.text,
      });
    } catch (error: any) {
      console.error("AI Advisor Error:", error);
      return res.status(500).json({ 
        error: "Failed to process wellness query",
        details: error?.message || "Unknown error"
      });
    }
  });

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
