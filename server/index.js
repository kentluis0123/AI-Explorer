const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const PROMPTS = {
  Articles: "Provide a comprehensive general overview of this topic. Use bullet points for key facts, history, and current significance. Focus on providing a broad understanding for a general audience.",
  Studies: "Provide a research-focused summary. Focus on empirical data, scientific studies, academic findings, and methodologies. Highlight specific researchers, institutions, or major breakthroughs in this field.",
  News: "Summarize the most recent developments, events, and trending news regarding this topic from the last few weeks. Highlight dates, key figures involved in current events, and ongoing controversies or updates.",
  'Fact-Check': "Critically analyze this topic to identify common myths, claims, or potential misinformation. Use the provided search results to confirm or debunk specific statements. Provide a 'Verdict' for each major claim identified."
};

async function getSummary(topic, category) {
  if (!process.env.TAVILY_API_KEY || !process.env.GROQ_API_KEY) {
    throw new Error('API keys are missing in environment variables');
  }

  // Optimize search query based on category for better differentiation
  let searchQuery = `${topic}`;
  if (category === 'Studies') searchQuery = `scientific research studies and academic papers on ${topic}`;
  else if (category === 'News') searchQuery = `latest news and recent developments on ${topic} 2024 2025`;
  else if (category === 'Fact-Check') searchQuery = `claims myths and fact check about ${topic}`;
  else searchQuery = `comprehensive overview and general facts about ${topic}`;

  console.log(`Searching Tavily (${category}) for: ${searchQuery}`);
  
  // 1. Search using Tavily
   let searchResponse;
   try {
     searchResponse = await axios.post('https://api.tavily.com/search', {
       api_key: process.env.TAVILY_API_KEY,
       query: searchQuery,
       search_depth: category === 'Studies' || category === 'Fact-Check' ? "advanced" : "basic",
       max_results: 4, // Slightly increased for better context
       include_images: true
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
      sources: results.map(r => ({ title: r.title, url: r.url })),
      images: searchResponse.data.images || [],
      version: "1.3-auto-tab-search"
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
