var username=null;
   username =document.querySelector("#header > div.lang-chooser > div:nth-child(2) > a:nth-child(1)").innerText;
   loggedin=document.querySelector("#header > div.lang-chooser > div:nth-child(2) > a:nth-child(2)").innerText;
   console.log(username + "    "+ loggedin);
   if(loggedin === "Register"){
       loggedin =false;
       username=null;
       username=null;
       chrome.storage.sync.set({"lastcontestid": null}, function() {
        console.log('Value is set to ' + lastcontestid);
      });
   }
   chrome.storage.sync.set({"username": username}, function() {
    console.log('Value is set to ' + value);
  });
    chrome.runtime.sendMessage({user_name:username,"codeforces":true,"codechef":false }, function(response) {
        // console.log(response.farewell);
        console.log(response.res);
      });

    