# Setting up

This section goes through the steps that are needed to create an action in Adobe I/O Runtime, connecting it with an Amazon Alexa skill.

  * [Set up an action in Adobe I/O Runtime](#set-up-an-action-in-adobe-io-runtime)
  * [Retrieve the URL for your action](#retrieve-the-url-for-your-action)
  * [Setup an Amazon Alexa Skill](#setup-an-amazon-alexa-skill)
  * [Connect the action with an Amazon Alexa skill](#connect-the-action-with-an-amazon-alexa-skill)
  * [Setup user authentication with Adobe](#setup-user-authentication-with-adobe)


~ `15 minutes`

## Set up an action in Adobe I/O Runtime

1. Login or Create an Account on [GitHub](https://github.com)
2. Fork the repository used for the lab from:
    https://github.com/adobe-apiplatform/adobeio-runtime-lab-analytics

    > Make sure the repository is public

3. ##### Configure a new webhook

   In this step you'll deploy your own code into Adobe I/O Runtime so that you can respond to Alexa voice commands and extract data from Adobe Analytics in response.

   Visit your new repo and go to `Settings` > `Webhooks` > `Add webhook`

   <img src="/docs/images/github-webhooks-view.png" height="180">

   Configure the new webhook with the following information:

   Field        |    Value
   ------------ | -------------
   Payload URL  | `https://runtime-preview.adobe.io/github/webhook?api_key=...&analytics_company=...`
   Content type | _application/json_
   Secret       | _( provided during the lab )_
   Which events would you like to trigger this webhook? | _Just the push event._

   > `api_key`, `analytics_company`, and `Secret` are provided during the lab.

   When done, click the `Add webhook` button. Once the webhook is saved, you should see it listed.

   <img src="/docs/images/github-webhook-setup.png" height="400">

## Retrieve the URL for your action.

  Click the `Edit` button to go back into the webhook edit screen in order to get the URL to your action.

  Scroll down to see the `Recent deliveries` and click on the `...` button or the UID to open the details.

  <img src="/docs/images/github-recent-delivery.png" height="80">

  The `Response` Tab should indicate a `200` Response with a Body containing the  `action_endpoint`.

  > Save the value of the `action_endpoint` field as you need it in the next step.

  <img src="/docs/images/github-recent-delivery-open.png" height="350">


Congratulations ! At this point your code is deployed in the Adobe I/O Runtime. Let's go ahead and invoke this action with Amazon Alexa.

## Setup an Amazon Alexa Skill 

1. Login to Amazon Developer Portal at https://developer.amazon.com/

   > :bulb: The lab should have provided you with access credentials.

2. Select the `Alexa` tab and then click on `Get Started` in Alexa Skill Kit box.

    <img src="/docs/images/amazon-alexa-selection.png" height="220">

3. Your Amazon developer account provided for the lab is most likely setup with the `Adobe Analytics Skill` under `You skills` tab.  In this case you can fast forward to the next part, ["Connect the action with an Amazon Alexa skill"](connect-the-action-with-an-amazon-alexa-skill), or read below for on overview on how to configure a new skill.

4. ##### Setup general skill info
  * The `Name` field should contain something unique.
  * `Invocation name` is what Alexa uses to start the Skill; for example if the invocation name is `Adobe Analytics` you should say _Use Adobe Analytics_ to activate the skill.
  * The global fields can be left with the default value

    <img src="/docs/images/skills_info.png?raw=true" height="360">

5. ##### Setup an interaction model
   * Paste in the intent schema from [IntentSchema.json](/speechAssets/IntentSchema.json)

     ```json
      {  "intents": [{
            "intent": "OneshotReportIntent",
            "slots": [
              {          "name": "Metric",     "type": "LIST_OF_METRICS"    },
              {          "name": "Duration",   "type": "LIST_OF_DURATIONS"  }
            ]
          },{
            "intent": "ReportSuiteSelectionIntent",
            "slots": [
              {          "name": "ReportSuite",  "type": "AMAZON.LITERAL"   }
            ]
          },
          {      "intent": "PageViewsTodayIntent" },
          {      "intent": "ThankYouIntent"       },
          {      "intent": "AMAZON.HelpIntent"    },
          {      "intent": "AMAZON.StopIntent"    },
          {      "intent": "AMAZON.CancelIntent"  }
        ]}
      ```
      <img src="/docs/images/interaction_model.png?raw=true" height="470">

  * Create a custom slot for each of the items in [/speechAssets/customSlotTypes](/speechAssets/customSlotTypes) folder.
      * Click `Add Slot Type`
      * enter a `Type` and the associated `Values`
      * start with `LIST_OF_DURATIONS` Type and `Enter Values`:
        ```
        today
        yesterday
        this week
        last week
        this month
        last month
        this year
        last year
        ```
        <img src="/docs/images/amazon-alexa-custom-slot-type-edit.png" height="300">
      * Then add another slot type called `LIST_OF_METRICS` and `Enter Values`:
       ```
       page views
       visitors
       visits
       bounces
       bounce rate
       average page depth
       ```

  * In `Sample utterances` text area paste the sample utterances from [SampleUtterances.txt](/speechAssets/SampleUtterances.txt) file.

> Optionally if you want to learn more about Alexa's interaction model see https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-interaction-model-reference


## Connect the action with an Amazon Alexa skill

 Configure Alexa to invoke the action deployed in Adobe I/O Runtime each time a user makes a voice command.

 Click the `Configuration` option on the left side menu to see something similar to the screenshot below:

 * ##### Service Endpoint

   Select the `HTTPS` option for `Service Endpoint Type`.

   Paste the value you saved after setting up the GitHub webhook. The value should the a URL like:

   ```
   https://runtime-preview.adobe.io/github.com/<...>
   ```

  > Alexa will invoke this URL on each interaction with an end-user.

  <img src="/docs/images/amazon-alexa-setup-endpoint.png" height="250" >



## Setup user authentication with Adobe

  This step connects an Alexa user with a user in Adobe's Marketing Cloud. This Adobe ID will be used to extract data from Adobe Analytics.

  Answer `Yes` to the question `Do you want to allow users to create an account or link to an existing account with you`.

  Then set the following:

  * Set the Authorization URL to:
      ```
      https://ims-na1.adobelogin.com/ims/authorize/v1
      ```

  * Set the Client ID to the value provided during the lab.

  * Add the following domains to the list
      ```
      ims-na1.adobelogin.com
      adobeid-na1.services.adobe.com
      ```

  * In the scopes field add:
      ```
      openid,AdobeID,read_organizations,additional_info.projectedProductContext,additional_info.job_function,session
      ```
      These scopes are needed to pull data out from Marketing Cloud, Adobe Analytics.

  * Set Authorization Grant type to `Implicit Grant`
  * Click `Next`

  <img src="/docs/images/amazon-alexa-link-account.png" height="420" >

###  Configure an SSL Certificate
  Once you see the SSL Configuration screen select the second option `My development endpoint is a sub-domain of a domain that has a wildcard certificate` .

  Click  `Next`.

You are now ready to use this skill. In the next chapter you will learn how to test it and enhance it with new capabilities.
