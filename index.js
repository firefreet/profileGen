// module for terminal prompting
const inquirer = require("inquirer");
// module for asychronous API calls
const axios = require("axios");
// module for file system access
const fs = require("fs");
// module to translate html text into a facsimile of a browser DOM
const jsdom = require("jsdom");
// module for promisifying functions
const { promisify } = require("util")
// promisify the readFile function, so you can use .then()
const readFilePromisary = promisify(fs.readFile)
// pull out the JSDOM class from the jsdom module
const { JSDOM } = jsdom;
// create variables for later use
var fileString = null;
var dom = null;
var $ = null;
// plan to add to the prompt to ask if user wants the file to open on completion
const questions = [
    {
        name: "profileName",
        message: "What is your GitHub profile name?"
    },
    {
        name: "color",
        message: "What is your favorite color?"
    }
];

// function to call the GitHub api, and set various data into the html
async function gitAndSetInfo(profileName, color) {
    // url for git hub profile data
    const queryUrl = `https://api.github.com/users/${profileName}`;
    const starsUrl = `https://api.github.com/users/${profileName}/starred`
    // call the api and get the repo data back
    var response
    try {
        response = await axios.get(queryUrl);
        stars = await axios.get(starsUrl);
    } catch (err) {
        console.log(err)
    }
    // create object to contain only the pieces we want to use from the response
    var smallObject = (({ avatar_url: picture, name, html_url: gitURL, blog, bio, public_repos, followers, following }) => ({ picture, name, gitURL, blog, bio, public_repos, followers, following}))(response.data);
    smallObject.stars = stars.data.length
    console.log(smallObject)
    // loop through smallObject
    $.each(smallObject,(key,value) => {
        // get the elements that need to be updated
        var element = $(`#${key}`);
        // set text, href, or src depending on the type of element
        switch (element.prop('tagName')) {
            case "A": {
                element.text(value);
                element.attr("href", value)
            }
                break;
            case "P": 
            case "H1": {
                element.text(value);
            }
                break;
            case "IMG": {
                element.attr("src", value);
            }
        }
    });
    // get the entire HTML string of the modified DOM
    var htmlString = dom.window.document.documentElement.outerHTML
    // write it out to a file
    fs.writeFile("./index.html", htmlString, function (err) {
        if (err) {
            console.log(err);
        } else { console.log("Success") }
    });
};

// function that does it all, set as async to allow use of await
async function init() {
    try {
        // get the text from the HTML template file
        fileString = await readFilePromisary("./template.html", "UTF8");
        // create a Document Object Model type object
        dom = new JSDOM(fileString);
        // pass the DOM object into the jquery module and set as the normal $ variable
        $ = require("jquery")(dom.window);
    } catch (err) {
        console.log(err);
        return err;
    }
    // prompt user in the console based on previously defined questions object
    const { profileName, color } = await inquirer.prompt(questions)
    // once the prompts are complete...
    gitAndSetInfo(profileName, color)
};
init()