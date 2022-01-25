var lastsubmittedid=null;
var username=null;
var problemname=null;
var contestid=null;
var verdict=null;
var passedcount=0;
var lastcontestid=null;
var fulfill=-1;
chrome.storage.sync.get(['username'], function(result) {
    // console.log('Value currently is ' + result.username);
    if(result.username !== undefined){
        username =result.username;
        fetchdetails();
    }
});

chrome.storage.sync.get(['lastcontestid'], function(result) {
    if(result.lastcontestid !== undefined){
        lastcontestid=result.lastcontestid;
        lastcontestid=result.lastcontestid;
    }
fetchratingdetails();
});
setInterval(fetchratingdetails, 300*1000);
function imagename(){
    if(verdict === "OK") return "images/accept.gif";
    else if(verdict === "COMPILATION_ERROR") return "images/compile-error.gif";
    else if(verdict === "RUNTIME_ERROR") return "images/runtime-error.png";
    else if(verdict === "WRONG_ANSWER") return "images/wrong.gif";
    else if(verdict === "TIME_LIMIT_EXCEEDED" || verdict=="IDLENESS_LIMIT_EXCEEDED") return "images/time_limit_exceed.png";
    return "images/runtime-error.gif";
}

function VERDICTNAME(){
        var vname="";
        var sz=verdict.length;
        for(var i=0;i<sz;i++){
            if(verdict[i]=="_") vname+=" ";
            else if(i === 0 || vname[i-1] === " "){
                vname+=verdict[i];
            }
            else{
                vname+=verdict[i].toLowerCase();
            }
        }    
        if(vname === "Ok"){
            vname="Accepted";
        }
        else{
            passedcount++;
          vname =vname+" On Test Case "+ passedcount.toString();
        }
        return vname;
}

function  notification(){
    // console.log(problemname+" "+verdict+" ");
    chrome.notifications.create({
        title: problemname,
        message: VERDICTNAME(),
        iconUrl:imagename() ,
        type: 'basic'
    })
}


function notificationratingupdate(curr,prev){
    var msg="increases";
    if(curr<prev) msg="decreases";
    var change=Math.abs(curr-prev);
    chrome.notifications.create({
        title: "Codeforces Notifier",
        message: "Your rating on Codeforces "+msg+" by "+change+" and current rating becomes "+curr,
        iconUrl:"images/cf.png" ,
        type: 'basic'
    })
}


function fetchratingdetails(){
    // console.log("FETCH RATING DETIALS CALLED!! "+username);
    if(username === null) return;
    var url="https://codeforces.com/api/user.rating?handle="+username;
    fetch(url)
    .then(response => response.json())
    .then(response =>{
        var resultarray=response.result;
        // console.log(resultarray);
        if(resultarray.length === 0){ //  new user ...
            // console.log("LENGTH IS ZERO");
            chrome.storage.sync.set({"lastcontestid": "newuser"}, function() {
                // console.log('Value is set to ' + crid);
                lastcontestid="newuser";
                return;
              });
        }
        else{
           var len=resultarray.length-1;
           var crid=resultarray[len].contestId;
           if(crid === lastcontestid){
            //    console.log("NULL");
               return;
           }
           else if(lastcontestid === null){
            //    console.log(crid);
               lastcontestid = crid;
               chrome.storage.sync.set({"lastcontestid": crid}, function() {
                // console.log('Value is set to ' + crid);
                lastcontestid=crid;
                return;
              });
               return;
           }
           else{
               notificationratingupdate(resultarray[len].newRating,resultarray[len].oldRating);
               chrome.storage.sync.set({"lastcontestid": crid}, function() {
                // console.log('Value is set to ' + crid);
                lastcontestid=crid;
                return;
              });
           }
        }
    })
    .catch(error=>{
        // console.log(error);
    })
}



function fetchdetails(sender){
    if(username === null) return;
    var url="https://codeforces.com/api/user.status?handle="+username+"&from=1&count=1";
    return fetch(url)
    .then(response => response.json())
    .then(response => {
        // handle the response
        // console.log(response);
        var vr=response.result[0].verdict;
        if(vr === undefined || vr=="TESTING"){
            console.log("VERDICT "+username+ " "+  lastsubmittedid + " "+ response.result[0].id);
            setTimeout(fetchdetails,1000,2);
             return;
        }
        var currid=response.result[0].id;
        if(lastsubmittedid === null){
            lastsubmittedid = currid;
            return;
        }
        else if(lastsubmittedid !== currid){
            console.log(lastsubmittedid + "   "+ currid);
            lastsubmittedid =currid;
            problemname = response.result[0].problem.name;
            contestid = response.result[0].problem.contestid;
            verdict= response.result[0].verdict;
            passedcount =response.result[0].passedTestCount;
            notification();
            return;
        }
    })
    .catch(error => {
        // handle the error
        // console.log("LOOKS LIKE CODEFORCES IS DOWN!!");
        // console.log(error);
    });
}


chrome.runtime.onInstalled.addListener(function() {
    // console.log("Background Loader starts!");
}); 



chrome.webRequest.onSendHeaders.addListener((details) => {
    // https://codeforces.com/contest/1628/my

     var str=details.url;
    //  console.log(str);
     var sz=str.length;
     var found=false;
    for(var j=0;j<sz-2;j++){
        var ano=str.substr(j,3);
        if(ano=="/my") {
            found=true;
            break;
        }
    }
     if(found === true){
         console.log("WEB REQUEST FOUND IN MY URL!   ");
        fetchdetails(1);
     }
     
},{
    urls:["http://*.codeforces.com/*","https://*.codeforces.com/*"],
    types:["xmlhttprequest"],
},["requestHeaders"]);


chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        // console.log("Response from content file!!")
    // console.log("CURR->USERNAME "+ request.user_name+ " PREVIOUS->USERNAME "+username);
    if(username !== request.user_name){
    username=request.user_name;
    lastcontestid=null;
    lastsubmittedid=null;
    fetchdetails();
    fetchratingdetails();
    }
    sendResponse({res: "GOT THE RESPONSE!"});
    })
