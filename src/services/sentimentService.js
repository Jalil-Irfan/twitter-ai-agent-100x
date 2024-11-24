const Sentiment = require('sentiment');
const sentiment = new Sentiment();

const analyzeSentiment = (text) => {
    const result = sentiment.analyze(text);
    return {
        score: result.score,
        comparative: result.comparative,
        sentiment: result.score > 0 ? 'positive' : result.score < 0 ? 'negative' : 'neutral'
    };
};

module.exports = analyzeSentiment;
