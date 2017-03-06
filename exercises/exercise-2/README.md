## Exercise 2

In this exercise we will configure Alexa to let the user select a report suite using the Analytics API.

### Step 1
Using the browser open exercises/exercise-2/alexa-skill.js in your github fork and click the pencil icon to edit it. If you are using the CLI open this file in a text editor.

### Step 2 
Replace the LaunchRequest function inside of newSessionHandlers with the implementation below. This code will make a call to the Analytics API to get all available report suites and list them back to the user.

```javascript
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
```

### Step 3
Add function to handle get report suites call

```javascript
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
```

### Step 4
Add rsidSelectionHandlers to handle rsid selection state requests

```javascript
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
            //this.handler.state = states.STATE_QUERY;

            //Store the selected report suite in session
            this.attributes['selectedReportSuite'] = matchingReportSuite;

            //Tell use they can now ask for data
            var speechOutput = this.t("REPORT_SUITE_SELECTED", matchingReportSuite.name);
            var reprompt = this.t("REPORT_SUITE_SELECTED_REPROMPT";
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
```    
    
### Step 5
Add function to match spoken word to report suite

```javascript    
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
```

### Step 6
Add function to turn an array of report suites into a comma separated string

```javascript
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
```

### Step 7
Register rsidSelectionHandlers with AlexaSDK in the main method.

```javascript
alexaSDK.registerHandlers(newSessionHandlers, rsidSelectionHandlers);

```

### Step 8
If you are editing the code in the browser commit the changes to alexa-skill.js, ignore this step if you are using the CLI.

### Step 9
 Change the location manifest.yaml to point to

```
exercises/exercise-2/alexa-skill.js
```

### Step 10
Commit changes back to github, either using the browser or the git CLI.

