/**
 * App ID for the skill
 */
var APP_ID =  ""//replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';

var https = require('https');

/**
 * The AlexaSkill Module that has the AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

/**
* Current price URL prefix
*/
var currentPriceEndpoint = 'https://api.coindesk.com/v1/bpi/currentprice.json'


/**
 * BitCoinPriceSkill is a child of AlexaSkill.
 *
 */
var BitCoinPriceSkill = function() {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
BitCoinPriceSkill.prototype = Object.create(AlexaSkill.prototype);
BitCoinPriceSkill.prototype.constructor = BitCoinPriceSkill;

BitCoinPriceSkill.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("BitCoinPriceSkill onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
};

BitCoinPriceSkill.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("BitCoinPriceSkill onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    getWelcomeResponse(response);
};

BitCoinPriceSkill.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
};

BitCoinPriceSkill.prototype.intentHandlers = {

    "GetBitCoinCurrentPriceIntent": function (intent, session, response) {
        handleCurrentPriceRequest(intent, session, response);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        var speechText = "With Bitcoin Prices Powered by Coindesk, you can get bitcoin prices in real time.  " +
            "For example, you could ask alexa to get the bitcoin prices right now ";
        var repromptText = "Ask alexa for bitcoin prices";
        var speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        var repromptOutput = {
            speech: repromptText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.ask(speechOutput, repromptOutput);
    }
};

/**
 * Function to handle the onLaunch skill behavior
 */

function getWelcomeResponse(response) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var cardTitle = "Bitcoin prices right now - Powered by Coindesk";
    var repromptText = "With bitcoin price monitor you can get the bitcoin prices in real time. To ask alexa for current bitcoin price, just say current prices";
    var speechText = "<p>Bitcoin prices.</p> <p>Ask alexa for current bitcoin price.</p>";
    var cardOutput = "History Buff. Ask me for current bitcoin price. Say current bitcion prices.";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.

    var speechOutput = {
        speech: "<speak>" + speechText + "</speak>",
        type: AlexaSkill.speechOutputType.SSML
    };
    var repromptOutput = {
        speech: repromptText,
        type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    response.askWithCard(speechOutput, repromptOutput, cardTitle, cardOutput);
}

function handleCurrentPriceRequest(intent, session, response) {
    var cardTitle = "Latest Bitcoin price.",
        cardContent = "";
    getPrice(function (price) {
        var speechText = "";
        if (price.length == 0) {
            speechText = "There is a problem connecting to Coindesk at this time. Please try again later.";
            cardContent = speechText;
            response.tell(speechText);
        } else {
            speechText = "<p> The latest price of 1 bitcoin as per coindesk is: " + speechText + price + "</p> ";
            cardContent = "The latest bitcoin price as per Coindesk is " + price;
            var speechOutput = {
                speech: "<speak>" + speechText + "</speak>",
                type: AlexaSkill.speechOutputType.SSML
            };
            var repromptOutput = {
                speech: "<speak>" + "Please ask again for today's prices if you want to know the latest prices." + "</speak>",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            response.askWithCard(speechOutput, repromptOutput, cardTitle, cardContent);
        }
    });
}

function getPrice(eventCallback) {
    var url = currentPriceEndpoint;

    https.get(url, function(res) {
        var body = '';

        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            var stringResult = parseJson(body);
            eventCallback(stringResult);
        });
    }).on('error', function (e) {
        console.log("Got error: ", e);
    });
}

function parseJson(inputText) {
    var resultObject = JSON.parse(inputText);
    return resultObject.bpi.USD.rate_float + " " + resultObject.bpi.USD.description;
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the HistoryBuff Skill.
    var skill = new BitCoinPriceSkill();
    skill.execute(event, context);
};

