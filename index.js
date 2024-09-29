const axios = require('axios');
const fs = require('fs');
const path = require('path');
const https = require('https');
const dotenv = require('dotenv');

if (fs.existsSync('.env.local')) {
    dotenv.config({ path: '.env.local' });
} else {
    dotenv.config();
}

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function fetchImageUrl(imageNumber) {
    try {
        const imageUrl = `https://img${imageNumber}.jpg`;
        console.log(`即将下载图片: ${imageUrl}`);
        return imageUrl;
    } catch (error) {
        console.error('构建图片URL时出错:', error.message);
        return null;
    }
}

async function startContinuousScraping() {
    for (let i = 2461; i <= 99999; i++) {
        const imageUrl = await fetchImageUrl(i);
        if (imageUrl) {
            const filename = path.basename(imageUrl);
            await downloadImage(imageUrl, filename);
        }
        await delay(2000); // 设置下载间隔为1秒
    }
}

startContinuousScraping();

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function downloadImage(imageUrl, filename) {
    try {
        const response = await axios({
            url: imageUrl,
            method: 'GET',
            responseType: 'stream',
            httpsAgent
        });

        const tempFilePath = path.join(__dirname, filename);
        const writer = fs.createWriteStream(tempFilePath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        console.log(`图片 ${filename} 已成功下载！`);
    } catch (error) {
        console.error(`下载图片 ${filename} 时出错:`, error.message);
    }
}
