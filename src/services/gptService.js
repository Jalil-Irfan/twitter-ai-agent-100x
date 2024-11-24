const axios = require('axios');
const puppeteer = require('puppeteer');

const generateResponse = async (prompt) => {
    try {
        const response = await axios.post(
            'https://api-inference.huggingface.co/models/EleutherAI/gpt-j-6B',
            {
                inputs: prompt,
            },
            {
                headers: {
                    'Authorization': `Bearer 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`,
                    'Content-Type': 'application/json',
                }
            }
        );

        return response.data[0]?.generated_text.trim() || 'Unable to generate a response at the moment.';
    } catch (error) {
        console.error('Error generating response:', error);
        return 'Sorry, I could not generate a response at the moment.';
    }
};

const scrapeTweets = async (query) => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    try {
        await page.goto('https://twitter.com/search?q=' + encodeURIComponent(query) + '&src=typed_query', {
            waitUntil: 'networkidle2' // 'domcontentloaded' in general or 'networkidle2' if content takes longer to load
        });

        // Wait for tweets to load (basic selector example) 
        await page.waitForSelector('article', { timeout: 60000 });

        const tweets = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('article')).map(tweet => {
                const content = tweet.innerText;
                return { content };
            });
        });

        console.log(tweets);
        return tweets;
        
    } catch (error) {
        console.error('Error scraping tweets:', error);
    } finally {
        await browser.close();
    }
};

const scrapeTweetsWithAI = async (query) => {
    const tweets = await scrapeTweets(query);

    // Generate an AI response for each tweet
    for (let tweet of tweets) {
        tweet.insight = await generateResponse(`Provide insights about the following tweet: "${tweet.content}"`);
    }

    return tweets;
};

module.exports = scrapeTweetsWithAI;
