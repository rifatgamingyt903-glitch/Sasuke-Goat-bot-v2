const { google } = require("googleapis");
const dotenv = require("dotenv");
const fetch = require("node-fetch");
const stream = require("stream");
const { Buffer } = require('buffer');
const fs = require('fs');

dotenv.config({ override: true });

const API_KEY = "AIzaSyCjHC9xWZQ_SrNjRCuCRAbhdUQfaFwqGec"; // Get key from aistudio site
const model = "gemini-1.5-flash-latest";
const GENAI_DISCOVERY_URL = `https://generativelanguage.googleapis.com/$discovery/rest?version=v1beta&key=${API_KEY}`;

var uid;
var prompt;
var fileUrls = [];
var totalTimeInSeconds;
var wordCount;

async function imageUrlToBase64(url) {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString('base64');
}

async function uploadImageAndGetFileData(genaiService, auth, imageUrl) {
    if (!imageUrl.startsWith("http")) {
        imageUrl = "";
    }

    const imageBase64 = await imageUrlToBase64(imageUrl);
    const bufferStream = new stream.PassThrough();
    bufferStream.end(Buffer.from(imageBase64, "base64"));
    const media = {
        mimeType: "image/png",
        body: bufferStream,
    };
    const body = { file: { displayName: "Uploaded Image" } };
    const createFileResponse = await genaiService.media.upload({
        media,
        auth,
        requestBody: body,
    });
    const file = createFileResponse.data.file;
    return { file_uri: file.uri, mime_type: file.mimeType };
}
function saveUrls(uid, urls) {
    const urlsFile = `uids/${uid}_urls_gemini_1.5_flash.json`;

    try {
        if (urls && urls.length > 0) {
            const absoluteUrls = urls.filter(url => url.startsWith("http"));
            if (fs.existsSync(urlsFile)) {
                fs.unlinkSync(urlsFile);
            }
            fs.writeFileSync(urlsFile, JSON.stringify(absoluteUrls, null, 2));
        }
        else {
            const existingUrls = loadUrls(uid);
            fs.writeFileSync(urlsFile, JSON.stringify(existingUrls, null, 2));
        }
    } catch (error) {
        console.error(`Error saving URLs for UID ${uid}:`, error);
    }
}


function loadUrls(uid) {
    const urlsFile = `uids/${uid}_urls_gemini_1.5_flash.json`;

    try {
        if (fs.existsSync(urlsFile)) {
            const fileData = fs.readFileSync(urlsFile, 'utf8');
            return JSON.parse(fileData);
        } else {
            return [];
        }
    } catch (error) {
        console.error(`Error loading URLs for UID ${uid}:`, error);
        return [];
    }
}

function loadChatHistory(uid) {
    const chatHistoryFile = `uids/${uid}_gemini_1.5_flash.json`;

    try {
        if (fs.existsSync(chatHistoryFile)) {
            const fileData = fs.readFileSync(chatHistoryFile, 'utf8');
            return JSON.parse(fileData);
        } else {
            return [];
        }
    } catch (error) {
        console.error(`Error loading chat history for UID ${uid}:`, error);
        return [];
    }
}

function appendToChatHistory(uid, chatHistory) {
    const chatHistoryFile = `uids/${uid}_gemini_1.5_flash.json`;

    try {
        if (!fs.existsSync('uids')) {
            fs.mkdirSync('uids');
        }

        fs.writeFileSync(chatHistoryFile, JSON.stringify(chatHistory, null, 2));
    } catch (error) {
        console.error(`Error saving chat history for UID ${uid}:`, error);
    }
}

async function getTextGemini(uid, prompt = "", fileUrls, reply) {
    const genaiService = await google.discoverAPI({ url: GENAI_DISCOVERY_URL });
    const auth = new google.auth.GoogleAuth().fromAPIKey(API_KEY);
    const startTime = Date.now();
    let savedUrls = [];
    let chatHistory = loadChatHistory(uid);

    const updatedPrompt = chatHistory
        .flatMap(message => message.parts.map(part => part.text))
        .join('\n')
        .trim() + '\n' + prompt;

    if (reply) {
        if (fileUrls && fileUrls.length > 0) {
            saveUrls(uid, [], false);
            saveUrls(uid, fileUrls, true);
            savedUrls = fileUrls;
        } else {
            savedUrls = loadUrls(uid);
            saveUrls(uid, savedUrls, false);
        }
    } else {
        if (fileUrls && fileUrls.length > 0) {
            saveUrls(uid, fileUrls, true);
            savedUrls = loadUrls(uid);
            savedUrls = [];
            savedUrls = fileUrls;
        } else {
            savedUrls = [];
            saveUrls(uid, [], false);
        }
    }

    const fileDataParts = [];

    if (savedUrls.length > 0) {
        for (const fileUrl of savedUrls) {
            const fileData = await uploadImageAndGetFileData(genaiService, auth, fileUrl);
            fileDataParts.push(fileData);
        }
    }

    const contents = {
        contents: [
            {
                role: "user",
                parts: [{ text: updatedPrompt }, ...fileDataParts.map(data => ({ file_data: data }))],
            },
        ],
        safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT",
