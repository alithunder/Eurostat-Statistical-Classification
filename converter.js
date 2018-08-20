const convert = require("xml-js");
let f = require('fs');
const fileSystemPackage = require("fs").readFileSync("file.xml", "utf8");
const options = { ignoreComment: true, alwaysArray: true };
const result = convert.xml2json(fileSystemPackage, options);
const json = JSON.parse(result);



const elements = json.elements[1].elements;
elements.forEach(el => {
    console.log(el);

});
f.writeFile('output.json',elements,'utf8',(err)=>{
    if(err) {
        console.log('error');
    } else {
        console.log('file created...')
    }
});