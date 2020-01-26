// module for terminal prompting
const inquirer = require("inquirer");
// module for asychronous API calls
const axios = require("axios");
// module for file system access
const fs = require("fs");
// module to translate html text into a facsimile of a browser DOM
const jsdom = require("jsdom");
// opens apps in default applications
const open = require('open');
// module to convert html to pdf
var pdf = require('html-pdf');
// pdf formatting options
var options = {
    format: 'Letter',
    height: '12.5in',
    width: '7.1in',
    border: '0'
};


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
const colorOptions = [
    {
        name: "Yellow",
        value: "GoldenRodYellow"
    },
    {
        name: "Gray",
        value: "Gray"
    },
    {
        name: "Green",
        value: "Pink"
    },
    {
        name: "Salmon",
        value: "Salmon"
    },
    {
        name: "SeaGreen",
        value: "SeaGreen"
    },
    {
        name: "Blue",
        value: "SkyBlue"
    },
    {
        name: "SteelBlue",
        value: "SteelBlue"
    }
]
// plan to add to the prompt to ask if user wants the file to open on completion
const questions = [
    {
        name: "profileName",
        message: "What is your GitHub profile name?",
        default: "firefreet"
    },
    {
        name: "color",
        message: "What is your favorite color?",
        default: "SteelBlue",
        choices: colorOptions,
        type: "list"
    },
    {
        name: "openOnRun",
        message: "Do you want to open the file on completion?",
        type: "confirm",
    }
];

// function to call the GitHub api, and set various data into the html
async function gitAndSetInfo(profileName, color) {
    color = `Light${color}`
    // users color choice gets set for the background of the jumbotron cards
    $(".jumbotron").attr("style",`background:${color}`)
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
    var smallObject = (({ avatar_url: picture, name, html_url: gitURL, blog, bio, public_repos, followers, following, location }) => ({ picture, name, gitURL, blog, bio, public_repos, followers, following, location }))(response.data);
    smallObject.stars = stars.data.length
    // loop through smallObject
    $.each(smallObject, (key, value) => {
        // get the elements that need to be updated
        var element = $(`#${key}`);
        // set text, href, or src depending on the type of element
        switch (element.prop('tagName')) {
            case "A": {
                element.attr("href", value);
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
        if (key === "location") {
            element.children("p").text(value);
            element.attr("href", `https://www.google.com/maps/place/${value}`)
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
    pdf.create(htmlString, options).toFile('./businesscard.pdf', function (err, res) {
        if (err) return console.log(err);
        console.log(res); // { filename: '/app/businesscard.pdf' }
    });
    return "./businesscard.pdf"
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
    const { profileName, color, openOnRun } = await inquirer.prompt(questions)
    // once the prompts are complete...
    const fileName = await gitAndSetInfo(profileName, color)
    console.log("last")
    // Opens the file in the default and waits for the opened app to quit.
    if (openOnRun) {
        await open(fileName, { wait: false });
    }
};
init()