const Discord = require('discord.js')
const bot = new Discord.Client();
const save = require("./save.json")
const fs = require("fs");
const urlMetadata = require('url-metadata')

var id = "";

bot.on("ready", async () => {
    bot.user.setActivity("Mine du btc")
    this.id = bot.user.id;
});


bot.on('message', message => {    

    //check si l'utilisateur veut utiliser le bot et si c'est un user autre que le bot lui-même
    var cmdLine =  takeCmd(message.content);
    if(message.author.id != this.id){
        var prefix = "!";

        if(message.content.startsWith(prefix+"xaddlink")){
            addlink(cmdLine,message);
        }else if(message.content.startsWith(prefix+"xadd")){
            add(message);
        }else if(message.content.startsWith(prefix+"xrmve")){
            rmve(cmdLine,message);
        }else if(message.content.startsWith(prefix+"xfind")){
            find(cmdLine,message);
        }else if(message.content.startsWith(prefix+"xlist")){
            list(message);
        }else if(message.content.startsWith(prefix+"xcmd")){
            cmd(message);
        }
    }

})


var updateJSON = (json,message) => {
    fs.writeFile('./save.json',json, err => {
        if(err){
            message.channel.send("Error during register !")
        }
    })
}

var add = (msg) => {
    var channelName = msg.channel.name;
    var cmdLineSpecial = msg.content.split("\"\"\"");
    var myJson = save[channelName];
    var tag = ""
    if(!stringRegex(msg.content)){
        msg.channel.send("Votre commande `add` ne respecte pas la syntaxe classique ! (Couillon)");
        return;    
    }
    else{
        tag = createTag(cmdLineSpecial[2].split(" "),0);
        var nbOfElem = Object.keys(myJson).length;
        save[channelName]["nbElem"] = nbOfElem;
        save[channelName][nbOfElem] = {}
        save[channelName][nbOfElem]["text"] = msg.id
        save[channelName][nbOfElem]["tags"] = tag;
        json = JSON.stringify(save)
        updateJSON(json,msg);    

        msg.channel.send(" Texte enregistré! ");
    }

    
}

var createTag = (tagElem,j) => {
    var tag = "";
    var i = j;
    for(i; i <= tagElem.length - 1;i++){
        if(i > 0 && i < tagElem.length){
         tag += " ";
        }
        tag += tagElem[i];
    } 
    return tag;
}

var addlink = (cmdLine,msg) => {
    var channelName = msg.channel.name;
    var myJson = save[channelName];

    if(!linkRegex(msg.content)){
        msg.channel.send("Votre commande `addlink` ne respecte pas la syntaxe classique ... (Connard)");
        return;    
    }
    else{
        // Les tags commencent a la position [2]
        var tag = createTag(cmdLine,2);
        var nbOfElem = Object.keys(myJson).length + 1;
        save[channelName]["nbElem"] = nbOfElem;
        save[channelName][nbOfElem] = {}
        save[channelName][nbOfElem]["text"] = msg.id
        save[channelName][nbOfElem]["tags"] = tag;
        json = JSON.stringify(save)
        updateJSON(json,msg);    
    
        msg.channel.send(" Lien enregistré! ");
    }
}

var rmve = (cmdLine,msg) =>{
    var channelName = msg.channel.name;

    for(var i = 1; i < cmdLine.length; i++){
        if(save[channelName].hasOwnProperty(cmdLine[i])){
            delete save[channelName][cmdLine[i]];
            if(parseInt(save[channelName]["nbElem"]) == 1){delete save[channelName]["nbElem"];}
            else{save[channelName]["nbElem"] = parseInt(save[channelName]["nbElem"]) - 1;}
            json = JSON.stringify(save)
            updateJSON(json,msg)
            msg.channel.send("Element has been deleted ! ");
        }
        else{
            msg.channel.send("Element with ID " + cmdLine[i] + " not exist...");
        }
    }
   
}

async function msetadata(desc){
    
    var meta = await urlMetadata(desc).then(
        function (metadata) { // success handler
            return metadata;
        },
        function (error) { // failure handler
            console.log(error)
        })

    return meta;
}


async function beautifulText(Title,content,myMessage,tag,username){
    if(content.includes("\"\"\"")){
        var header = takeCmd(content)[1];
        return await new Discord.MessageEmbed()
                .setColor('#5BFF62')
                .setTitle(Title + "| " + header.slice(0, 20) +"...")
                .setThumbnail(myMessage.first().author.displayAvatarURL())
                .setURL('https://discord.js.org/')
                .setAuthor(username)
                .addFields(
                    { name: 'Texte', value: header },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'TAG :', value : tag}
                )
                .setTimestamp()
                .setFooter('Some footer text here')
    }
    else{
        var header = takeCmd(content)[1];
        var metadata = await msetadata(header);
        
        return await new Discord.MessageEmbed()
                    .setAuthor(username)
                    .setColor('#0099ff')
                    .setTitle(`ID : ${obj}`+ " " + metadata['title'])
                    .setThumbnail(metadata['image'])
                    .setTimestamp()
                    .setFooter('Some footer text here') 
                    .setURL(metadata['url'])
                    .addField('Description : ',  metadata['description'], true)
                    .addFields(
                        { name: '\u200B', value: '\u200B' },
                        { name: 'TAG :', value : tag}
                    )
      

    }
    
}

var stringRegex = (text) =>{
    var regexS = new RegExp("(!x[a-z]{3})[ ](\"\"\"[a-zA-Z0-9]+\"\"\")([ ][a-zA-Z0-9]+)+");
    
    return regexS.test(text);
}

var linkRegex = (text) =>{
    var textCut = text.split(" ");
    var regex = new RegExp("(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})");
    var regexL = new RegExp("")
    if(regex.test(textCut[1])){
        if(textCut.length >= 3){
            return true;
        }
    }
    return false;
}

async function list(msg){
    var channelName = msg.channel.name;
    var jsonElem = save[channelName];
    var i = 0;

    if(takeCmd(msg.content).length == 1){
        for(obj in jsonElem){
            
            if(digits_only(obj) == true){
               
                i++;
                var myMessage;
                await msg.channel.messages.fetch({around:jsonElem[obj]["text"],limit:1})
                .then(message => myMessage = message );
                var texxt = await beautifulText(`ID : ${obj}`, 
                                        myMessage.first().content,
                                        myMessage,
                                        jsonElem[obj]["tags"],
                                        msg.author.username)
                             
                msg.channel.send(texxt) 
            }  
        }
        if(i == 0){
            msg.channel.send("Rien n'a encore été enregistré dans ce channel !");
        }
    }
    else{
        msg.channel.send("Element missing in your cmdline !");
    }
    
}

var find = (cmdLine,msg) =>{
    var channelName = msg.channel.name;
    if(cmdLine.length == 2){
        findLink(msg,channelName,cmdLine[1]);
    }
    else{
        msg.channel.send("Tu ne peux rechercher qu'un seul élément à la fois ! (Abrutis)");
    }
}

async function findLink(msg,channelName,item){
    var jsonElem = save[channelName];
    var i = 0;
    for(obj in jsonElem){
        if(digits_only(obj) == true){
            if(jsonElem[obj]["tags"].includes(item)){
                i++;
                await msg.channel.messages.fetch({around:jsonElem[obj]["text"],limit:1})
                      .then(message => myMessage = message );
                      var texxt = await beautifulText(`ID : ${obj}`, 
                                              myMessage.first().content,
                                              myMessage,
                                              jsonElem[obj]["tags"],
                                              msg.author.username)
                     msg.channel.send(texxt) 
            }
        }       
    }
    if(i == 0){
        msg.channel.send("Nothing found ! ");
    }
}


var cmd = (msg) =>{
    msg.channel.send(" All your command have to start by !wikix");
    msg.channel.send(" !xadd [\\text\\] [tag(s)] ");
    msg.channel.send(" !xaddlink [link] [tags]");
    msg.channel.send(" !xrmve id");
    msg.channel.send(" !xfind [tag]");
}

var takeCmd = (command) => {
    var urlType = command.includes("\"\"\"");
    if(urlType == true){
        return command.split("\"\"\"");
    }
    return command.split(" ");
}

const digits_only = string => [...string].every(c => '0123456789'.includes(c));


bot.login("ODAyNTYzOTUzODk1OTMxOTA0.YAxD7Q.WSuzSbKWez9kWl9ltfjIkpmAvVg")