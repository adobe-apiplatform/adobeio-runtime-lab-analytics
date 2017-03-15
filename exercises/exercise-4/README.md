## Exercise 4

~ `20 minutes`

In this exercise we will configure Alexa to handle requests for different metrics over any duration.

### Step 1
Using the browser open `exercises/exercise-4/alexa-skill.js` in your github fork and click the pencil icon to edit it. If you are using the CLI open this file in a text editor.

### Step 2
Add `OneshotReportIntent` to `querySelectionHandlers`; this intent handler supports adhoc queries for various metrics over multiple time periods.

```javascript
    'OneshotReportIntent': function () {
        //Oneshot Report Started
        console.log("OneshotReportIntent Started");

        //Get the intent object
        var intent = this.event.request.intent;

        //Pull out the duration from the oneshot report intent
        var duration = getDurationFromIntent(intent);

        //Pull out the metric from the oneshot report intent
        var metric = getMetricFromIntent(intent);

        //Based on the duration get the start and end dates
        var durationDates = analytics.dateUtil.getDurationFromToDates(duration);

        //Store local scope
        var that = this;

        //Get selected report suite
        var reportSuiteId = this.event.session.attributes.selectedReportSuite.rsid;

        console.log("Active report suite is " + reportSuiteId);

        //Call get metric using the information from the intent
        getMetric(this.event.session.user.accessToken, reportSuiteId, metric.metricId, durationDates, function metricResponseCallback(err, reportResponse) {
            //Response text
            var speechOutput;

            if (err) {
                //An error occured while trying to query metric
                speechOutput = that.t("API_ERROR");
                console.log("error" + JSON.stringify(err));
            } else {
                //A valid value for metric was returned
                console.log("report response:" + reportResponse);

                //Verb used to describe the metric based on duration. Past or present
                var verb = getDurationVerb(duration);

                //Get the measurement from the intent
                var measurement = getMeasurementFromIntent(intent);
                if(measurement == "percent"){
                    //The measurement is a percent, round to 2 decimal places and multiply by 100
                    speechOutput = "The " + metric.query + " " + duration + " " + verb + " " + (parseFloat(reportResponse).toFixed(2) * 100) + " " + measurement + ".";
                }else if(measurement.indexOf("pages") > -1){
                    //The measurement is pages, round to 2 decimal places
                    speechOutput = "The " + metric.query + " " + duration + " " + verb + " " + parseFloat(reportResponse).toFixed(2) + " " + measurement + ".";
                }else{
                    //All other metrics
                    speechOutput = "The total number of " + metric.query + " " + duration + " " + verb + " " + reportResponse;
                }
            }

            that.emit(':ask', speechOutput, that.t("QUERY_REPROMPT"));
        });
    },
```

### Step 3
Add `getMeasurementFromIntent` function; this function will take an intent and figure out the measurement. The measurement is used to describe the results. Result could be pages or percent for support metrics.

```javascript
/**
 * Gets the measurement for the intent
 */
function getMeasurementFromIntent(intent) {
    console.log("Determining Intent Measurement");
    var metricSlot = intent.slots.Metric;
    var metricName = metricSlot.value;

    var metricValue = METRICS[metricName.toLowerCase()];
    var measurement = MEASUREMENT[metricValue];
    console.log("Measurement for " + metricValue + " is " + measurement);
    if (measurement) {
        return measurement;
    } else {
        return "";
    }
}
```

### Step 4
Add `getDurationFromIntent` function; this function will return the duration for a given intent.

```javascript
/**
 * Gets the duration from the intent
 */
function getDurationFromIntent(intent) {
    var durationSlot = intent.slots.Duration;
    if (!durationSlot || !durationSlot.value) {
      return {
          duration: "today"
      }
    }

    return durationSlot.value;
}
```

### Step 5
Add `getMetricFromIntent` function, this function will return the metric and it's API counterpart for a given intent.

```javascript
/**
 * Gets the metric from the intent
 */
function getMetricFromIntent(intent) {
    var metricSlot = intent.slots.Metric;
    var metricName = metricSlot.value.toLowerCase();
    console.log("Metric is " + metricName + " which maps to " + METRICS[metricName]);
    if (METRICS[metricName]) {
        return {
            query: metricName,
            metricId: METRICS[metricName]
        }
    } else {
        return {
            error: true
        }
    }
}
```

### Step 6
If you are editing the code in the browser commit the changes to `alexa-skill.js`, ignore this step if you are using the CLI.

### Step 7
Change `manifest.yaml` to point to exercise 4
```yaml
    location: exercises/exercise-4/alexa-skill.js
```

### Step 8
Commit changes back to github, either using the browser or the git CLI.

### Step 9

Invoke your skill.

* `You:` _"Alexa, ask Adobe Analytics"_
* `Alexa:` "_Welcome to Adobe Analytics.. Which report suite would you like to use? Summit Demo 2017, Template Report Suite_"

* `You:` _"Summit"_
* `Alexa`: _"Ok, using the Summit Demo 2017 report suite. How can I help you?"_

Right now you can use any `metric` configured in the `LIST_OF_METRICS` with any `duration` defined in the `LIST_OF_DURATIONS`. These were configured with the skill at the step: [setup an interaction model](/docs/setup.md#setup-an-interaction-model).

* `You:` _"How many visitors last month ?"_
* `Alexa:` _"The total number of visitors last month was ..."_

* `You:` _"What's the bounce rate this month ?"_
* `Alexa:` _"The bounce rate this month is ... percent."_

* `You:` _"Thank you !"_
* `Alexa:` _"My pleasure, have a fantastic day!"_

> If you have any errors don't forget to check out the logs.
