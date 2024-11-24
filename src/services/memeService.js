const generateMemeCaption = (tweetText) => {
    const prompts = [
        `Write a funny meme caption for: "${tweetText}"`,
        `Imagine this tweet as a meme and write a hilarious caption: "${tweetText}"`,
        `Create a witty caption for the following tweet: "${tweetText}"`
    ];
    
    // Randomly choose a prompt
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    return randomPrompt;
};

module.exports = generateMemeCaption;
