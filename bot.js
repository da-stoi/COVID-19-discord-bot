const Discord = require('discord.js');
const client = new Discord.Client();
const package = require('./package.json');
const axios = require("axios");

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setUsername("COVID-19 Bot");
});

client.on('message', (receivedMessage) => {
  if (receivedMessage.author === client.user) { // Prevent bot from responding to its own messages
    return
  }
  if (receivedMessage.content.startsWith("!")) {
    if (receivedMessage.channel.type == "dm") {
      processDmCommand(receivedMessage);
      return;
    }
    processCommand(receivedMessage);

  }
});

function processCommand(receivedMessage) {
  let fullCommand = receivedMessage.content.substr(1) // Remove the leading exclamation mark
  let splitCommand = fullCommand.split(" ") // Split the message up in to pieces for each space
  let primaryCommand = splitCommand[0].toLowerCase(); // The first word directly after the exclamation is the command
  let arguments = splitCommand.slice(1); // All other words are arguments/parameters/options for the command

  console.log("Command received: " + primaryCommand)
  console.log("Arguments: " + arguments) // There may not be any arguments

  switch (primaryCommand) {
    case "help":
      helpCommand(arguments, receivedMessage)
      break;
    case "stats":
      statsCommand(arguments, receivedMessage)
      break;
    default:
      receivedMessage.channel.send("Thats not a command that I know. Try `!help`")
  }
}

function processDmCommand(receivedMessage) {
  let fullCommand = receivedMessage.content.substr(1) // Remove the leading exclamation mark
  let splitCommand = fullCommand.split(" ") // Split the message up in to pieces for each space
  let primaryCommand = splitCommand[0].toLowerCase(); // The first word directly after the exclamation is the command
  let arguments = splitCommand.slice(1) // All other words are arguments/parameters/options for the command

  console.log("Command received: " + primaryCommand)
  console.log("Arguments: " + arguments) // There may not be any arguments

  switch (primaryCommand) {
    case "help":
      helpCommand(arguments, receivedMessage)
      break;
    case "tag":
      tagCommand(arguments, receivedMessage)
      break;
    default:
      receivedMessage.channel.send("Thats not a command that I know. Try `!help`")
  }
}

function helpCommand(arguments, receivedMessage) {

  receivedMessage.channel.send({
    embed: {
      color: 139,
      title: "It's too late!",
      footer: "Data from WorldMeters.info via javieraviles's covidAPI. | Bot written by Daniel Stoiber"
    }
  }).then(msg => { msg.delete(20000) });

}

async function statsCommand(arguments, receivedMessage) {
  receivedMessage.delete();

  if (arguments.length > 0) {
    countryStatsCommand(arguments, receivedMessage);
  } else {
    receivedMessage.channel.startTyping();

    const statsReq = await axios({
      method: "GET",
      url: "https://coronavirus-19-api.herokuapp.com/all"
    }).catch(function (e) {
      console.log(e);
    });

    const data = await statsReq.data;

    receivedMessage.channel.send({
      embed: {
        color: 15417396,
        title: 'COVID-19 Stats',
        description: 'General COVID-19 Stats',
        thumbnail: {
          url: 'https://thumbs-prod.si-cdn.com/mGzVOiub9nq8OQFc0Q_q90D1JWw=/fit-in/1600x0/https://public-media.si-cdn.com/filer/79/4a/794a7e74-8c99-4fde-abcd-a303bc302ba1/sars-cov-19.jpg',
        },
        "fields": [
          {
            name: "Total Cases",
            value: data.cases,
          },
          {
            name: "Total Deaths",
            value: data.deaths,
          },
          {
            name: "Total Recoverd",
            value: data.recovered,
          },
          {
            name: '\u200b',
            value: '\u200b',
            inline: false,
          }
        ],
        footer: {
          text: "Data from WorldMeters.info via javieraviles's covidAPI. | Bot written by Daniel Stoiber"
        }
      }
    });
    receivedMessage.channel.stopTyping();
  }
}

async function countryStatsCommand(arguments, receivedMessage) {
  
  receivedMessage.channel.startTyping();

  const statsReq = await axios({
    method: "GET",
    url: "https://coronavirus-19-api.herokuapp.com/countries/" + arguments[0]
  }).catch(function (e) {
    console.log(e);
  });

  const data = await statsReq.data;


  // try {
  //   JSON.parse(data);
  // } catch {
  //   receivedMessage.channel.send("Cound not find that country.")
  //   return;
  // }
  receivedMessage.channel.send({
    embed: {
      color: 15417396,
      title: 'COVID-19 Stats',
      description: data.country + ' COVID-19 Stats',
      thumbnail: {
        url: 'https://thumbs-prod.si-cdn.com/mGzVOiub9nq8OQFc0Q_q90D1JWw=/fit-in/1600x0/https://public-media.si-cdn.com/filer/79/4a/794a7e74-8c99-4fde-abcd-a303bc302ba1/sars-cov-19.jpg',
      },
      "fields": [
        {
        name: "Total Cases",
        value: data.cases,
        },
        {
          name: "Total Deaths",
          value: data.deaths,
        },
        {
          name: "Total Recoverd",
          value: data.recovered,
        },
        {
          name: '\u200b',
          value: '\u200b',
          inline: false,
        }
      ],
      footer: {
        text: "Data from WorldMeters.info via javieraviles's covidAPI. | Bot written by Daniel Stoiber"
      }
    }
  }).catch(function (){
    receivedMessage.channel.send("Could not find that country.");
  });
  receivedMessage.channel.stopTyping();
}

function tagCommand(arguments, receivedMessage) {
  if (arguments.length > 0) {
    if (arguments[0] === "streaming" || arguments[0] === "watching" || arguments[0] === "playing" || arguments[0] === "listening" || arguments[0] === "clear") {
      client.user.setActivity(receivedMessage.content.substr(arguments[0].length + 5), { type: arguments[0] });
    } else {
      receivedMessage.channel.send("<@" + receivedMessage.author.id + "> please enter a valid tag type. `watching`, `streaming`, `playing`, `listening`")
    }
  } else {
    receivedMessage.channel.send("<@" + receivedMessage.author.id + "> please enter a tag type.")
  }
}
client.login(process.env.TOKEN);