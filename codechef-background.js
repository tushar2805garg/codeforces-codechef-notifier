var codechef_username=null;
var codechef_last_submitted_id=null;
var codechef_last_contest_name=null;
function set_and_fetch_codechef(){
    // Chrome storage to fetch data starts..
    chrome.storage.sync.get(['codechef_username'], function(result) {
        if(result.codechef_username !== undefined){
           codechef_username =result.codechef_username;
        }
    });
    chrome.storage.sync.get(['codechef_last_contest_name'], function(result) {
        if(result.codechef_username !== undefined){
            codechef_last_contest_name =result.codechef_last_contest_name;
        }
    });
   setTimeout(fetchcodechefscrape,3000,1);
}
chrome.runtime.onInstalled.addListener(function() {
    console.log("Background Loader starts from codechef!");
});

function fetch_upcoming_contest_codechef(){
var url="https://kontests.net/api/v1/code_chef";
fetch(url)
.then(response => response.json() )
.then(response =>{
        for( var j=0;j<response.length;j++){
            var upcmng =response[j];
        if(upcmng.in_24_hours === "Yes"){
            var ctname=upcmng.name;
            if(ctname !== codechef_last_contest_name){
            var starttime=upcmng.start_time;
            starttime=starttime.substr(11,5);
            starttime=converttominute(starttime,1);
            var crtime=converttominute(getTime(),0);
            var dfinmin=starttime-crtime;
            console.log(dfinmin);
            if(dfinmin <= 60 && dfinmin>=0){
                chrome.storage.sync.set({"codechef_last_contest_name": ctname}, function() {
                    console.log('Value is set to ' + ctname);
                  });
              codechef_last_contest_name=ctname;
              var message = "Contest on codechef starts within "+dfinmin+ " mins";
              notification_for_all("CF-CC Notifier",message,"images/cc-logo.png");
            }
        }
    }
    }
})
.catch(errors=>{
console.log(errors);
})
}


function fetchcodechefscrape(start){
    if(codechef_username === null){
        console.log("CODECHEF USERNAME IS NULL!!");
        return;
    }
    fetch("https://codechef-api-latest-submission.herokuapp.com/api1/"+codechef_username,{
        headers:{
            "mode":"cors",
            "Access-Control-Allow-Origin": "*"
        }
    })
    .then(response => response.json())
    .then(response=>{
        var problemname=response[0].name;
        var verdict =response[0].verdict;
        var currentid=response[0].sid;
        console.log({problemname,verdict});
        if(start==1){
              codechef_last_submitted_id = currentid;
        }
        else{
        if(codechef_last_submitted_id === currentid){
            fetchcodechefscrape(0);
            return;
        }
        codechef_last_submitted_id = currentid;
        notification_for_all(problemname,verdict,imagename(verdict));
        }
        console.log(codechef_last_submitted_id);
    })
}

chrome.webRequest.onSendHeaders.addListener((details) => {
    // https://codeforces.com/contest/1628/my
     console.log(details+" FROM CODECHEF");
     var str=details.url;
     var sz=str.length;
    //  https://www.codechef.com/error_status_table
    var codechef=str.substr(0,43);
    console.log(codechef);
    if(codechef === "https://www.codechef.com/error_status_table"){
            console.log("CODECHEF CALLED");
            console.log(codechef_username);
            fetchcodechefscrape(0);
        }
},{
    urls:["http://*.codechef.com/*","https://*.codechef.com/*"],
    types:["xmlhttprequest"],
},["requestHeaders"]);
set_and_fetch_codechef();
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log("CODECHEF "+request.user_name);
    if(codechef_username !== request.user_name && request.codechef === true){
    codechef_username=request.user_name;
    }
    sendResponse({res: "GOT THE RESPONSE!"});
    })


    