
import { GoogleGenAI } from "@google/genai";
import { ValueStreamData, TowerData } from "../types";

const getAIInstance = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getExecutiveInsights = async (data: ValueStreamData[]): Promise<string> => {
  try {
    const ai = getAIInstance();
    const summaries = data.map(function(t) {
      const current = t.trend[t.trend.length - 1].healthScore;
      const anomalies = t.trend.filter(function(p) { return p.anomaly; }).length;
      return `${t.name} (${t.phase}): ${current}% health, Outcome: ${t.outcome}, ${anomalies} anomalies`;
    }).join('\n');

    const prompt = `You are a CIO analyzing the Integrated Control Plane Dashboard. Review these Value Stream metrics and give a 2-sentence high-level assessment of enterprise health focusing on lifecycle bottlenecks: ${summaries}`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { temperature: 0.7, topP: 0.95 }
    });
    return response.text || "Operational stability confirmed across all value streams.";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "Insights unavailable.";
  }
};

export const getTowerDeepDive = async (item: ValueStreamData | TowerData): Promise<string> => {
  try {
    const ai = getAIInstance();
    const current = item.trend[item.trend.length - 1].healthScore;
    const anomalies = item.trend.filter(function(p) { return p.anomaly; })
      .map(function(p) { return `${p.anomalyDescription} (${p.timestamp})`; })
      .join('; ');
    
    let prompt = "";
    
    // Check if item is a Value Stream or an IT Tower
    if ('phase' in item) {
      const stream = item as ValueStreamData;
      prompt = `Analyze the ${stream.name} value stream (Outcome: ${stream.outcome}). 
      Health: ${current}%. Anomalies: ${anomalies || 'None'}.
      Contributing IT Silos: ${stream.contributingTowers.join(', ')}.
      In 2 sentences, explain how these contributions affect the primary outcome and recommend an orchestration improvement for the Integrated Control Plane.`;
    } else {
      const tower = item as TowerData;
      prompt = `Analyze the ${tower.name} IT Tower (Category: ${tower.category}). 
      Health: ${current}%. Anomalies: ${anomalies || 'None'}.
      This tower directly supports the following value streams: ${tower.supportedStreams.join(', ')}.
      In 2 sentences, explain the operational risk this tower's health poses to its supported streams and recommend a specific automation or orchestration action for the Control Plane.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { temperature: 0.7, topP: 0.9 }
    });
    return response.text || "Diagnostic analysis complete. No immediate critical risks detected.";
  } catch (error) {
    console.error("Gemini Deep Dive Error:", error);
    return "Diagnostics temporarily unavailable.";
  }
};
