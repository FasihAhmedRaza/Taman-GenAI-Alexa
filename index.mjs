import express from "express";
import Alexa , {SkillBuilders} from 'ask-sdk-core';
import morgan from "morgan";
import { ExpressAdapter }from 'ask-sdk-express-adapter'; // jo hamri skills ko add karne me help karee ga
import axios from "axios";
import pkg from 'ask-sdk-model';
const { services: { monetization: { MonetizationServiceClient } } } = pkg;


const app = express();

app.use(morgan('dev'))
const PORT = process.env.PORT || 3000;

const LaunchRequestHandler = {
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
      const speechText = 'Welcome to Taman Corp, Hope you are having a great day. I would like to collect few details from you if thats ok. Are you are Visitor or an Employee?';
  
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .withSimpleCard('speechText', speechText)
        .getResponse();
    },
  };

  const IdentifyPersonIntentHandler = {
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'IdentifyPersonIntent';
    },
    handle(handlerInput) {
      const personType = handlerInput.requestEnvelope.request.intent.slots.personType.value;
  
      if (personType === 'visitor') {
        const speechText = 'Please provide your visitor number.';
        return handlerInput.responseBuilder
          .speak(speechText)
          .reprompt(speechText)
          .getResponse();
      } else if (personType === 'employee') {
        const speechText = 'Please provide your employee number.';
        return handlerInput.responseBuilder
          .speak(speechText)
          .reprompt(speechText)
          .getResponse();
      } else {
        const speechText = 'I didn\'t catch that. Are you a visitor or an employee?';
        return handlerInput.responseBuilder
          .speak(speechText)
          .reprompt(speechText)
          .getResponse();
      }
    }
  };

  const ProvideNumberIntentHandler = {
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'ProvideNumberIntent';
    },
    async handle(handlerInput) {
      const number = handlerInput.requestEnvelope.request.intent.slots.number.value;
  
      // Adjusted API URL format
      let apiUrl = `http://45.79.122.7:5012/tcorp/alexa/v1/Simple/getname?Number=${number}`;
  
      let personData;
  
      try {
        const response = await axios.get(apiUrl);
        personData = response.data;
        console.log("Full API Response:", personData);  // Log the full response to debug
  
      } catch (error) {
        return handlerInput.responseBuilder
          .speak("Sorry, there was an error fetching your details. Please try again.")
          .getResponse();
      }
  
      // For debugging, use the entire response as the speech text
      const speechText = personData;  // Directly use the response string
  
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse();
    }
  };
  
const QueryHelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'QueryHelpIntent';
  },
  async handle(handlerInput) {
    const query = handlerInput.requestEnvelope.request.intent.slots.query.value;

    // Adjusted API URL format to include the query in the 'input' parameter
    let apiUrl = `http://45.79.122.7:5012/tcorp/alexa/v1/Simple/getresponse?input=${encodeURIComponent(query)}`;

    let apiResponse;

    try {
      const response = await axios.get(apiUrl);  // Send a GET request
      apiResponse = response.data;
      console.log("API Response:", apiResponse);  // Log response for debugging

    } catch (error) {
      return handlerInput.responseBuilder
        .speak("Sorry, there was an error processing your request. Please try again.")
        .getResponse();
    }

    // Assuming the API response is a plain text string
    const responseText = apiResponse;  // Directly using the API response

    const speechText = `${responseText}. Do you wish to continue?`;

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt('Do you want to continue?')
      .getResponse();
  }
};
const YesIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent';
  },
  handle(handlerInput) {
    const speechText = 'Hi there,  how can i help you today?,';
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  }
};

  const NoIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent';
  },
  handle(handlerInput) {
    const speechText = 'Thank you! Have a great day.';
    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  }
};

  const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
  const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


const skillBuilder = SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        IdentifyPersonIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    ProvideNumberIntentHandler,
    QueryHelpIntentHandler,
    YesIntentHandler,
    NoIntentHandler
        
        
    )
    .addErrorHandlers(
        ErrorHandler
    )



const skill = skillBuilder.create();

const adapter = new ExpressAdapter(skill ,false, false);

app.post('/api/v1/webhook-alexa' , adapter.getRequestHandlers());

app.use(express.json())

app.listen(PORT , () => {
    console.log(`Server is running on port ${PORT}`);
});