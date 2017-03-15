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

// Analytics SDK
var analytics = require("adobe-analytics")

//Supported Metrics
var METRICS = {
    'pageviews': "metrics/pageviews",
    'page views': "metrics/pageviews",
    'visitors': "metrics/visitors",
    'visits':"metrics/visits",
    'bounces':"metrics/bounces",
    'bounce rate': "metrics/bouncerate",
    'average page depth':'metrics/averagepagedepth',
};

//Measurements of Metrics
var MEASUREMENT = {
    'metrics/bouncerate': "percent",
    'metrics/averagepagedepth': "pages"
};

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

// Create default handlers
var newSessionHandlers = {
    'LaunchRequest': function () {
        //Skill was launched

        //Set RSID selection state
        this.handler.state = states.STATE_RSID_SELECTION;

        //Store local scope
        var that = this;

        //Get a list of report suites
        getReportSuites(this.event.session.user.accessToken, function reportSuitesResponseCallback(err, reportSuites) {
            //Get a comma separated list of the report suites
            var reportSuiteList = getReportsSuitesListFromObject(reportSuites);
            console.log("Reportsuite list " + reportSuiteList);

            that.attributes['reportSuites'] = reportSuites;
            that.attributes['speechOutput'] = that.t("WELCOME", reportSuiteList);
            that.attributes['repromptSpeech'] = that.t("WELCOME_REPROMPT", reportSuiteList);
            that.emit(':ask', that.attributes['speechOutput'], that.attributes['repromptSpeech']);
        });
    }
};

// Create a new handler for the report suite selection state
var rsidSelectionHandlers = Alexa.CreateStateHandler(states.STATE_RSID_SELECTION, {
    'LaunchRequest': function () {
        this.emit('LaunchRequest'); // Uses the handler in newSessionHandlers
    },
    'ReportSuiteSelectionIntent': function () {
        console.log("ReportSuiteSelectionIntent Started");

        //Get all the reports suites loaded during this session
        var reportSuites = this.event.session.attributes.reportSuites;

        //Try and match the spoken report suite to one in our list
        var matchingReportSuite = matchReportSuite(this.event.request.intent.slots.ReportSuite.value, reportSuites);
        if(!matchingReportSuite.error){
            //We found a match!

            //Enter the query state
            this.handler.state = states.STATE_QUERY;

            //Store the selected report suite in session
            this.attributes['selectedReportSuite'] = matchingReportSuite;

            //Tell user they can now ask for data
            var speechOutput = this.t("REPORT_SUITE_SELECTED", matchingReportSuite.name);
            var reprompt = this.t("REPORT_SUITE_SELECTED_REPROMPT", getAllMetricsText());
            this.emit(':ask', speechOutput, reprompt);
        }else{
            //We were unable to match the spoken word to a report suite
            var reportSuiteList = getReportsSuitesListFromObject(reportSuites);
            var speechOutput = this.t("UNKNOWN_COMMAND_RSID_SELECTION", reportSuiteList);
            var reprompt = this.t("UNKNOWN_COMMAND_REPROMPT_RSID_SELECTION", reportSuiteList);
            this.emit(':ask', speechOutput, reprompt);
        }
    },
    'ThankYouIntent': function () {
        //User ask for something we are unable to answer
        var speechOutput = this.t("YOU_ARE_WELCOME");
        this.emit(':tell', speechOutput);
    },
    'Unhandled': function () {
        //Get a comma separated list of the report suites
        var reportSuites = this.event.session.attributes.reportSuites;
        var reportSuiteList = getReportsSuitesListFromObject(reportSuites);

        //User ask for something we are unable to answer
        var speechOutput = this.t("UNKNOWN_COMMAND_RSID_SELECTION", reportSuiteList);
        var reprompt = this.t("UNKNOWN_COMMAND_REPROMPT_RSID_SELECTION", reportSuiteList);
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.HelpIntent': function () {
        //Get a comma separated list of the report suites
        var reportSuites = this.event.session.attributes.reportSuites;
        var reportSuiteList = getReportsSuitesListFromObject(reportSuites);

        //User asked for help
        var speechOutput = this.t("HELP_MESSAGE_RSID_SELECTION", reportSuiteList);
        var reprompt = this.t("HELP_REPROMPT_RSID_SELECTION", reportSuiteList);
        this.emit(':ask', speechOutput, reprompt);
    },
    "AMAZON.StopIntent": function () {
        //User stopped the skill
        this.emit(':tell', this.t("STOP_MESSAGE"));
    },
    "AMAZON.CancelIntent": function () {
        //User cancelled the skill
        this.emit(':tell', this.t("STOP_MESSAGE"));
    }
});

/**
 * Returns a comma separated list of report suites loaded..
 */
function getReportsSuitesListFromObject(reportSuites) {
    var reportSuiteList = '';
    for (var key in reportSuites) {
        var reportSuite = reportSuites[key];
        reportSuiteList += reportSuite.name + ", ";
    }

    return reportSuiteList;
}

/**
 * Get the list of report suites
 */
function getReportSuites(token, reportSuitesResponseCallback) {
    //Create API headers
    var headers = {
        "Authorization": "Bearer " + token,
        "x-api-key": API_KEY,
        "x-proxy-company": ANALYTICS_COMPANY
    };

    var analytics = require('adobe-analytics');

    analytics.config(headers).then(function (api) {
        api.collections.findAll({expansion: "name", limit: "50"}).then(function (result) {
            var data = JSON.parse(result["data"]);
            var reportSuites = data.content;
            console.log(JSON.stringify(reportSuites));
            reportSuitesResponseCallback(null, reportSuites);
        })
    })
}

/**
 * Tries to match a report suite with the spoken name
 */
function matchReportSuite(spokenLiteral, reportSuites) {
    var reportSuiteList = '';
    for (var key in reportSuites) {
        var reportSuite = reportSuites[key];
        var re = new RegExp(spokenLiteral.toLowerCase(),"g");
        var match = reportSuite.name.toLowerCase().match(re);
        if(match != null){
            console.log("Found report suite match " + reportSuite);
            return reportSuite;
        }
    }

    console.log("No match found");
    return {
        error: true
    }
}

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
                alexaSDK.registerHandlers(newSessionHandlers, rsidSelectionHandlers);
                return alexaSDK.execute();
            } catch (err) {
                console.log(err);
                reject(err.toString());
            }
        });
};
