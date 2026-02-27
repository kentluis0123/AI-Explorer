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
  
  // 1. Search using Tavily
  const searchResponse = await axios.post('https://api.tavily.com/search', {
    api_key: process.env.TAVILY_API_KEY,
    query: searchQuery,
    search_depth: "advanced",
    max_results: 6
  });

  const results = searchResponse.data.results;
  const context = results.map(r => `Source: ${r.title}\nContent: ${r.content}`).join('\n\n');

  // 2. Summarize using Groq (OpenAI-compatible API)
  const aiResponse = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
    model: "llama3-70b-8192",
    messages: [
      { 
        role: "system", 
        content: `You are an expert researcher. ${PROMPTS[category] || PROMPTS.Articles} Use Markdown for formatting.` 
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
    console.error('Error in /api/summarize:', error.message);
    res.status(500).json({ error: "Failed to fetch and summarize topic." });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
