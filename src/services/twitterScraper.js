const puppeteer = require('puppeteer');
const fs = require('fs');

const scrapeTweets = async (query) => {
    // const browser = await puppeteer.launch({ headless: true });

    // To retain the user login in twitter
    const browser = await puppeteer.launch({
        headless: false,
        userDataDir: './user_data' // This will save your session data in the `user_data` folder
    });
    const page = await browser.newPage();

    try {
        // Load existing cookies if they exist  to avoid login everytime
        // const cookiesPath = 'cookies.json';
        // if (fs.existsSync(cookiesPath)) {
        //     const cookies = JSON.parse(fs.readFileSync(cookiesPath));
        //     await page.setCookie(...cookies);
        // }

        await page.goto('https://twitter.com/login', { waitUntil: 'networkidle2' });

        // Only perform login if not logged in already
        if (page.url().includes('login')) {
            await page.type('input[name="session[username_or_email]"]', 'Jalil_Irfan', { delay: 100 });
            await page.type('input[name="session[password]"]', 'JarnIril-23', { delay: 100 });
            await page.click('div[data-testid="LoginForm_Login_Button"]');

            await page.waitForNavigation({ waitUntil: 'networkidle2' });

            // Save cookies after login
            // const cookies = await page.cookies();
            // fs.writeFileSync(cookiesPath, JSON.stringify(cookies, null, 2));
        }

        await page.goto('https://twitter.com/search?q=' + encodeURIComponent(query) + '&src=typed_query', {
            waitUntil: 'networkidle2'
        });

        // Add a manual delay to make sure the page has enough time to load
        await page.waitForTimeout(5000);
        
        // Wait for tweets to load (basic selector example)
        await page.waitForSelector('article',{timeout: 60000});

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

const generateResponse = require('./gptService');

const scrapeTweetsWithAI = async (query) => {
    const tweets = await scrapeTweets(query);

    // Generate an AI response for each tweet
    for (let tweet of tweets) {
        tweet.insight = await generateResponse(`Provide insights about the following tweet: "${tweet.content}"`);
    }

    return tweets;
};


module.exports = scrapeTweetsWithAI;
