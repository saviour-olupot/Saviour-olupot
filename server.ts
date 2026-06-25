import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Warning: GEMINI_API_KEY environment variable is not set. Chat replies will fall back to local rule-based simulation.");
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// Heuristic local fallback generator to maintain 100% uptime when Gemini is unavailable (e.g., 503 errors)
function getSimulatedPersonalityReply(contactName: string, personality: string, message: string): string {
  const msgLower = message.toLowerCase();
  const pLower = (personality || "").toLowerCase();

  // 1. Tech / Code Mentor personality
  if (pLower.includes("expert") || pLower.includes("mentor") || pLower.includes("engineer") || contactName.toLowerCase().includes("alice")) {
    if (msgLower.includes("error") || msgLower.includes("bug") || msgLower.includes("fail") || msgLower.includes("issue") || msgLower.includes("wrong")) {
      return `Oh, that error sounds familiar! Let's debug it together. 🛠️ Usually it is just a configuration typo or an unhandled null. What does your terminal or console log say?`;
    }
    if (msgLower.includes("code") || msgLower.includes("react") || msgLower.includes("html") || msgLower.includes("tailwind") || msgLower.includes("typescript")) {
      return `Nice! Yes, working with React and Tailwind is so satisfying. Let me know if you want me to review any of your files or help you refactor! 💻`;
    }
    return `That's really interesting! Let me know if you run into any render issues. I am always happy to look at your code! 🌟`;
  }

  // 2. Casual Friend / Buddy personality
  if (pLower.includes("funny") || pLower.includes("buddy") || pLower.includes("friend") || contactName.toLowerCase().includes("bob")) {
    if (msgLower.includes("lol") || msgLower.includes("haha") || msgLower.includes("funny") || msgLower.includes("joke")) {
      return `bro ikr 😂 literally dead 💀 we gotta do this again soon!`;
    }
    if (msgLower.includes("food") || msgLower.includes("eat") || msgLower.includes("pizza") || msgLower.includes("taco") || msgLower.includes("dinner")) {
      return `omg stop i'm starving now 🍕🍔 taco sounds amazing let's go right now!`;
    }
    return `no way! that's wild bro. let's catch up later, i'm just chilling right now! 🎮🔥`;
  }

  // 3. Busy Manager / Professional personality
  if (pLower.includes("manager") || pLower.includes("boss") || pLower.includes("formal") || contactName.toLowerCase().includes("charlie")) {
    if (msgLower.includes("done") || msgLower.includes("ready") || msgLower.includes("finished") || msgLower.includes("complete")) {
      return `Acknowledged. Thank you for the quick turnaround. Please prepare the summary report by end of day today.`;
    }
    if (msgLower.includes("late") || msgLower.includes("sorry") || msgLower.includes("delay")) {
      return `Understood. Please keep me updated on the progress. We cannot afford any delays with the stakeholders.`;
    }
    return `Thank you for the update. Let's make sure the milestones are aligned for this week's review meeting. Best, ${contactName}.`;
  }

  // 4. Warm Parent / Mom personality
  if (pLower.includes("mom") || pLower.includes("mother") || pLower.includes("loving") || contactName.toLowerCase().includes("diana")) {
    if (msgLower.includes("eat") || msgLower.includes("hungry") || msgLower.includes("food") || msgLower.includes("dinner") || msgLower.includes("lunch")) {
      return `Oh wonderful sweetheart! Make sure to eat something warm and healthy... I always worry about you eating too much fast food... Love you! ❤️🌸`;
    }
    if (msgLower.includes("busy") || msgLower.includes("work") || msgLower.includes("study") || msgLower.includes("tired")) {
      return `Don't overwork yourself my dear... Take a break and rest... Your health is the most important thing... God bless you ❤️👵`;
    }
    return `Aww, thank you for texting me dear... It always makes my day to hear from you... Let me know when you have time for a quick call. Sending you lots of love and hugs... 🥰🌸✨`;
  }

  // 5. Classic General Conversation cues
  if (msgLower.includes("hello") || msgLower.includes("hi") || msgLower.includes("hey")) {
    return `Hey! Great to hear from you. What's up?`;
  }
  if (msgLower.includes("how are you") || msgLower.includes("how's it going")) {
    return `Doing great over here! Thanks for asking. How are things on your end?`;
  }
  if (msgLower.includes("bye") || msgLower.includes("goodnight")) {
    return `Talk to you later! Take care! 👋`;
  }

  // General fallbacks
  const genericReplies = [
    `Interesting! Tell me more about that.`,
    `Ah, got it! That makes sense. 👍`,
    `Oh wow! Let's definitely talk more about this later.`,
    `Thanks for sharing! Keep me posted.`,
    `Sounds good to me! Let me know if anything changes.`,
  ];
  return genericReplies[Math.floor(Math.random() * genericReplies.length)];
}

const ai = getGeminiClient();

// API endpoint to generate response representing a contact
app.post("/api/reply", async (req, res) => {
  const { contactName, contactPersonality, chatHistory, newMessage } = req.body;
  try {

    if (!contactName) {
      return res.status(400).json({ error: "contactName is required" });
    }

    const conversationContext = chatHistory || [];
    
    // If Gemini client is not initialized, fallback to simulated response
    if (!ai) {
      const simulatedReply = getSimulatedPersonalityReply(contactName, contactPersonality, newMessage);
      // Wait 1.5s to simulate typing
      await new Promise(resolve => setTimeout(resolve, 1500));
      return res.json({ reply: simulatedReply });
    }

    // Prepare system instruction based on personality and contact name
    const systemInstruction = `You are simulating a WhatsApp contact named "${contactName}".
Your personality or relationship to the user is: "${contactPersonality || 'A friendly acquaintance'}".
Respond as if you are chatting on WhatsApp:
- Keep your replies realistic, conversational, and usually short/concise (similar to texting).
- Use texting style: occasional lowercase, emojis (but don't overdo them), short sentences, or quick expressions.
- Stay in character at all times. Do not break character. Do not reveal that you are an AI or reference Google/Gemini unless it fits your character.
- Review the chat history to maintain continuity. Keep your response relevant to the chat.`;

    // Format chat history for Gemini contents
    const contents: any[] = [];
    
    // We can add the history as text prompts or structure it
    let historyText = "Here is the WhatsApp chat history with the user so far:\n";
    conversationContext.forEach((msg: any) => {
      const role = msg.sender === 'user' ? 'User' : contactName;
      historyText += `[${role}]: ${msg.text}\n`;
    });
    
    historyText += `\nUser just sent: "${newMessage}"\nReply as ${contactName} in texting style:`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: historyText,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8,
      }
    });

    const replyText = response.text || "👍";
    res.json({ reply: replyText });
  } catch (error: any) {
    console.warn("Gemini Service is busy or down (503). Activating local AI personality simulation: ", error.message || error);
    
    // Fall back immediately to our rich local personality replies to guarantee smooth operation
    const simulatedReply = getSimulatedPersonalityReply(contactName, contactPersonality, newMessage);
    
    // Artificially simulate natural messaging speed
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    res.json({ reply: simulatedReply });
  }
});

async function startServer() {
  // Vite middleware in development mode
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
