var codechef_username;
if(document.querySelector("#edit-submit") === null || document.querySelector("#edit-submit").value !== "Login"){ // most probably user can be loggedin.
    console.log("A");
    if(document.querySelector(" span.right > a") !== null){
    console.log("B");
        // codechef_username=document.querySelector(" span.right > a").innerText;
        codechef_username=document.querySelectorAll("span.right > a >span");
        codechef_username=codechef_username[codechef_username.length-1].innerText;
}
}
if(document.querySelector("body > header > div > div.l-header__user-block > div > div.l-username > div.l-dropdown-container--username > span")!==null){
    console.log("C");
    // codechef_username=document.querySelector("body > header > div > div.l-header__user-block > div > div.l-username > div.l-dropdown-container--username > span").innerText;
    codechef_username=document.querySelectorAll("body > header > div > div.l-header__user-block > div > div.l-username > div.l-dropdown-container--username > span");
    codechef_username=codechef_username[codechef_username.length-1].innerText;
  }
if(codechef_username !== undefined){
  // var isstar=false;
  // for(var j=0;j<codechef_username.length;j++){
  //   if(codechef_username[j]=='*') {
  //     isstar=true;
  //     break;
  //   }
  // }
  // if(isstar==true){
  //   var len=codechef_username.length;
  //   codechef_username=codechef_username.substr(2,len-2);
  // }
chrome.storage.sync.set({"codechef_username": codechef_username}, function() {
    // console.log('Value is set to ' + value);
  });
chrome.runtime.sendMessage({user_name:codechef_username,"codeforces":false,"codechef":true }, function(response) {
    console.log(response.res);
  });
}