const express = require('express')

const translateRouter = express.Router();

const {
    getAllLanguages,
    translate,
    textToSpeech,
    speechToText,
    imageToText
} = require('./../controllers/translateController')


translateRouter.get('/get-all-lang', getAllLanguages);
translateRouter.post('/translate', translate);
translateRouter.post('/text-to-speech', textToSpeech);
translateRouter.post('/speech-to-text', speechToText);
translateRouter.post('/image-to-text', imageToText);
module.exports = translateRouter;

