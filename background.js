var lastsubmittedid=null;
var username=null;
var problemname=null;
var contestid=null;
var verdict=null;
var passedcount=0;


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


function fetchdetails(){
    if(username === null) return;
    var url="https://codeforces.com/api/user.status?handle="+username+"&from=1&count=1";
    return fetch(url)
    .then(response => response.json())
    .then(response => {
        // handle the response
        console.log(response);
        var vr=response.result[0].verdict;
        if(vr === undefined || vr=="TESTING"){
            setTimeout(fetchdetails,1000);
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
        console.log("LOOKS LIKE CODEFORCES IS DOWN!!");
        console.log(error);
    });
}


chrome.runtime.onInstalled.addListener(function() {
    console.log("Background Loader starts!");
}); 


function  notification(){
    console.log(problemname+" "+verdict+" ");
    chrome.notifications.create({
        title: problemname,
        message: VERDICTNAME(),
        iconUrl:imagename() ,
        type: 'basic'
    })
}



chrome.webRequest.onBeforeSendHeaders.addListener((details) => {
    // https://codeforces.com/contest/1628/my

     var str=details.url;
     console.log(str);
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
        fetchdetails();
     }
     
},{
    urls:["http://*.codeforces.com/*","https://*.codeforces.com/*"],
    types:["xmlhttprequest"],
},["requestHeaders"]);


chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log("Response from content file!!")
    console.log("CURR->USERNAME "+ request.user_name+ " PREVIOUS->USERNAME "+username);
    if(username !== request.user_name){
    username=request.user_name;
    fetchdetails();
    }
    sendResponse({res: "GOT THE RESPONSE!"});
    })
