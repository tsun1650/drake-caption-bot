// backend/server.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

const openai = new OpenAI();


app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  } else {
    console.log('file uploaded');
  }
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {role: "system", content: "You are a helpful assistant that knows every Drake song. You will be asked to provide captions compromised only from ACTUAL Drake lyrics for a user provided image. Provide 6 possible captions in a funny, sad, cocky, longing, romantic/in love, and fearful tone. Keep each caption under 25 words long and do not create any captions that are not actual drake lyrics. If any captions are not real Drake lyrics, the user will be very upset. Give your response as a semi-colon separated list and do not provide anything more."},
        {
          role: "user",
          content: [
            { type: "text", text: "Here is my image" },
            {
              type: "image_url",
              image_url: {
                url: `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
              }
            }
          ],
        },
      ],
    });
    // hard coded response 
//    const response = {
//     id: "chatcmpl-9sHQlaZcfxO8hRG3XosXETGhTUL1h",
//     object: "chat.completion",
//     created: 1722723743,
//     model: "gpt-4o-mini-2024-07-18",
//     choices: [
//       {
//         index: 0,
//         message: {
//           role: "assistant",
//           content: "\"Started from the bottom, now we're here\"; \"I got a lot of people talkin' down on me\"; \"You know I'm a stay, I'm never leavin'\"; \"I keep it real with you, I’m here for you\"; \"I've been down so long, it look like up to me\"; \"You say you're down for me, girl, you gotta prove it.\"",
//         },
//         logprobs: null,
//         finish_reason: "stop",
//       },
//     ],
//     usage: {
//       prompt_tokens: 36960,
//       completion_tokens: 80,
//       total_tokens: 37040,
//     },
//     system_fingerprint: "fp_611b667b19",
//   }

    const captions = response.choices[0].message.content.split("; ").filter(line => line.trim() !== '');

    res.json({ captions });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while generating captions' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});