## Exercise 1

In this exercise we will configure Alexa to Respond back with "Hello" followed by your name after the skill is launched. 

### Step 1
Using the browser open exercises/exercise-1/alexa-skill.js in your github fork and click the pencil icon to edit it. If you are using the CLI open this file in a text editor.

### Step 2
Add code to handle new sessions requests. A LaunchRequest is an object that represents that a user made a request to an Alexa skill, but did not provide a specific intent.

```javascript
// Create default handlers
var newSessionHandlers = {
    'LaunchRequest': function () {
        //Skill was launched

        //TODO: Say Hello!
        this.emit(':tell', "Hello NAME");
    }
};
```

### Step 3
In the main function register the newSessionHandlers with the Alexa SDK 

```javascript
alexaSDK.registerHandlers(newSessionHandlers);
```

### Step 4
Commit changes back to github, either using the browser or the git CLI.

