

import { GoogleGenAI, GenerateContentResponse, GenerateContentParameters } from "@google/genai";
import { Signal, SignalSource, NewsArticle, ChatMessage, UserProfile } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * A wrapper for the generateContent call that includes retry logic with exponential backoff.
 * This helps make the application more resilient to transient network errors or temporary server-side issues,
 * especially rate limiting.
 * @param params The parameters for the generateContent call.
 * @param retries The number of times to retry on failure.
 * @param delay The initial delay between retries in milliseconds.
 * @returns The response from the AI model.
 */
const generateContentWithRetry = async (
    params: GenerateContentParameters,
    retries = 3, // Increased to 3 retries (4 total attempts)
    delay = 1000
): Promise<GenerateContentResponse> => {
    let lastError: unknown;
    for (let i = 0; i < retries + 1; i++) {
        try {
            const response = await ai.models.generateContent(params);
            // Defensive check: ensure response is not empty, which can happen with certain errors.
            if (!response.text && !response.candidates) {
                 throw new Error("AI response was empty or malformed.");
            }
            return response;
        } catch (error) {
            lastError = error;
            console.warn(`API call attempt ${i + 1} failed.`, error);

            if (i < retries) {
                // Exponential backoff with jitter
                const backoffDelay = delay * Math.pow(2, i) + (Math.random() * 1000); 
                
                const errorMessage = (error instanceof Error) ? error.message : String(error);
                if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
                     console.warn(`Rate limit detected. Retrying in ${backoffDelay / 1000}s...`);
                } else {
                    console.warn(`Retrying in ${backoffDelay / 1000}s...`);
                }
                
                await new Promise(res => setTimeout(res, backoffDelay));
            }
        }
    }
    throw lastError;
};

/**
 * Extracts a JSON object from a string, cleaning up markdown fences and handling duplicated responses.
 * @param text The raw string response from the AI.
 * @returns The parsed JSON object.
 */
const extractJsonObject = <T>(text: string): T => {
    // The model can return the JSON in a markdown block, or with other text.
    // We want to find the full JSON object, which starts with { and ends with }.
    // Or it could be an array that starts with [ and ends with ].
    let jsonString = text;
    
    const firstBrace = jsonString.indexOf('{');
    const firstBracket = jsonString.indexOf('[');

    let startIndex = -1;

    if (firstBrace === -1 && firstBracket === -1) {
        throw new Error("No JSON object or array found in AI response.");
    }

    if (firstBrace > -1 && firstBracket > -1) {
        startIndex = Math.min(firstBrace, firstBracket);
    } else if (firstBrace > -1) {
        startIndex = firstBrace;
    } else {
        startIndex = firstBracket;
    }

    const lastBrace = jsonString.lastIndexOf('}');
    const lastBracket = jsonString.lastIndexOf(']');

    const lastIndex = Math.max(lastBrace, lastBracket);
    
    if (lastIndex < startIndex) {
        throw new Error("Malformed JSON object found in AI response.");
    }

    jsonString = jsonString.substring(startIndex, lastIndex + 1);

    const sanitizedJsonText = jsonString.replace(/,\s*(?=[}\]])/g, "");

    try {
        return JSON.parse(sanitizedJsonText) as T;
    } catch (error) {
        console.error("Failed to parse JSON:", sanitizedJsonText);
        throw new Error("Failed to parse JSON from AI response.");
    }
};


export const generateMarketBriefing = async (): Promise<string> => {
  const prompt = `
    Provide a concise yet comprehensive overview of the global financial market sentiment and key events over the last 12 hours.
    Your analysis MUST be based on real-time web data.
    Cover major indices (e.g., S&P 500, Nasdaq), cryptocurrencies (e.g., Bitcoin), and commodities (e.g., Gold, Crude Oil).
    Mention key influencing factors like central bank signals, major economic data releases, and significant geopolitical events.
    The tone should be professional, analytical, and neutral.
    This is for informational and educational purposes ONLY.

    Return ONLY the raw text of the briefing. Do not include a title, markdown formatting (like headings or bold text), or any other surrounding text or explanations. The entire response should be a single block of plain text.
  `;

  let responseText = '';
  try {
    const response: GenerateContentResponse = await generateContentWithRetry({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    if (!response.text) {
      console.error("AI market briefing response was empty or blocked. Full response:", JSON.stringify(response, null, 2));
      throw new Error("Failed to get a valid market briefing from the AI. The content may have been blocked or the model returned an empty response.");
    }
    
    responseText = response.text.trim();
    return responseText;

  } catch (error) {
    console.error("Error generating market briefing:", error);
    const errorMessage = (error instanceof Error) ? error.message : String(error);

    if (errorMessage.includes('403') || errorMessage.includes('PERMISSION_DENIED')) {
        throw new Error("Permission Denied. Please check your API key and project settings.");
    }
    if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
        throw new Error("The service is currently busy due to high demand. Please wait a moment and try again.");
    }
    if (responseText) {
        console.error("Problematic AI response text for briefing:", responseText);
    }
    throw new Error("Failed to get market briefing from AI. The model may be overloaded or the content may have been blocked.");
  }
};


export const generateTradingSignal = async (assetName: string, userProfile: UserProfile): Promise<Omit<Signal, 'status'>> => {
  const prompt = `
    Conduct a deep and comprehensive multi-dimensional trading analysis for ${assetName}.
    This analysis MUST be tailored for a trader with the following profile:
    - Trading Style: ${userProfile.tradingStyle}
    - Risk Tolerance: ${userProfile.riskTolerance}
    
    This profile must fundamentally shape your entire analysis. For example, a 'Low' risk tolerance requires tighter stop-losses and more conservative profit targets. A 'Scalper' style necessitates a focus on very short-term price movements.

    Your FIRST and MOST CRITICAL step is to perform a deep web search to find the current, real-time market price for this asset.
    Your entire analysis, especially the "entryPrice", "tp1", "tp2", and "sl" values, MUST be anchored to this fetched price and customized for the user's profile. The "entryPrice" must be extremely close to the current market price you discover.

    It is CRITICAL that you conduct a thorough web search, synthesizing real-time data from a diverse set of high-quality, reliable financial sources (e.g., major news outlets, official market data providers, institutional analysis). This information MUST NOT BE OLDER THAN 12 HOURS. Do not rely on a single source; your analysis must be a holistic synthesis of multiple perspectives.
    
    This request is for informational and educational purposes ONLY. The output is a hypothetical analysis and MUST NOT be considered financial advice.

    Based on your deep search and analysis, provide a single, raw, valid JSON object.
    Your response MUST be ONLY the JSON object, with no surrounding text or markdown.

    **JSON Formatting Rules (CRITICAL):**
    - All keys and string values must be enclosed in double quotes.
    - Any double-quote characters (") inside a string value MUST be escaped with a backslash (e.g., "description": "A \\"bullish\\" cross was observed."). This is essential for the JSON to be valid.
    - Multi-line text in strings should use the '\\n' character for newlines.
    - Do not use trailing commas.
    - Do not include comments.

    The JSON object must conform to the following structure:
    {
      "direction": "'SELL' or 'BUY' (must be uppercase)",
      "confidence": "number (an integer between 70 and 95 representing the confidence in this signal)",
      "entryPrice": "string (hypothetical entry price, e.g., '3320.1', which MUST be very close to the real-time price you fetched)",
      "tp1": "string (hypothetical first take profit price, e.g., '3309.6')",
      "tp2": "string (hypothetical second take profit price, e.g., '3304.9')",
      "sl": "string (hypothetical stop loss price, e.g., '3328.5')",
      "pivotPoints": {
        "r2": "string (Resistance 2 price level)",
        "r1": "string (Resistance 1 price level)",
        "pivot": "string (Main pivot price level)",
        "s1": "string (Support 1 price level)",
        "s2": "string (Support 2 price level)"
      },
      "rsi": {
        "value": "number (The 14-period RSI value, e.g., 65.4)",
        "interpretation": "A string describing the RSI state. CRITICALLY, this MUST be one of 'Overbought', 'Oversold', or 'Neutral'."
      },
      "sma": {
        "sma20": "string (20-period Simple Moving Average price)",
        "sma50": "string (50-period Simple Moving Average price)",
        "sma100": "string (100-period Simple Moving Average price)"
      },
      "strategyDescription": "string (A 3-4 paragraph detailed analysis of the trading strategy, covering technical and fundamental aspects. Use \\n for new paragraphs. Crucially, you MUST cite the web sources you used for your analysis by adding citation markers in the text, like [1] or [2, 3]. The citations should correspond to the order of the sources provided in the grounding metadata.)",
      "riskTip": "string (A 1-2 paragraph tip about the risks involved or key things to watch out for. Use \\n for new paragraphs. Also include citations like [1], [2, 3] where appropriate.)"
    }
  `;

  let responseText = '';
  try {
    const response: GenerateContentResponse = await generateContentWithRetry({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    if (!response.text) {
        console.error("AI signal response was empty or blocked. Full response:", JSON.stringify(response, null, 2));
        throw new Error("Failed to get a valid analysis from AI. The content may have been blocked or the model returned an empty response.");
    }
    
    responseText = response.text;
    const parsedData = extractJsonObject<Omit<Signal, 'assetName' | 'updateTime' | 'sources' | 'status'>>(responseText);

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: SignalSource[] = groundingChunks
        .map((chunk: any) => ({
            title: chunk.web?.title || 'Unknown Source',
            uri: chunk.web?.uri || '#',
        }))
        .filter((source: SignalSource) => source.uri !== '#');
    
    const direction = (parsedData.direction || '').toUpperCase();
    if (direction !== 'SELL' && direction !== 'BUY') {
        console.warn(`Invalid direction received from AI: '${parsedData.direction}'. Defaulting to BUY.`);
    }
    const finalDirection = direction === 'SELL' ? 'SELL' : 'BUY';

    return {
      assetName,
      updateTime: new Date().toISOString(),
      sources,
      direction: finalDirection,
      confidence: parsedData.confidence,
      entryPrice: parsedData.entryPrice,
      tp1: parsedData.tp1,
      tp2: parsedData.tp2,
      sl: parsedData.sl,
      strategyDescription: parsedData.strategyDescription,
      riskTip: parsedData.riskTip,
      pivotPoints: parsedData.pivotPoints,
      rsi: parsedData.rsi,
      sma: parsedData.sma,
    };
  } catch (error) {
    console.error("Error generating trading signal:", error);
    const errorMessage = (error instanceof Error) ? error.message : String(error);

    if (errorMessage.includes('403') || errorMessage.includes('PERMISSION_DENIED')) {
        throw new Error("Permission Denied. Please check your API key and project settings.");
    }
    if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
        throw new Error("The service is currently busy due to high demand. Please wait a moment and try again.");
    }
    if (responseText) {
        console.error("Problematic AI response text:", responseText);
    }
    if (error instanceof SyntaxError) {
        throw new Error("Failed to get valid analysis from AI. The model returned an unexpected format.");
    }
    throw new Error("Failed to get analysis from AI. The model may be overloaded or the content may have been blocked.");
  }
};

export const getNewsWithSentiment = async (category: string): Promise<NewsArticle[]> => {
    const topic = category === 'All' ? 'general financial markets' : category;

    const prompt = `
        You are a financial news analyst. Your task is to find 5 recent and relevant news articles about ${topic}.
        It is CRITICAL that you use real-time web data and that the information used is NO OLDER THAN 24 HOURS.
        For each article, you must provide:
        1. A title.
        2. A brief 1-2 sentence snippet.
        3. The source URL.
        4. The source name.
        5. A sentiment analysis for the relevant asset or market. The sentiment MUST be one of 'Bullish', 'Bearish', or 'Neutral'.
        6. A concise, one-sentence summary of the potential market impact.

        This request is for informational and educational purposes ONLY.

        Based on your search, provide a single, raw, valid JSON object.
        Your response MUST be ONLY the JSON object, with no surrounding text or markdown.

        **JSON Formatting Rules (CRITICAL):**
        - The root of the object must be a key named "articles" containing an array of article objects.
        - All keys and string values must be enclosed in double quotes.
        - Any double-quote characters (") inside a string value (like a title or snippet) MUST be escaped with a backslash (e.g., "title": "Market says \\"buy\\" now"). This is essential.
        - Do not use trailing commas.

        The JSON object must conform to the following structure:
        {
        "articles": [
            {
            "title": "string (The headline of the article)",
            "snippet": "string (A concise 1-2 sentence summary of the article)",
            "url": "string (The direct URL to the article)",
            "sourceName": "string (The name of the news source, e.g., 'Reuters')",
            "sentiment": "'Bullish', 'Bearish', or 'Neutral'",
            "impactSummary": "string (A single sentence summarizing the potential market impact)"
            }
        ]
        }
    `;

    let responseText = '';
    try {
        const response: GenerateContentResponse = await generateContentWithRetry({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        if (!response.text) {
            console.error("AI news response was empty or blocked. Full response:", JSON.stringify(response, null, 2));
            throw new Error("Failed to get news from AI. The content may have been blocked or the model returned an empty response.");
        }
        
        responseText = response.text;
        
        const parsedData = extractJsonObject<{ articles: NewsArticle[] }>(responseText);

        if (!parsedData.articles || !Array.isArray(parsedData.articles)) {
            console.error("Problematic AI response for news, missing articles array:", parsedData);
            throw new Error("AI response for news is missing 'articles' array.");
        }

        return parsedData.articles;
    } catch (error) {
        console.error("Error generating financial news:", error);
        const errorMessage = (error instanceof Error) ? error.message : String(error);

        if (errorMessage.includes('403') || errorMessage.includes('PERMISSION_DENIED')) {
            throw new Error("Permission Denied. Please check your API key and project settings.");
        }
        if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
            throw new Error("The service is currently busy due to high demand. Please wait a moment and try again.");
        }
        if (responseText) {
            console.error("Problematic AI response text for news:", responseText);
        }
        if (error instanceof SyntaxError) {
            throw new Error("Failed to get valid news from AI. The model returned an unexpected format.");
        }
        throw new Error("Failed to get news from AI. The model may be overloaded or the content may have been blocked.");
    }
};


export const getChatResponse = async (history: ChatMessage[], newText: string, signalContext: Signal): Promise<string> => {
    const contents = [
        ...history.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        })),
        { role: 'user', parts: [{ text: newText }] }
    ];

    const systemInstruction = `You are a helpful AI trading analyst. The user has just generated the following trading signal analysis for ${signalContext.assetName}:
    
    ## Analysis Summary
    - **Direction:** ${signalContext.direction}
    - **Strategy:** ${signalContext.strategyDescription}
    - **Risk Tip:** ${signalContext.riskTip}

    Your role is to answer the user's follow-up questions about this specific analysis. Be concise, helpful, and stay on topic. Do not provide financial advice. Use web search if necessary to answer questions about recent events related to the asset.
    `;
    
    try {
        const response: GenerateContentResponse = await generateContentWithRetry({
            model: "gemini-2.5-pro",
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                tools: [{ googleSearch: {} }],
            }
        });

        if (!response.text) {
            console.error("AI chat response was empty or blocked. Full response:", JSON.stringify(response, null, 2));
            throw new Error("The AI assistant did not provide a response. It may have been blocked or the model returned an empty response.");
        }
        return response.text.trim();
    } catch (error) {
        console.error("Error getting chat response:", error);
        const errorMessage = (error instanceof Error) ? error.message : String(error);
        if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
            throw new Error("The AI assistant is busy. Please wait a moment and try again.");
        }
        throw new Error("Failed to get a response from the AI assistant.");
    }
};