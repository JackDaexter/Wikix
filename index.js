const Discord = require('Discord.js')
const bot = new Discord.Client();
const config = require("./config.json")
const save = require("./save.json")
const fs = require("fs");
const urlMetadata = require('url-metadata')
const { listenerCount } = require('events');
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
        else{
            message.channel.send("Ressource updated ! ")
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
    
    
    var nbOfElem = Object.keys(myJson).length + 1;
    save[channelName]["nbElem"] = nbOfElem;
    save[channelName][nbOfElem] = {}
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
        console.log("error");
        msg.channel.send("Command Error : tag is missing ! ");
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
    
    
    var nbOfElem = Object.keys(myJson).length + 1;
    save[channelName]["nbElem"] = nbOfElem;
    save[channelName][nbOfElem] = {}
    save[channelName][nbOfElem]["author"] = "tononcle";
    save[channelName][nbOfElem]["text"] = msg.id
    save[channelName][nbOfElem]["tags"] = tag;
    json = JSON.stringify(save)
    updateJSON(json,msg);    

    msg.channel.send(" Lien enregistré! ");
}

var rmve = (cmdLine,msg) =>{
    var channelName = msg.channel.name;
    
    if(save[channelName].hasOwnProperty(cmdLine[1])){
        delete save[channelName][idElem]
        json = JSON.stringify(save)
        updateJSON(json,msg)
        msg.channel.send("Element has been deleted ! ");
    }
    else{
        msg.channel.send("Element " + idElem + " not exist...");
    }
}

async function msetadata(desc){
    await urlMetadata('https://www.youtube.com/watch?v=7cJE4xFkSas').then(
        function (metadata) { // success handler
            return metadata;
        },
        function (error) { // failure handler
            console.log(error)
    })
}


function beautifulText(Title,content,tag){
    if(content.includes("\\")){
        return new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(Title + "| " + content.slice(0, 10) +"...")
                .setURL('https://discord.js.org/')
                .addFields(
                    { name: 'Description', value: "None" }
                )
                .setTimestamp()
                .addField('TAG : ', tag, true)
                .setFooter('Some footer text here')
    }
    else{
        var metadata = msetadata(Title);
        return new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(metadata["title"])
                .setURL(metadata['url'])
                .setThumbnail(metadata['image'])
                .addFields(
                    { name: 'Description', value: metadata["description"] }
                )
                .setTimestamp()
                .addField('TAG : ', tag, true)
                .setFooter('Some footer text here')
    }
    
}



/* 
meta["description"],
 meta["title"]
*/

async function list(msg){
    var channelName = msg.channel.name;
    var jsonElem= save[channelName];
    var i = 0;
    var nbOfElem = Object.keys(jsonElem).length
    if(takeCmd(msg.content).length == 1){
        msg.channel.send("Voici la liste de tous les éléments enregistrer dans le channel " +channelName );
        for(obj in jsonElem){
            if(digits_only(obj) == true){
                i++;
                await msg.channel.messages.fetch({around:jsonElem[obj]["text"],limit:1})
                .then(message => msg.channel
                                    .send( beautifulText((i)+"/"+nbOfElem, 
                                                        takeCmd(message.first().content)[1],
                                                        jsonElem[obj]["tags"]
                                                    
                                                        )))
          
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

var findElements = (msg,channelName) => {
    var  i = 0;
    var idToFind = cmdLine[2];
    var jsonElem= save[channelName]["link"]

    for(obj in jsonElem){
        if(idToFind.include(obj)){
            i++;
            msg.channel.messages
                .fetch({around:jsonElem[obj],limit:1})
                .then(message => msg.channel
                                    .send(takeCmd(message.first()
                                        .content)[3]))
        }
    }
    jsonElem = save[channelName]["text"]
    for(obj in jsonElem){
        
        if(idToFind.include(obj)){
            i++;
            msg.channel.messages
                .fetch({around:jsonElem[obj],limit:1})
                .then(message => msg.channel
                                    .send(message.first()
                                        .content.slice(12,message.first().content.length)))
        }
    }
    if(i == 0 ){
        msg.channel.send("Nothing Found !");
    }
    else{
        msg.channel.send(i + "elements Found !");
    }
}

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