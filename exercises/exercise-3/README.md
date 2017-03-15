## Exercise 3

~ `20 minutes`

In this exercise we will configure Alexa to respond to requests for the page views metric for the day.

### Step 1
Using the browser open `exercises/exercise-3/alexa-skill.js` in your github fork and click the pencil icon to edit it. If you are using the CLI open this file in a text editor.

### Step 2
Add `querySelectionHandlers` to skill; these methods will handle requests while in the Query state. To start we will just handle request for page view today.

```javascript
// Create a new handler for the Query state
var querySelectionHandlers = Alexa.CreateStateHandler(states.STATE_QUERY, {
    'PageViewsTodayIntent': function() {
        //Oneshot Report Started
        console.log("PageViewsTodayIntent Started");

        //Set duration to today
        var duration = "today";

        //Set metric to page views
        var metric = "metrics/pageviews";

        //Based on the duration get the start and end dates
        var durationDates = analytics.dateUtil.getDurationFromToDates(duration);

        //Store local scope
        var that = this;

        //Get selected report suite
        var reportSuiteId = this.event.session.attributes.selectedReportSuite.rsid;

        //Call get metric using the information from the intent
        getMetric(this.event.session.user.accessToken, reportSuiteId, metric, durationDates, function metricResponseCallback(err, reportResponse) {
            var speechOutput;
            console.log("in response");
            if (err) {
                //An error occured while trying to query metric
                speechOutput = that.t("API_ERROR");
                console.log("error" + JSON.stringify(err));
            } else {
                console.log("report response:" + reportResponse);

                //Verb used to describe the metric based on duration. Past or present
                var verb = getDurationVerb(duration);

                speechOutput = "The total number of page views today " + verb + " " + reportResponse;
            }

            that.emit(':ask', speechOutput, that.t("QUERY_REPROMPT"));
        });
    },
    'ThankYouIntent': function () {
        //User ask for something we are unable to answer
        var speechOutput = this.t("YOU_ARE_WELCOME");
        this.emit(':tell', speechOutput);
    },
    'Unhandled': function () {
        //User ask for something we are unable to answer
        var speechOutput = this.t("UNKNOWN_COMMAND_QUERY");
        var reprompt = this.t("UNKNOWN_COMMAND_REPROMPT_QUERY", getAllMetricsText());
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.HelpIntent': function () {
        //User asked for help
        var speechOutput = this.t("HELP_MESSAGE_QUERY");
        var reprompt = this.t("HELP_REPROMPT_QUERY", getAllMetricsText());
        this.emit(':ask', speechOutput, reprompt);
    },
    "AMAZON.StopIntent": function() {
        //User stopped the skill
        this.emit(':tell', this.t("STOP_MESSAGE"));
    },
    "AMAZON.CancelIntent": function() {
        //User cancelled the skill
        this.emit(':tell', this.t("STOP_MESSAGE"));
    }
});
```

### Step 3
Register querySelectionHandlers with AlexaSDK in main

```javascript
alexaSDK.registerHandlers(newSessionHandlers, rsidSelectionHandlers, querySelectionHandlers);
```

### Step 4
Add getMetric method to handle report queries

```javascript
/**
 * Queries a metric based from the Analytics API
 */
function getMetric(token, rsid, metric, durationDates, metricResponseCallback) {
    //Debug call
    console.log("Getting metric: " + metric);
    console.log("Start Date: " + durationDates.fromDate);
    console.log("End Date: " + durationDates.toDate);

    //Format dateRange string
    var dateRange = durationDates.fromDate + "/" + durationDates.toDate;

    //Create API headers
    var headers = {
        "Authorization": "Bearer " + token,
        "x-api-key": API_KEY,
        "x-proxy-company": ANALYTICS_COMPANY
    }

    //Instantiate Analytics API helper
    var analytics = require('adobe-analytics');

    //Query metric
    analytics.config(headers).then(function (api) {
        var args = {
            "rsid": rsid,
            "globalFilters": [{
                "type": "dateRange",
                "dateRange": dateRange,
            }],
            "metricContainer": {"metrics": [{"id": metric}]}
        }

        api.reports.runRankedReport({'body': args})
            .then(function (result) {
                var data = JSON.parse(result["data"]);
                var total = data.summaryData.totals[0];
                metricResponseCallback(null, total);
            })
            .catch( function(error) {
                metricResponseCallback(error,-1);
            });
    })
}
```

### Step 5
Add `getDurationVerb` function

```javascript
/**
 * Get a verb to describe the duration
 */
function getDurationVerb(duration){
    var verb = "was";
    if(duration == "today" || duration == "this week" || duration == "this month" || duration == "this year"){
        verb = "is";
    }
    return verb;
}
```

### Step 6
Add method to return a comma separated list of metrics.

```javascript
/**
 * Returns a comma separated list of supported metrics
 */
function getAllMetricsText() {
    var metricList = '';
    for (var metric in METRICS) {
        //pageviews and page views is listed as metrics.. Don't say them twice.
        if(metric != "page views"){
           metricList += metric + ", ";
        }
    }

    return metricList;
}
```

### Step 7
If you are editing the code in the browser commit the changes to `alexa-skill.js`, ignore this step if you are using the CLI.

### Step 8
Change the location `manifest.yaml` to point to
```yaml
    location: exercises/exercise-3/alexa-skill.js
```

### Step 9
Commit changes back to github, either using the browser or the git CLI.

### Step 10

Invoke your skill.

* `You:` _"Alexa, ask Adobe Analytics"_
* `Alexa:` "_Welcome to Adobe Analytics.. Which report suite would you like to use? Summit Demo 2017, Template Report Suite_"

* `You:` _"Summit"_
* `Alexa`: _"Ok, using the Summit Demo 2017 report suite. How can I help you?"_

* `You:`_"how many page views today ?"_
* `Alexa`: _"The total number of page views today is ..."_

* `You:` _"Thank you !"_
* `Alexa:` _"My pleasure, have a fantastic day!"_

> If you have any errors don't forget to check out the logs.
