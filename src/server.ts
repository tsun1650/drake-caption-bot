// backend/server.js
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { OpenAI } = require("openai");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

const openai = new OpenAI();

app.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const assistant = await openai.beta.assistants.retrieve(
      "asst_r1PHBj9acRCBrlkANe1Qo8RG"
    );

    // Save the uploaded file temporarily
    const tempFilePath = path.join(__dirname, "temp_" + req.file.originalname);
    fs.writeFileSync(tempFilePath, req.file.buffer);

    // Upload the image file to OpenAI using createReadStream
    const user_image = await openai.files.create({
      file: fs.createReadStream(tempFilePath),
      purpose: "assistants",
    });

    // Delete the temporary file
    fs.unlinkSync(tempFilePath);

    // Create a thread with the uploaded image
    const thread = await openai.beta.threads.create({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_file",
              image_file: {
                file_id: user_image.id,
              },
            },
          ],
        },
      ],
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
    });

    // Wait for the run to complete
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    while (runStatus.status !== "completed") {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    // Retrieve the messages
    const messages = await openai.beta.threads.messages.list(thread.id);

    if (!messages || !messages.data || !Array.isArray(messages.data)) {
      throw new Error("Invalid messages structure received from OpenAI");
    }

    // Extract the last assistant message (the response)
    const assistantMessage = messages.data
      .filter((message) => message.role === "assistant")
      .pop();

    console.log(
      "Assistant message:",
      JSON.stringify(assistantMessage, null, 2)
    );

    if (!assistantMessage || !assistantMessage.content) {
      throw new Error("No valid assistant response found");
    }

    const responseContent = assistantMessage.content.find(
      (c) => c.type === "text"
    );

    if (!responseContent || !responseContent.text) {
      throw new Error("No text content found in assistant response");
    }

    res.json({ success: true, response: responseContent.text.value });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "An error occurred while processing the image",
      details: error.message,
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
