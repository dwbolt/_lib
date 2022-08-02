/*

class to parse csv file and put into instance of _lib/dbClass/tableClass

would like to also create csv from _lib/dbClass/tableClass

link to spec for CSV (Comma seperated Values)
https://datatracker.ietf.org/doc/html/rfc4180
spec allos CRLF to be in side of quotes - have not tested this

*/

// csvClass: client-side
class csvClass {

// csvClass: client-side
constructor(
  table   // place to put parsed data
) {
//  this.fsp  = require('fs').promises;   // asycn wrapper on fs
  this.csv;                 // cvs file in memory to convert to JSON
  this.rowDebug  = 999;     // can be used to debug
  this.error     = false;   // will be set to true if a parsing error occures
  this.table     = table;   // place to put parsed data
}


// csvClass: client-side
// file -> file in memory to be parseHeader
// DOMid  -> (optional) place to put status of current row being parsed
parseCSV(
   file    // buffer to parser
  ,DOMid   // place to put status of parser
  ,header=false  // if not passed, assume first row is header
) {
  // init class variables
  this.json = {};           // will be the JSON object we write to file
  this.json.fields="";      // build initial json field list
  this.json.len = [];       // this.json.len[36] returns an array of all rows that had 36 fields in it.  All rows should contain the same lenght

  this.rowStart   = 0;        // pointer to where we are parsing
  this.valuesPerRow  ;        // expected values in each row, set in parseHeader()
  this.valueStart = 0;        // start of valueStart
  this.row        = 0;        // row of csv file we have completed parsing
  this.rowEnd     = false;
  this.delimiter  = ',';      // assume our delimter is a Comma
  this.quote      = '"';      // assume strings with quotes, comma's or crlf are quoted with double quotes
  this.DOM     = document.getElementById(DOMid);

  this.csv = file;

  if (header) {
    // assume header passed in
    this.table.setHeader( header);
  } else {
    // assume first row is header
    this.table.setHeader( this.parseRow() );
  }


  // now loop and put every thing else in json.rows
  while ( this.valueStart < this.csv.length) {
    // now add all the data
    this.table.appendRow( this.parseRow() );
    if (typeof(this.DOM) === "object") {
      // if DOMid was passed in, let user know status of parse
      this.DOM.innerHTML = this.row+"parsed";
    }
  }
}


// csvClass: client-side
parseHeader() {
  // the lenght of the hearder row, set the expected lenght of the remaining rows
  const a = [];   // returns this array with each element one field in the array
  while (!this.rowEnd) {
    a.push( this.parseValue() );
  }
  this.valuesPerRow = a.length;
  this.rowEnd = false;
  return a;
}


// csvClass: client-side
parseRow() {
  const a = [];   // returns this array with each element one field in the array

  while (!this.rowEnd) {
    a.push( this.parseValue() );
    if (this.rowEnd) {
      if        (a.length < this.valuesPerRow) {
        this.error(`error on row ${this.row} short, column=${a.length}, expected ${this.valuesPerRow} `);
      } else if (a.length > this.valuesPerRow) {
        this.error(`error on row ${this.row} long , column=${a.length}, expected ${this.valuesPerRow}`);
      }
    }
  }

  this.column=0;
  this.rowEnd = false;
  this.row++;
  return a;
}

// csvClass: client-side
error(message){
    this.error = true;
    this.DOM.innerHTML += message +"<br/>";
}

// csvClass: client-side
parseValue() {
  if      (this.csv[this.valueStart] === this.delimiter
      ||   this.csv[this.valueStart] === "\n"
      ||  (this.csv[this.valueStart] === "\r" && this.csv[this.valueStart+1] === "\n" ) ) {
    // /r/n -> parseNull
    // /n   -> parseNull
    // ,,  -> null
    if (this.csv[this.valueStart] === "\r" && this.csv[this.valueStart+1] === "\n" ) {
      this.valueStart++;  // take out "\r"
    }
    return this.parseNull();
  } else if (this.csv[this.valueStart] === this.quote ) {
//    ," this is Knoxville,TN",     -> string " this is Knoxville,TN"
//    ," this is an escaped quote"""  -> string ' this is an escaped quote"'
    return this.parseQuote();
  } else {
  //  ,1,  -> number 1
  //  , hello ,  -> string " hello "
    return this.parse();
  }
}


// csvClass: client-side
parseQuote(){
  // find the end of the quote   "            ",
  let e1 = this.csv.indexOf('",', this.valueStart+1);   // was +2
  let e2 = this.csv.indexOf('"\r', this.valueStart+1);  // was +2
  let e=Math.min(e1,e2);
  if (e<0) {e=Math.max(e1,e2);} // one e1 or e2 not found so use max
  let v = this.csv.slice( this.valueStart+1, e );
  if (e === e2) {
    // at end of row
    this.rowEnd = true;
  }
  if ( this.rowEnd = true && this.csv[e+2] === "\n") {
    // row ends with /r/n
    this.valueStart = e+3;
  } else {
    // row ends with /r
    this.valueStart = e+2;
  }

  return(v); // return string value in array
}


// csvClass: client-side
parse(){
  // find the end of the value, may come at next delimiter or end of line  \r\n or \n
  let ed=this.csv.indexOf(this.delimiter, this.valueStart);
  let en=this.csv.indexOf('\n'          , this.valueStart);
  let e=Math.min(ed,en);
  let newValueStart,v;

  if (e<0) {
    // did not find delimiter or did not find \n, try using max
    e=Math.max(ed,en);
  }
  if (e<0) {
    // at end of file with out end of row delimter
    e=this.csv.length;
  }

  if (e === en && this.csv[e-1] === '\r') {
    // end of line was a \r\n,  get ride of \r
    v = this.csv.slice( this.valueStart, e-1 )
  } else {
    v = this.csv.slice( this.valueStart, e )
  }

  this.testEndRow(e);
  if (isNaN(v)) {
    return(v); // return string value in array
  } else {
    return( parseFloat(v) ) // return number value
  }
}


// csvClass: client-side
parseNull() {
  this.testEndRow(this.valueStart);
  return (null);
}


// csvClass: client-side
testEndRow(e) {
  if (this.csv[e] === "\n"  || this.csv.length === e) {
    this.rowEnd = true;
  }
  this.valueStart = e+1;
}

// csvClass: client-side
exportCSV() {
  //
 const rows = this.table.getRows();


}


// csvClass: client-side
} // end of class





/*
// csvClass: client-side
genJSON() {
  let rows = this.genRows();
  return `{
"fieldA": ${JSON.stringify(app.csv.json.header[0])}

,"header": ${JSON.stringify(app.csv.json.header[0])}

,"rows": [
${rows}
]
}`;

}
*/


/*
// appClass to show csv class
// create a json row to display/save
genRows() {
  let txt="";

  this.json.rows.forEach((r, i) => {
    txt += ","+JSON.stringify(r)+"\n"
  })
  return txt.slice(1);
}
*/
