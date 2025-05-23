  const GigaChat = require("gigachat-node").GigaChat;
  const dotenv = require("dotenv");

  dotenv.config();

  class Controller {
    constructor() {
      this.apiKey = null;
      this.client = null;
      this.MAKE_EASY_PROMPT = process.env.MAKE_EASY_PROMPT;
      this.FINISH_PROMPT = process.env.FINISH_PROMPT;
      this.FIX_PROMPT = process.env.FIX_PROMPT;
      this.MAIN_THEMES_PROMPT = process.env.MAIN_THEMES_PROMPT;
      this.EXPLANATIONS_PROMPT = process.env.EXPLANATIONS_PROMPT;
      this.TO_OPTIONS_OF_CONTENT_PROMPT = process.env.TO_OPTIONS_OF_CONTENT_PROMPT;
      this.CHANGE_STYLE_PROMPT = process.env.CHANGE_STYLE_PROMPT;
    }

    createGigaChat(apiKey) {
      return new GigaChat({
        clientSecretKey: apiKey,
        isIgnoreTSL: true,
        isPersonal: true,
        autoRefreshToken: true,
      });
    }

    getOrCreateClient() {
      if (!this.client) {
        if (this.apiKey) {
          this.client = this.createGigaChat(this.apiKey);
        }
      }
      return this.client;
    }

    saveApiKey(key) {
      this.apiKey = key;
    }

    async getToken(req, res) {
      try {
        const { apiKey } = req.body;
        this.saveApiKey(apiKey);
        const client = this.getOrCreateClient();

        console.log("Attempting to create token with API key:", apiKey);

        await client.createToken();
        res.status(200).json({ access_token: client.authorization });
      } catch (error) {
        console.error("Error obtaining access token:", error);
        this.apiKey = null;
        this.client = null;
        res.status(400).json({ message: "Error obtaining access token" });
      }
    }

    async getText(req, res) {
    try {
      const { prompt } = req.body;

      const client = this.getOrCreateClient();
      const response = await client.completion({
        model: "GigaChat-2",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 128000,
        temperature: 0.7,
        stream: false,
        profanity_check: true,
      });
      res.status(200).json({ prompt: response.choices[0].message.content });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "Error processing request" });
    }
  }

  async processText(req, res, prompt, content, maxTokens, temperature) {
    try {
      const client = this.getOrCreateClient();
      console.log(client);
      console.log(prompt);
      console.log(content);
      console.log(maxTokens);
      console.log(temperature);
      const response = await client.completion({
        model: "GigaChat-2",
        messages: [
          {
            role: "system",
            content: content,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 128000,
        temperature: 0.7,
        stream: false,
        profanity_check: true,
      });
      res.status(200).json({ prompt: response.choices[0].message.content });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "Error processing request" });
    }
  }

    async makeTextEasy(req, res) {
      const { prompt } = req.body;
      await this.processText(req, res, prompt, this.MAKE_EASY_PROMPT, 128000, 0.87);
    }

    async finishText(req, res) {
      const { prompt } = req.body;
      await this.processText(req, res, prompt, this.FINISH_PROMPT, 128000, 0.87);
    }

    async fixText(req, res) {
      const { prompt } = req.body;
      await this.processText(req, res, prompt, this.FIX_PROMPT, 128000, 0.87);
    }

    async mainThemesText(req, res) {
      const { prompt } = req.body;
      await this.processText(req, res, prompt, this.MAIN_THEMES_PROMPT, 128000, 0.87);
    }

    async explanationsText(req, res) {
      const { prompt } = req.body;
      await this.processText(req, res, prompt, this.EXPLANATIONS_PROMPT, 128000, 0.87);
    }

    async toOptionsOfContentText(req, res) {
      const { prompt } = req.body;
      await this.processText(req, res, prompt, this.TO_OPTIONS_OF_CONTENT_PROMPT, 128000, 0.87);
    }

    async changeStyleText(req, res) {
      const { prompt, style } = req.body;
      try {
        const client = this.getOrCreateClient();
        const system_prompt = this.CHANGE_STYLE_PROMPT.replace(/{style}/g, style);
        const response = await client.completion({
          model: "GigaChat-2",
          messages: [
            {
              role: "system",
              content: system_prompt,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 128000,
          temperature: 0.87,
          stream: false,
          profanity_check: true,
        });
        console.log(prompt);
        console.log(system_prompt);
        res.status(200).json({ prompt: response.choices[0].message.content });
      } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Error processing request" });
      }
    }
  }

  module.exports = new Controller();
