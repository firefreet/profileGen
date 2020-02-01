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

module.exports = {
    colorOptions: colorOptions,
    questions: questions
}