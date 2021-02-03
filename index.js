const Discord = require('Discord.js')
const bot = new Discord.Client();
const config = require("./config.json")
const save = require("./save.json")
const fs = require("fs");
const urlMetadata = require('url-metadata')
const urlexist =  require("url-exist")

var id = "";

bot.on("ready", async () => {
    console.log("Bot is running");
    bot.user.setActivity("Mine du btc")
    this.id = bot.user.id;
});


bot.on('message', message => {    

    //check si l'utilisateur veut utiliser le bot et si c'est un user autre que le bot lui-même
    var cmdLine =  takeCmd(message.content);
    
    if(message.author.id != this.id){
       switch(cmdLine[0]){
           case "!xadd": add(message); break;

           case "!xaddlink": addlink(cmdLine,message); break; 

           case "!xrmve": rmve(cmdLine,message); break; 

           case "!xfind": find(cmdLine,message); break; 

           case "!xlist": list(message); break; 
            
           case "!xcmd" : cmd(message); break; 

           default:
               console.log("moi pas comprendre");
               break;
       }
    }
    
})


var getByType = (type,mot) => {
    switch(type){
        case "call" : return takeCmd(mot)[0];   //Check si c'est bien wikix
            
        case "option": return mot[1]; // Check si c'est text ou link

        case "id" : return mot[2]; // Prend l'id choisit par l'user
        
        case "cmd" : return "cmd";

        case "find" : return "find";

        default : return "none";

    }
}



var updateJSON = (json,message) => {
    fs.writeFile('./save.json',json, err => {
        if(err){
            message.channel.send("Error during register !")
        }
    })
}


var add = (msg) => {
    var channelName = msg.channel.name;
    var cmdLineSpecial = msg.content.split("\\");
    var myJson = save[channelName];
    var tagFragment = cmdLineSpecial[0].split(" ");
    var tag = "";

    if(cmdLineSpecial.length != 3){
        msg.channel.send("Command Error : tag is missing ! ");
        return;    
    }

    else{
       var i = 0;
       for(i = 0; i <= tagFragment.length;i++){
           if(i > 0 && i < tagFragment.length - 1 ){
            tag += " ";
           }
           tag += cmdLine[i];
       } 
    }
    
    
    var nbOfElem = Object.keys(myJson).length;
    save[channelName]["nbElem"] = nbOfElem;
    save[channelName][nbOfElem + 1] = {}
    save[channelName][nbOfElem]["author"] = "tononcle";
    save[channelName][nbOfElem]["text"] = msg.id
    save[channelName][nbOfElem]["tags"] = tag;
    json = JSON.stringify(save)
    updateJSON(json,msg);    

    msg.channel.send(" Texte enregistré! ");
}

var addlink = (cmdLine,msg) => {
    var channelName = msg.channel.name;
    var myJson = save[channelName];
    var tag = "";

    if(cmdLine.length < 3){
        msg.channel.send("Command Error : tag or url is missing ! ");
        return;    
    }
    else{
       var i = 0;
       for(i = 2; i <= cmdLine.length;i++){
           if(i > 0 && i < cmdLine.length - 1 ){
            tag += " ";
           }
           tag += cmdLine[i];
       } 
    }

    var rouille = urlexist("cmdLine[1]");
    console.log( rouille );
    
    /*var nbOfElem = Object.keys(myJson).length + 1;
    save[channelName]["nbElem"] = nbOfElem;
    save[channelName][nbOfElem] = {}
    save[channelName][nbOfElem]["author"] = "tononcle";
    save[channelName][nbOfElem]["text"] = msg.id
    save[channelName][nbOfElem]["tags"] = tag;
    json = JSON.stringify(save)
    updateJSON(json,msg);    

    msg.channel.send(" Lien enregistré! ");*/
}

var rmve = (cmdLine,msg) =>{
    var channelName = msg.channel.name;
    var idElem = cmdLine[1]
    var i = 1
    

    for(i = 1; i < cmdLine.length; i++){
        if(save[channelName].hasOwnProperty(cmdLine[i])){
            delete save[channelName][cmdLine[i]]
            json = JSON.stringify(save)
            updateJSON(json,msg)
            msg.channel.send("Element has been deleted ! ");
        }
        else{
            console.log(i)
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


async function beautifulText(Title,content,tag,username){
    if(content.includes("\\")){
        return await new Discord.MessageEmbed()
                .setColor('#5BFF62')
                .setTitle(Title + "| " + content.slice(0, 10) +"...")
                .setURL('https://discord.js.org/')
                .setAuthor(username)
                .addFields(
                    { name: 'Description', value: "None" }
                )
                .setTimestamp()
                .addField('TAG : ', tag, true)
                .setFooter('Some footer text here')
    }
    else{
        var metadata = await msetadata(content);
    
        return await new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle(`ID : ${obj}`+ " " + metadata['title'])
                    .setThumbnail(metadata['image'])
                    .setAuthor(username)
                    .setTimestamp()
                    .addField('TAG : ', tag, true)
                    .setFooter('Some footer text here') 
                    .setURL(metadata['url'])
                    .addFields({ name: 'Description', value: metadata['description'] })
    }
    
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
                                        takeCmd(myMessage.first().content)[1],
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
}

var cmd = (msg) =>{
    msg.channel.send(" All your command have to start by !wikix");
    msg.channel.send(" !xadd [\\text\\] [tag(s)] ");
    msg.channel.send(" !xaddlink [link] [tags]");
    msg.channel.send(" !xrmve id");
    msg.channel.send(" !xfind [tag]");
}


var takeId = (elemId) => {
    return elemId.split(" ")[0];
}

var takeCmd = (command) => {
    return command.split(" ");
}

const digits_only = string => [...string].every(c => '0123456789'.includes(c));

async function findLink(msg,channelName,item){
    var jsonElem= save[channelName];
    var i = 0;
    for(obj in jsonElem){
        if(digits_only(obj) == true){
            if(jsonElem[obj]["tags"].includes(item)){
                i++;
                await msg.channel.messages.fetch({around:jsonElem[obj]["text"],limit:1})
                      .then(message => msg.channel
                                   .send(beautifulText(obj,
                                        takeCmd(message.first().content)[1],
                                        jsonElem[obj]["tags"])))
            }
        }       
    }
    if(i == 0){
        msg.channel.send("Nothing found ! ");
    }
}

bot.login(config.token)