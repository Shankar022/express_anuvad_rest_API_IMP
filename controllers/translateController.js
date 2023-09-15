const {credentials} = require("../constants");
const fs = require('fs');
const textToSpeech = require('@google-cloud/text-to-speech');
const {Translate} = require("@google-cloud/translate").v2;
const speech = require('@google-cloud/speech');
const {ImageAnnotatorClient} = require('@google-cloud/vision');


const translate = new Translate({
    projectId: "anuvad-springbot-api",
    credentials: credentials
});

const clientText = new textToSpeech.TextToSpeechClient({
    projectId: "anuvad-springbot-api",
    credentials: credentials
});

const clientSpeech = new speech.SpeechClient({
    projectId: "anuvad-springbot-api",
    credentials: credentials
});

const clientImage = new ImageAnnotatorClient({
    projectId: "anuvad-springbot-api",
    credentials: credentials
});


exports.translate = async (req, res) => {
    const {text, targetLanguage} = req.body;

    try {
        if (!text || !targetLanguage) {
            return res.status(400).json({
                error: 'Missing required parameters: text and/or targetLanguage'
            });
        }
        const [translation] = await translate.translate(text, targetLanguage);
        res.status(200).json({
            translatedText: translation
        });
    } catch (error) {
        console.error('Error translating:', error);
        res.status(500).json({
            error: 'Unable to translate !'
        });
    }
}

exports.getAllLanguages = async (req, res) => {
    try {
        const [languages] = await translate.getLanguages();
        res.status(200).json({
            languages
        });
    } catch (error) {
        console.error('Error translating:', error);
        res.status(500).json({
            error: 'Unable to translate !'
        });
    }
}


// https://cloud.google.com/text-to-speech
exports.textToSpeech = async (req, res) => {
    const {text, languageCode, ssmlGender, pitch, speakingRate, name} = req.body;
    const request = {
        "input": {
            "text": text
        },
        "voice": {
            "languageCode": languageCode,
            "name": name,
            "ssmlGender": ssmlGender
        },
        "audioConfig": {
            "audioEncoding": "LINEAR16",
            "effectsProfileId": [
                "medium-bluetooth-speaker-class-device"
            ],
            "pitch": pitch,
            "speakingRate": speakingRate,
            "sampleRateHertz": "24000",
        }
    }

    try {
        const [response] = await clientText.synthesizeSpeech(request);
        const outputFile = 'output.mp3';
        fs.writeFileSync(outputFile, response.audioContent, 'binary');
        console.log(`Audio content written to file: ${outputFile}`);
        res.status(200).json({
            message: "mp3 file created successfully .."
        });
    } catch (error) {
        console.error('Error synthesizing speech:', error);
        res.status(500).json({
            message: "Error synthesizing speech !",
            error
        });
    }
}

//https://cloud.google.com/speech-to-text
exports.speechToText = async (req, res) => {
    const {audioFileLocation, languageCode} = req.body;

    const config = {
        "encoding": "LINEAR16",
        "languageCode": languageCode,
        "enableAutomaticPunctuation": true,
        "sampleRateHertz": "24000",
    };

    const audio = {
        content: fs.readFileSync(audioFileLocation).toString('base64'),
    };

    const request = {
        "config": config,
        "audio": audio,
    };

    try {
        const [response] = await clientSpeech.recognize(request);
        console.log(response)
        const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join('\n');

        console.log('Transcription:', transcription);
        res.status(200).json({
            message: "speech recognized successfully ..",
            transcription
        });
    } catch (error) {
        console.error('Error performing speech recognition:', error);
        res.status(500).json({
            message: "Error performing speech recognition !",
            error
        });
    }

}

exports.imageToText = async (req, res) => {
    const {imageFileLocation} = req.body;

    try {
        const image = fs.readFileSync(imageFileLocation);

        const [result] = await clientImage.textDetection(image);
        const textAnnotations = result.textAnnotations;

        if (textAnnotations.length === 0) {
            console.log('No text found in the image.');
        } else {
            // Extract and print the detected text
            const text = textAnnotations[0].description;
            console.log(`Detected text:${text}`);
            res.status(200).json({
                message: "Text generated successfully ..",
                text
            });
        }
    } catch
        (error) {
        console.error('Error performing OCR:', error);
        res.status(500).json({
            message: "Error performing OCR !",
            error
        });
    }
}

