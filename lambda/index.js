const Alexa = require('ask-sdk-core');

const SKILL_NAME = "大きい箱と小さい箱";
const HELP_MESSAGE = "あなたに大きい箱か小さい箱のどちらかをあげましょう。さあ、どちらか好きな方を選んでください";
const HELP_REPROMPT = "大きい箱と小さい箱のどちらがいいですか？";
const FALLBACK_MESSAGE = "どちらかよくわかりませんでした。大きい箱と小さい箱のどちらがいいですか？";
const FALLBACK_REPROMPT = "大きい箱か小さい箱のどちらがいいですか？";
const STOP_MESSAGE = "さようなら";
const ERROR_MESSAGE = "ごめんなさい。わかりませんでした";

const data = [
    ["ちゅうトロのお寿司", "赤身のお寿司"],
    ["1万円札", "100万円札"],
    ["ドラえもんのポケット", "古着のポケット"]
];

const speechcons = [
    'あっ',
    'あら',
    'あらあ',
    'いいですね',
    'なるほど',
    'ふぅ',
    'ふふふ',
    'へぇ',
    'ほ〜ら',
    'まぁ',
    'むっ',
    'やった',
    'わぁ',
    'わおぅ'
];


function getRandomItem(data) {
    let no = 0;
    no = Math.floor(Math.random() * data.length);
    let items = data[no];
    if (Array.isArray(items)) {
        for (let i = items.length - 1; i >= 0; i--){
            let rand = Math.floor(Math.random() * (i+1));
            [items[i], items[rand]] = [items[rand], items[i]]
        }
    }
    return items;
}

function getSlotValue(handlerInput, slotName) {
    const intent = handlerInput.requestEnvelope.request.intent;
    if (!intent || !intent.slots || !intent.slots[slotName]) {
        return '';
    }
    const resolutions = intent.slots[slotName].resolutions;
    if (resolutions && resolutions.resolutionsPerAuthority) {
        if (resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_MATCH') {
            if (resolutions.resolutionsPerAuthority[0].values.length === 1) {
                return resolutions.resolutionsPerAuthority[0].values[0].value.name;
            }
        }
    }
    return '';
}

const LaunchRequestHandler = {
    canHandle(handlerInput) {
      const request = handlerInput.requestEnvelope.request;
      return request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
      return handlerInput.responseBuilder
        .speak(HELP_MESSAGE)
        .reprompt(HELP_REPROMPT)
        .getResponse();
    },
};
  
const SelectBoxHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return (request.type === 'IntentRequest'
            && request.intent.name === 'SelectBox');
    },
    handle(handlerInput) {
        const boxType = getSlotValue(handlerInput, 'boxType');
        if (!boxType) {
            return handlerInput.responseBuilder
                .speak(FALLBACK_MESSAGE)
                .reprompt(FALLBACK_MESSAGE)
                .getResponse();
        }

        let items = getRandomItem(data);
        let speechcon = getRandomItem(speechcons);
        let message = boxType + 'ですね。'
        message += '<say-as interpret-as="interjection">' + speechcon + '</say-as><break time="500ms"/>';
        message += boxType + 'には<break time="500ms"/>「' + items[0] + '」が入っていました。';
        message += 'もう一つの箱には「' + items[1] + '」が入っていました。';
        message += '<break time="1000ms"/>またやりたい時は、大きい箱か小さい箱を選んでください。';
        return handlerInput.responseBuilder
            .speak(message)
            .reprompt(message)
            .getResponse();
    },
};
  
const HelpHandler = {
    canHandle(handlerInput) {
      const request = handlerInput.requestEnvelope.request;
      return request.type === 'IntentRequest'
        && request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
      return handlerInput.responseBuilder
        .speak(HELP_MESSAGE)
        .reprompt(HELP_REPROMPT)
        .getResponse();
    },
};
  
const FallbackHandler = {
    // 2018-May-01: AMAZON.FallackIntent is only currently available in en-US locale.
    //              This handler will not be triggered except in that locale, so it can be
    //              safely deployed for any locale.
    canHandle(handlerInput) {
      const request = handlerInput.requestEnvelope.request;
      return request.type === 'IntentRequest'
        && request.intent.name === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
      return handlerInput.responseBuilder
        .speak(FALLBACK_MESSAGE)
        .reprompt(FALLBACK_REPROMPT)
        .getResponse();
    },
};
  
const ExitHandler = {
    canHandle(handlerInput) {
      const request = handlerInput.requestEnvelope.request;
      return request.type === 'IntentRequest'
        && (request.intent.name === 'AMAZON.CancelIntent'
          || request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
      return handlerInput.responseBuilder
        .speak(STOP_MESSAGE)
        .getResponse();
    },
  };
  
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
      const request = handlerInput.requestEnvelope.request;
      return request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
      console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
  
      return handlerInput.responseBuilder.getResponse();
    },
};
  
const ErrorHandler = {
    canHandle() {
      return true;
    },
    handle(handlerInput, error) {
      console.log(`Error handled: ${error.message}`);
  
      return handlerInput.responseBuilder
        .speak(ERROR_MESSAGE)
        .reprompt(ERROR_MESSAGE)
        .getResponse();
    },
};
  
const skillBuilder = Alexa.SkillBuilders.custom();
  
exports.handler = skillBuilder
    .addRequestHandlers(
      LaunchRequestHandler,
      SelectBoxHandler,
      HelpHandler,
      ExitHandler,
      FallbackHandler,
      SessionEndedRequestHandler
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();
