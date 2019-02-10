const botconfig = require("./botconfig.json");
const tokenfile = require("./token.json");
const Discord = require("discord.js");
const fs = require("fs");
const bot = new Discord.Client({disableEveryone: true});
bot.commands = new Discord.Collection();
let coins = require("./coins.json");
let xp = require("./xp.json");
let vermelho = botconfig.vermelho;

fs.readdir("./commands/", (err, files) => {

  if(err) console.log(err);
  let jsfile = files.filter(f => f.split(".").pop() === "js")
  if(jsfile.length <= 0){
    console.log("Couldn´t find commands.")
    return;
  }

  jsfile.forEach((f, i) =>{
    let props = require(`./commands/${f}`);
    console.log(`${f} loaded!`);
    bot.commands.set(props.help.name, props);
  });
});


bot.on("ready", async () => {
  console.log(`${bot.user.username} is online!`);

  bot.user.setActivity("ANYGAMES", {type: "WATCHING"});

  //bot.user.setGame("AnyGames!");
});

bot.on('guildMemberAdd', member => {

  console.log('User '+ member.user.username + ' Juntou-se ao servidor!🥳')
  console.log(member)

  var role= member.guild.roles.find('name', 'User');

  member.addRole(role)

  member.guild.channels.get('406244429502873600').send('**' + member.user.username + '**, Juntou-se ao servidor!🥳');

});


bot.on("message", async message => {

  if(message.author.bot) return;
  if(message.channel.type === "dm") return;

  let prefixes = JSON.parse(fs.readFileSync("./prefixes.json", "utf8"));

  if(!prefixes[message.guild.id]){
    prefixes[message.guild.id] = {
      prefixes: botconfig.prefix
    };
  }

if(!coins[message.author.id]){
  coins[message.author.id] = {
    coins: 0
  };
}

let coinAmt = Math.floor(Math.random() * 5) + 1;
let baseAmt = Math.floor(Math.random() * 5) + 1;
console.log(`${coinAmt} ; ${baseAmt}`);

if(coinAmt === baseAmt){
  coins[message.author.id] = {
    coins: coins[message.author.id].coins +coinAmt
  };
fs.writeFile("./coins.json", JSON.stringify(coins), (err) => {
  if (err) console.log(err)
});
let coinEmbed = new Discord.RichEmbed()
.setAuthor(message.author.username)
.setColor("#ff0000")
.addField("💸", `${coinAmt} moeda(s) adicionadas à sua conta!`);

message.channel.send(coinEmbed).then(msg => {msg.delete(5000)});
}

let xpAdd = Math.floor(Math.random() * 7) +8;
console.log(xpAdd);

if(!xp[message.author.id]){
  xp[message.author.id] = {
    xp: 0,
    level: 1
  };
}


let curxp = xp[message.author.id].xp;
let curlvl = xp[message.author.id].level;
let nxtLvl = xp[message.author.id].level * 300;
xp[message.author.id].xp =  curxp + xpAdd;
if(nxtLvl <= xp[message.author.id].xp){
  xp[message.author.id].level = curlvl + 1;
  let lvlup = new Discord.RichEmbed()
  .setTitle("Acabou de Subir de Nivel 🥳")
  .setColor(vermelho)
  .addField("Novo Nivel", curlvl + 1);

  message.channel.send(lvlup).then(msg => {msg.delete(5000)});
}
fs.writeFile("./xp.json", JSON.stringify(xp), (err) => {
  if(err) console.log(err)
});

let blacklisted = ['!report', 'discord.gg', '!ping', '!prefixo', '!ban', '!kick', '!avisar', '!mute', '!ajuda', '!limpar', '!avisos', '!staff', '!moedas', '!nivel', '!pagar', '/report', '/ping', '/prefixo', '/ban', '/kick', '/avisar', '/mute', '/ajuda', '/limpar', '/avisos', '/staff', '/moedas', '/pagar', '/nivel'];

let foundInText = false;
for (var i in blacklisted) {
  if (message.content.toLowerCase().includes(blacklisted[i].toLowerCase())) foundInText = true;
}

if (foundInText) {
  message.delete();
}

  let prefix = prefixes[message.guild.id].prefixes;
  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  let args = messageArray.slice(1);

  let commandfile = bot.commands.get(cmd.slice(prefix.length));
  if(commandfile) commandfile.run(bot,message,args);


});

bot.login(tokenfile.token);
