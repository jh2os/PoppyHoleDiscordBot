// Bot functions
var jsonfile = require('jsonfile');

var file = 'messages.json'
var currentMessage = "";
var ppl = 0;
var allMessages = [];
var timer = 0;


// Load old messages in case of shutdown
function readPastMessages(file) {
	jsonfile.readFile(file, function(err, obj) {
		console.log(err);
  		allMessages = obj;
	});
}

// Write new messages to file in case of shutdown
function writeMessages(file) {
	jsonfile.writeFile(file, allMessages, function (err) {
  		console.error(err)
	});
}

// Test if messages are contained in messages array
function arrayContains(needle, arrhaystack)
{
    return (arrhaystack.indexOf(needle) > -1);
}

// In case of making this section an object return functions
function getMsg() {
	return currentMessage;
}

function getPpl() {
	return ppl;
}

function getTim() {
	return timer;
}


// Each time the script updates fire this to update information
function updateData(request	) {

	currentMessage = request.query.message;

	// Check if this is a new message
	if (!arrayContains(currentMessage, allMessages)) {
		allMessages.push(currentMessage);
		writeMessages(file);
	}

	if (request.query.time == "") {
		timer = "Candle is out";
	} else {
		timer = request.query.time + " seconds";
	}

	ppl = request.query.number;
}


// Return all the messages the bot has seen
function getAllMsg() {
	var returnstr = "";
	allMessages.sort();
	for (var i = 0; i < allMessages.length; i++) {
		returnstr += allMessages[i];
		returnstr += "\n";
	}
	return returnstr;
}




// Enter discord bot
const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
client.on("ready", () => {

  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
  client.user.setActivity(`Watching the hole`);
});

client.on("guildCreate", guild => {
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  });

client.on("guildDelete", guild => {
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  });


client.on("message", async message => {

  // Ignore bot messages and messages not directed at bot
  if(message.author.bot) return;
  if(message.content.indexOf(config.prefix) !== 0) return;
  
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  
  if(command === "ping") {
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
  }
  
  if(command === "status") {
	var ppl = getPpl();
	var tim = getTim();
	console.log(ppl, tim);
	var msg = "There are " + ppl + " people in the hole\nCandle: " + tim;
	message.channel.send(msg);
  } 
  if (command === "messages") {
	var msg = getAllMsg();
	message.channel.send(msg);
  }
  if (command === "help") {
	var msg = "";
	msg += "Available commands are:\n";
	msg += " - status\n";
	msg += "       Displays the number of people in the hole and the current candle stats\n";
	msg += " - messages\n";
	msg += "       Displays all messages seen in the hole since the bot has been online\n";
	msg += " - help\n";
	msg += "       Displays this message\n";
	message.channel.send(msg);
  }  
});


// Server to handle local chrome extension request
var express = require("express");
var myParser = require("body-parser");
var app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.setHeader('Content-Type', 'application/json')
  next();
});

app.use(myParser.json({extend : true}));
app.post("/", function (request, res) {
	//console.log('body:' + JSON.stringify(request.body));
	res.send();
});
app.get('/', function (request, res) {
	//console.log('body: ' + JSON.stringify(request.query));
	updateData(request);
	res.send();
});


// Start everything
readPastMessages(file);		// Load our old messages
client.login(config.token);	// Start discord bot
app.listen(8080);			// Start listen server


