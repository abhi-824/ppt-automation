import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

// The URL where mcphost is running
const MCPHOST_SSE_URL = "http://localhost:8000/sse";
const MCPHOST_CHAT_URL = "http://localhost:8000/chat";

// SSE proxy API exposed to React
app.post("/chat", async (req, res) => {
  const { prompt } = req.body;

  // Set SSE headers for UI
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // Start a chat session with mcphost
  const mcphostResponse = await fetch(MCPHOST_CHAT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  if (!mcphostResponse.ok) {
    res.write(`event: error\ndata: ${mcphostResponse.statusText}\n\n`);
    res.end();
    return;
  }

  // Open the SSE stream from mcphost
  const reader = mcphostResponse.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);

    // Forward raw SSE chunks to client UI
    res.write(chunk);
  }

  res.end();
});

app.listen(3001, () =>
  console.log("🚀 Orchestrator running at http://localhost:3001")
);
