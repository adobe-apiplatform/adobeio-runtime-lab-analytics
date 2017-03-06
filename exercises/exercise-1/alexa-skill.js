/*
 * Copyright 2017 Adobe Systems Incorporated. All rights reserved.
 *
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS OF ANY KIND,
 * either express or implied.  See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Alexa = require('alexa-sdk');   //Alexa SDK

var states = {
    STATE_RSID_SELECTION: '_STATE_RSID_SELECTION',
    STATE_QUERY: '_STATE_QUERY'
};

var APP_ID = null;
/* ignored in this demo */

var API_KEY = '';
/* provided */
var ANALYTICS_COMPANY = '';
/* provided */

//Speech strings
var languageStrings = {
    "en-US": {
        "translation": {
            "WELCOME" : "Welcome to Adobe Analytics.. Which report suite would you like to use? %s.",
            "WELCOME_REPROMPT" : "You can choose from the following report suites %s.",
            "REPORT_SUITE_SELECTED" : "Ok, using the %s report suite. How can I help you?.",
            "REPORT_SUITE_SELECTED_REPROMPT" : "Currently, I can tell you information about the following metrics: %s. For example, you can ask me, how many page views this month?",
            "UNKNOWN_COMMAND_RSID_SELECTION" : "I'm sorry, I could not find that report suite. Which report suite would you like to use? %s.",
            "UNKNOWN_COMMAND_REPROMPT_RSID_SELECTION" : "Which report suite would you like to use? %s.",
            "UNKNOWN_COMMAND_QUERY" : "I'm sorry, I did not understand that request?",            
            "UNKNOWN_COMMAND_REPROMPT_QUERY" : "Currently, I can tell you information about the following metrics: %s. For example, you can ask me, how many page views this month?",
            "QUERY_REPROMPT" : "You can ask for another report or say stop to end the session.",
            "API_ERROR" : "Sorry, Adobe Analytics experienced an error. Please try again later.",
            "HELP_MESSAGE_RSID_SELECTION" : "I am able to answer questions about metrics from your Adobe Analytics report suites. First we must select a report suite. Which report suite would you like to use? %s.",
            "HELP_REPROMPT_RSID_SELECTION" : "Which report suite would you like to use? %s.",
            "HELP_MESSAGE_QUERY" : "I am able to answer questions about metrics from your Adobe Analytics report suites, For example, you can ask me, how many page views this month?",
            "HELP_REPROMPT_QUERY" : "Currently, I can tell you information about the following metrics: %s.",
            "YOU_ARE_WELCOME" : "My pleasure, have a fantastic day!",
            "STOP_MESSAGE" : "Goodbye!"
        }
    }
};

var main = function (event) {
    console.log('ALEXA Event', event.request.type + '!');

    API_KEY = event.analytics_api_key;
    /* default parameter for the action */
    ANALYTICS_COMPANY = event.analytics_company;
    /* default parameter for the action */

    return new Promise(
        (resolve, reject) => {
            try {
                var alexaSDK = Alexa.handler(event,
                    {
                        succeed: resolve,
                        fail: reject
                    });
                alexaSDK.APP_ID = APP_ID;
                alexaSDK.resources = languageStrings;

                return alexaSDK.execute();
            } catch (err) {
                console.log(err);
                reject(err.toString());
            }
        });
};
