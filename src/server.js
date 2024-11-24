const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const scrapeTweetsWithAI = require('./services/twitterScraper');

const generateResponse = require('./services/gptService');

const analyzeSentiment = require('./services/sentimentService');

const generateMemeCaption = require('./services/memeService');

app.get('/scrape', async (req, res) => {
    const tweets = await scrapeTweetsWithAI('hackathon');
    res.json(tweets);
});

app.get('/', (req, res) => {
    res.send('Twitter AI Agent is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.get('/respond', async (req, res) => {
    const userPrompt = req.query.prompt || "Tell me a joke!";
    const response = await generateResponse(userPrompt);
    res.json({ prompt: userPrompt, response: response });
});

app.get('/scrape-with-ai', async (req, res) => {
    const query = req.query.q || 'hackathon';
    const tweets = await scrapeTweetsWithAI(query);
    // Add AI insights and sentiment analysis for each tweet
    const tweetsWithAI = await Promise.all(tweets.map(async (tweet) => {
        const insight = await generateResponse(`Provide insights about the following tweet: "${tweet.content}"`);
        const sentiment = analyzeSentiment(tweet.content);

        return {
            content: tweet.content,
            insight: insight,
            sentiment: sentiment
        };
    }));
});

app.get('/analyze-sentiment', async (req, res) => {
    const query = req.query.q || 'hackathon';
    const tweets = await scrapeTweetsWithAI(query);

    // Analyze sentiment of each tweet
    const tweetsWithSentiment = tweets.map(tweet => ({
        content: tweet.content,
        sentiment: analyzeSentiment(tweet.content)
    }));

    res.json(tweetsWithSentiment);
});

app.get('/generate-meme', async (req, res) => {
    const query = req.query.q || 'hackathon';
    const tweets = await scrapeTweetsWithAI(query);

    // Generate meme captions for each tweet
    const memeCaptions = tweets.map(tweet => ({
        content: tweet.content,
        memeCaption: generateMemeCaption(tweet.content)
    }));

    res.json(memeCaptions);
});