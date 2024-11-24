const puppeteer = require('puppeteer');

const scrapeTweets = async (query) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        await page.goto('https://twitter.com/search?q=' + encodeURIComponent(query) + '&src=typed_query', {
            waitUntil: 'networkidle2'
        });

        // Wait for tweets to load (basic selector example)
        await page.waitForSelector('article');

        const tweets = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('article')).map(tweet => {
                const content = tweet.innerText;
                return { content };
            });
        });

        console.log(tweets);
    } catch (error) {
        console.error('Error scraping tweets:', error);
    } finally {
        await browser.close();
    }
};

const generateResponse = require('./gptService');

const scrapeTweetsWithAI = async (query) => {
    const tweets = await scrapeTweets(query);

    // Generate an AI response for each tweet
    for (let tweet of tweets) {
        tweet.insight = await generateResponse(`Provide insights about the following tweet: "${tweet.content}"`);
    }

    return tweets;
};


module.exports = scrapeTweets;
