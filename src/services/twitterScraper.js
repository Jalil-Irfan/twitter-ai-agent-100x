const puppeteer = require('puppeteer-extra');

const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const fs = require('fs');

// Define a delay function
const delay = (time) => new Promise(resolve => setTimeout(resolve, time));

const scrapeTweets = async (query) => {
    // const browser = await puppeteer.launch({ headless: true });

    // To retain the user login in twitter
    const browser = await puppeteer.launch({
        headless: false,
        userDataDir: './user_data', // Persist login data to avoid login every time
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled'
        ]
    });

    const page = await browser.newPage();
    try {
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        // Load existing cookies if they exist to reuse a logged-in session
        const cookiesPath = './cookies.json';
        if (fs.existsSync(cookiesPath)) {
            const cookies = JSON.parse(fs.readFileSync(cookiesPath, 'utf-8'));
            await page.setCookie(...cookies);
        }

        // Navigate to Twitter
        await page.goto('https://twitter.com/login', { waitUntil: 'networkidle2' });

        // Only perform login if necessary
        if (page.url().includes('login')) {
            await page.type('input[name="session[username_or_email]"]', 'Jalil_Irfan', { delay: 100 });
            await page.type('input[name="session[password]"]', 'JarnIril-23', { delay: 100 });
            await page.click('div[data-testid="LoginForm_Login_Button"]');

            await page.waitForNavigation({ waitUntil: 'networkidle2' });

            // Save cookies after login
            const cookies = await page.cookies();
            fs.writeFileSync(cookiesPath, JSON.stringify(cookies, null, 2));
        }

        // Now go to the search page to scrape tweets
        await page.goto('https://twitter.com/search?q=' + encodeURIComponent(query) + '&src=typed_query', {
            waitUntil: 'networkidle2'
        });

        // Add a manual delay to make sure the page has enough time to load
        await delay(5000);  // Using the custom delay function

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
