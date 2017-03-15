# Send the first voice command to your skill

:clock3:  ~ `15 minutes`

You're almost ready to make the first voice command. At this stage you're acting as any end user that is installing the skill. You'll be going through the same experience.

### Decide how you want to interact with Alexa

There are several ways to interact with Alexa:

1. ##### Using the Browser
  * Using the `Test` tab on the page you set up the Amazon Alexa Skill.
  * Or via https://echosim.io/ (requires a microphone)

2. ##### Using a Mobile app
    * iOS  - Install [Reverb for Amazon Alexa](https://itunes.apple.com/bt/app/reverb.ai/id1144695621?mt=8)
    * Android - Install [Reverb for Amazon Alexa](https://play.google.com/store/apps/details?id=agency.rain.android.alexa&hl=en)

    > Once you open the mobile app use the access credentials provided during the lab to login.

3. ##### Using an Amazon Alexa device
    This is out of scope for this lab.

### Enable the skill

Open the browser to: https://alexa.amazon.com .
> Use the same credentials used to setup the Amazon Alexa skill.

On the left side menu click on `Skills`, then click `Your skills` link on top of the page. You should see a list with your skills. Click on `Adobe Analytics skill` to open it.

<img src="/docs/images/amazon-alexa-your-skills.png" height="200">


## Link Amazon Alexa with Adobe

The first thing end users should see after installing this skill is a screen telling them that Account Linking is required.

<img src="/docs/images/amazon-alexa-skill-link-account.png" height="240">

Click on `Enable` button and login using an Adobe ID.The browser should redirect you now to Adobe's login page.
> You should use the Adobe ID provided during the lab.

<img src="/docs/images/adobe-login-screen.png" height="250">

Once login is successful with Adobe, Alexa should confirm it with a message similar to the one in the screenshot below.

<img src="/docs/images/adobe-login-success.png" height="150">

To complete this section move on to Exercise 1.

## Exercise 1

In this exercise we will configure Alexa to Respond back with "Hello" followed by your name after the skill is launched.

### Step 1
Using the browser open `exercises/exercise-1/alexa-skill.js` file in your github fork and click the pencil icon to edit it. If you are using the CLI open this file in a text editor.

### Step 2
Add code to handle new sessions requests. A `LaunchRequest` is an object that represents that a user made a request to an Alexa skill, but did not provide a specific intent.

```javascript
// Create default handlers
var newSessionHandlers = {
    'LaunchRequest': function () {
        //Skill was launched

        //Say Hello!
        this.emit(':tell', "Hello NAME");
    }
};
```

### Step 3
In the main function register the `newSessionHandlers` with the Alexa SDK

```javascript
alexaSDK.registerHandlers(newSessionHandlers);
```

### Step 4
Commit changes back to github, either using the browser or the git CLI.

### Step 5

Make sure the `manifest.yaml` file has the location field set to:
```yaml
location: exercises/exercise-1/alexa-skill.js
```

### Step 6

Invoke your skill.

* `You`: _"Alexa, ask Adobe Analytics"_

* `Alexa`: "_Welcome to Adobe Analytics.. Which report suite would you like to use? Summit Demo 2017, Template Report Suite_"
