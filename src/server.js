const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const scrapeTweets = require('./services/twitterScraper');

app.get('/scrape', async (req, res) => {
    const tweets = await scrapeTweets('hackathon');
    res.json(tweets);
});

app.get('/', (req, res) => {
    res.send('Twitter AI Agent is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
