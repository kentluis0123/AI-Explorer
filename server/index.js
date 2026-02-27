const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const PROMPTS = {
  Articles: "Provide a comprehensive general overview. Use bullet points for key facts and define any complex terms.",
  Studies: "Focus on empirical data, research findings, and methodologies. Summarize the scientific consensus or major discoveries.",
  News: "Summarize the most recent developments from the last few weeks. Highlight dates, key figures, and ongoing events.",
  'Fact-Check': "Identify common claims or potential misinformation about this topic. Cross-reference the search results to confirm or debunk these claims."
};

async function getSummary(topic, category) {
  const searchQuery = `${category} about ${topic}`;
  
  // 1. Search using Tavily (Reduced to 3 results to avoid 429)
  const searchResponse = await axios.post('https://api.tavily.com/search', {
    api_key: process.env.TAVILY_API_KEY,
    query: searchQuery,
    search_depth: "basic", // Changed from "advanced" to be faster and cheaper
    max_results: 3
  });

  const results = searchResponse.data.results;
  // Truncate content to 1000 characters per result to stay under Groq token limits
  const context = results.map(r => `Source: ${r.title}\nContent: ${r.content.substring(0, 1000)}`).join('\n\n');

  // 2. Summarize using Groq (Using a smaller, faster model for better rate limits)
  const aiResponse = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
    model: "llama-3.1-8b-instant", // Updated to the correct model name for Groq
    messages: [
      { 
        role: "system", 
        content: `You are an expert researcher. ${PROMPTS[category] || PROMPTS.Articles} Summarize concisely using Markdown.` 
      },
      { 
        role: "user", 
        content: `Topic: ${topic}\n\nSearch Results:\n${context}` 
      }
    ]
  }, {
    headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` }
  });

  return {
    summary: aiResponse.data.choices[0].message.content,
    sources: results.map(r => ({ title: r.title, url: r.url }))
  };
}

app.post('/api/summarize', async (req, res) => {
  const { topic, category } = req.body;
  try {
    const data = await getSummary(topic, category);
    res.json(data);
  } catch (error) {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else {
      console.error('Error in /api/summarize:', error.message);
    }
    res.status(500).json({ error: "Failed to fetch and summarize topic." });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
