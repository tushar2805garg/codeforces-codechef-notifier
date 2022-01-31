var lastsubmittedid=null;
var username=null;
var problemname=null;
var contestid=null;
var verdict=null;
var passedcount=0;
var lastcontestid=null;
var fulfill=-1;
var lastcontestname=null;
function setandfetch(){
// Chrome storage to fetch data starts..
chrome.storage.sync.get(['username'], function(result) {
    console.log("A");
    if(result.username !== undefined){
        username =result.username;
        fetchdetails();
    }
});
// console.log(username);
chrome.storage.sync.get(['lastcontestid'], function(result) {
    console.log("B");
    if(result.lastcontestid !== undefined){
        lastcontestid=result.lastcontestid;
    }
});
// console.log(lastcontestid);

chrome.storage.sync.get(['lastcontestname'], function(result) {
    console.log("C");
    if(result.lastcontestname !== undefined){
        lastcontestname=result.lastcontestname;
    }
});
// console.log(lastcontestname);
// Chrome storage to fetch data ends..
// Set interval starts
}
function print(){
    console.log(username);
}
function setandfetch2(){
fetchratingdetails();
setInterval(fetchratingdetails, 100*1000);
fetchupcomingcontest();
setInterval(fetchupcomingcontest, 600*1000);
}
// Set interval ends
// Convert time to minutes start..

function converttominute(str,c){
    var ans=0;
    ans=( Number(str[0]-'0')*10+ Number(str[1]-'0'))*60+ Number(str[3])*10+Number(str[4]);
    if(c === 1){
        ans=ans+330;
    }
    return ans;
}

// Convert time to minute ends..
// Get time starts 
function getTime() {
    var now     = new Date(); 
    var hour    = now.getHours();
    var minute  = now.getMinutes(); 
    if(hour.toString().length == 1) {
         hour = '0'+hour;
    }
    if(minute.toString().length == 1) {
         minute = '0'+minute;
    }
    var dateTime =hour+':'+minute;   
    return dateTime;
}
// Get time ends

// fetch image name starts
function imagename(){
    if(verdict === "OK") return "images/accept.gif";
    else if(verdict === "COMPILATION_ERROR") return "images/compile-error.gif";
    else if(verdict === "RUNTIME_ERROR") return "images/runtime-error.png";
    else if(verdict === "WRONG_ANSWER") return "images/wrong.gif";
    else if((verdict === "TIME_LIMIT_EXCEEDED") || ( verdict=="IDLENESS_LIMIT_EXCEEDED")) return "images/time_limit_exceed.png";
    return "images/runtime-error.gif";
}
// fetch image name ends
// fetch verdict name starts
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

// fetch verdict name ends..

// Notification starts...
function  notification_for_all(TITLE,MESSAGE,PIC){
    
    chrome.notifications.create({
        title: TITLE,
        message: MESSAGE,
        iconUrl:PIC ,
        type: 'basic'
    })
}
function  notification_problem_solve(){
    notification_for_all(problemname,VERDICTNAME(),imagename());
}


function notification_rating_update(curr,prev){
    var msg="increases";
    if(curr<prev) msg="decreases";
    var change=Math.abs(curr-prev);
    var message="Your rating on Codeforces "+msg+" by "+change+" and current rating becomes "+curr;
    notification_for_all("Codeforces Notifier",message,"images/cf.png");
}


// Notificatons ends..

// Fetching API's starts...

function fetchupcomingcontest(){
    console.log("HERE");
var url="https://kontests.net/api/v1/codeforces";
fetch(url)
.then(response => response.json() )
.then(response =>{
    if(response.length !== 0){
        var upcmng=response[0];
        if(upcmng.in_24_hours === "Yes"){
            var ctname=upcmng.name;
            if(ctname !== lastcontestname){
            var starttime=upcmng.start_time;
            starttime=starttime.substr(11,5);
            starttime=converttominute(starttime,1);
            var crtime=converttominute(getTime(),0);
            var dfinmin=starttime-crtime;
            console.log(dfinmin);
            if(dfinmin <= 60 && dfinmin>=0){
                chrome.storage.sync.set({"lastcontestname": ctname}, function() {
                    console.log('Value is set to ' + ctname);
                  });
              lastcontestname=ctname;
              var message = "Contest on codeforces starts within "+dfinmin+ " mins";
              notification_for_all("Codeforces Notifier",message,"images/cf.png");
            }
        }
    }
    }
})
.catch(errors=>{
console.log(errors);
})
}


function fetchratingdetails(){
    console.log("FETCHRATING");
    console.log(username);
    if(username === null) return;
    var url="https://codeforces.com/api/user.rating?handle="+username;
    fetch(url)
    .then(response => response.json())
    .then(response =>{
        var resultarray=response.result;
       
        if(resultarray.length === 0){ //  new user ...
           console.log("LENGTH 0");
            chrome.storage.sync.set({"lastcontestid": "newuser"}, function() {
       
                lastcontestid="newuser";
                return;
              });
        }
        else{
           var len=resultarray.length-1;
           var crid=resultarray[len].contestId;
           if(crid === lastcontestid){
               console.log("LAST SAME");
                      return;
           }
           else if(lastcontestid === null){
               console.log("LAST NULL")
               lastcontestid = crid;
               chrome.storage.sync.set({"lastcontestid": crid}, function() {
       
                lastcontestid=crid;
                return;
              });
               return;
           }
           else{
               console.log("CALLED");
               notification_rating_update(resultarray[len].newRating,resultarray[len].oldRating);
               chrome.storage.sync.set({"lastcontestid": crid}, function() {
                lastcontestid=crid;
                return;
              });
           }
        }
    })
    .catch(error=>{
    
    })
}



function fetchdetails(sender){
    if(username === null) return;
    var url="https://codeforces.com/api/user.status?handle="+username+"&from=1&count=1";
    return fetch(url)
    .then(response => response.json())
    .then(response => {
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
            notification_problem_solve();
            return;
        }
    })
    .catch(error => {
        
    });
}


// FETCHING API ENDS..

chrome.runtime.onInstalled.addListener(function() {
    console.log("Background Loader starts!");
}); 


// Listen headers request starts..

chrome.webRequest.onSendHeaders.addListener((details) => {
    // https://codeforces.com/contest/1628/my

     var str=details.url;
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
         fetchdetails(1);
         fetchdetails(1);
         fetchdetails(1);
     }
     
},{
    urls:["http://*.codeforces.com/*","https://*.codeforces.com/*"],
    types:["xmlhttprequest"],
},["requestHeaders"]);

// Listen header request ends..

// On message listner starts..


// call set and fetch fn
setandfetch();
setTimeout(print,1000);
setTimeout(setandfetch2,2000);
// ends calling.

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
    if(username !== request.user_name){
    username=request.user_name;
    lastcontestid=null;
    lastsubmittedid=null;
    fetchdetails();
    fetchratingdetails();
    }
    sendResponse({res: "GOT THE RESPONSE!"});
    })
// On message listner ends ...