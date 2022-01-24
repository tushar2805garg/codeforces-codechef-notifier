var username=localStorage.getItem("username");
var loggedin=true;
console.log(username);
if(username === null){
   username =document.querySelector("#header > div.lang-chooser > div:nth-child(2) > a:nth-child(1)").innerText;
   loggedin=document.querySelector("#header > div.lang-chooser > div:nth-child(2) > a:nth-child(2)").innerText;
//    console.log(username + "    "+ loggedin);
   if(loggedin === "Register"){
       loggedin =false;
   }
   else{
       loggedin =true;
    localStorage.setItem("username",username);
   }
}
else{
    var curr=document.querySelector("#header > div.lang-chooser > div:nth-child(2) > a:nth-child(1)").innerText;
    loggedin=document.querySelector("#header > div.lang-chooser > div:nth-child(2) > a:nth-child(2)").innerText;
    //   console.log(username + "    "+ loggedin);
   if(loggedin === "Register"){
       loggedin = false;
       localStorage.removeItem("username");
   }
   else if(curr !== username){
       loggedin =true;
       username =curr;
       localStorage.removeItem("username");
       localStorage.setItem("username",username);
   }
   else{
       loggedin =true;
   }
}
console.log(loggedin);
if(loggedin === true){
    chrome.runtime.sendMessage({user_name:username }, function(response) {
        // console.log(response.farewell);
        console.log(response.res);
      });
}