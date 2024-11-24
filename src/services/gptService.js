const axios = require('axios');
const puppeteer = require('puppeteer');

const fallbackInsights = [
    "This tweet is related to current events in the automotive industry.",
    "This tweet discusses a trending topic involving technology and digital integration.",
    "This tweet is about a discussion on industry trends and future expectations."
];


const generateResponse = async (prompt, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios.post(
                'https://api-inference.huggingface.co/models/EleutherAI/gpt-j-6B',
                {
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 50  // Adjust this value to control response length for faster response
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer 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`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            // Check if response contains valid data
            if (response.data && response.data.length > 0) {
                return response.data[0]?.generated_text.trim() || 'Unable to generate a response at the moment.';
            } else {
                console.error('No valid response data received:', response.data);
                return 'Unable to generate a response at the moment.';
            }
        } catch (error) {
            console.error(`Attempt ${i + 1} failed with error:`, error.message);
        }
    }
    // Return a fallback insight if no response was generated
    return fallbackInsights[Math.floor(Math.random() * fallbackInsights.length)];
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
