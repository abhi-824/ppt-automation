import { deleteAllSlides, insertSlidesFromBase64 } from './powerpoint.js';

const ORCHESTRATOR_URL = 'https://localhost:8080';
const PPT_API_URL = 'http://localhost:8000';

/**
 * Replaces the current presentation with the preview from the orchestrator
 */
export const replacePresentationInPowerPoint = async () => {
  try {
    console.log("here")
    const response = await fetch(`${ORCHESTRATOR_URL}/ppt/preview`, {
      mode: 'cors',
      credentials: 'omit',
    });
    const data = await response.json();

    if (data.status === "ok" && data.base64) {
      // Step 1: Delete all slides
      await deleteAllSlides();

      // Step 2: Insert new slides from base64
      await insertSlidesFromBase64(data.base64);

      console.log("PPT replaced successfully using Office-JS API");
    }
  } catch (e) {
    console.error("Error replacing PPT:", e);
  }
};

/**
 * Sends a chat message to the orchestrator and returns a streaming response
 * @param {string} prompt - The user's prompt
 * @param {string} slideBase64 - Base64-encoded current slide
 * @param {Function} onEvent - Callback function to handle SSE events
 * @returns {Promise<void>}
 */
export const sendChatMessage = async (prompt, slideBase64, onEvent, x) => {
  console.log('x', x);
  const response = await fetch(`${ORCHESTRATOR_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, slide_base64: slideBase64, x }),
    mode: 'cors',
    credentials: 'omit'
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    console.log(buffer)

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        try {
          const event = JSON.parse(data);
          onEvent(event);
        } catch (e) {
          console.error('Failed to parse SSE data:', e);
        }
      }
    }
  }
};

export { ORCHESTRATOR_URL, PPT_API_URL };

