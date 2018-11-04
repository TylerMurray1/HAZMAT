var no = "";
//TODO: insert globalVars file. Create function with an ID param that updates the idArray. Call this function from within newUser.html
//const gVars = require('./globalVars');//require not supported on front end
function addNewUser(newID){
  console.log(newID)
  idArray.append(newID)//TODO figure out how to access idArray from within globalVars.js
}
