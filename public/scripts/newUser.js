var no = "";
//TODO: insert globalVars file. Create function with an ID param that updates the idArray. Call this function from within newUser.html
const gVars = require('./globalVars');
function(var newID){
  gVars.idArray.append(newID)
}
