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
  if (!process.env.TAVILY_API_KEY || !process.env.GROQ_API_KEY) {
    throw new Error('API keys are missing in environment variables');
  }

  const searchQuery = `${category} about ${topic}`;
  console.log(`Searching Tavily for: ${searchQuery}`);
  
  // 1. Search using Tavily
  let searchResponse;
  try {
    searchResponse = await axios.post('https://api.tavily.com/search', {
      api_key: process.env.TAVILY_API_KEY,
      query: searchQuery,
      search_depth: "basic",
      max_results: 3
    });
  } catch (err) {
    console.error('Tavily Search Error:', err.response?.status, err.response?.data || err.message);
    throw new Error(`Tavily search failed: ${err.message}`);
  }

  const results = searchResponse.data.results;
  if (!results || results.length === 0) {
    throw new Error('No search results found for this topic.');
  }

  const context = results.map(r => `Source: ${r.title}\nContent: ${r.content.substring(0, 1000)}`).join('\n\n');

  // 2. Summarize using Groq
  console.log('Summarizing with Groq...');
  try {
    const aiResponse = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: "llama-3.1-8b-instant",
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
      headers: { 
        'Authorization': `Bearer ${process.env.GROQ_API_KEY.trim()}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      summary: aiResponse.data.choices[0].message.content,
      sources: results.map(r => ({ title: r.title, url: r.url }))
    };
  } catch (err) {
    console.error('Groq AI Error:', err.response?.status, err.response?.data || err.message);
    throw new Error(`AI summarization failed: ${err.message}`);
  }
}

app.post('/api/summarize', async (req, res) => {
  const { topic, category } = req.body;
  console.log(`Received request for topic: "${topic}", category: "${category}"`);
  
  if (!topic || !category) {
    return res.status(400).json({ error: "Topic and category are required." });
  }

  try {
    const data = await getSummary(topic, category);
    res.json(data);
  } catch (error) {
    // Log the full error to Render for debugging
    console.error('Final Error in /api/summarize:', error.message);
    if (error.stack) console.error(error.stack);
    
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
