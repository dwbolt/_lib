import {csvClass    } from '/_lib/db/csv_module.js'     ;

class tableClass {  // tableClass - client-side

/*
similar to a table in sql rdb. working on support for:
 select - returns an array of row numbers that match the selection function passed in
 total -
 group by - in a seperate class for now
 sort - pass an array of indexes to be sorted, and an array of fields to sort on

these features are used in the following appsthis.meta.PK_max
  accounting
  server log
*/


constructor( // tableClass - client-side
url          // directory where table _meta.json, changes.csv, columns.json live
) {  
  if (url != undefined) {
    this.url_set(url);
  }
  this.db      = undefined; 

  // init meta
  this.meta = {
    "fields":{
        "pk" : {"header" : "PK"         , "type" : "pk"     , "location" : "column" }
    }

    ,"select" : ["pk"]
    ,"PK_max" :0
  }

  this.columns = {"pk":{}};
}


set_db( db){this.db   = db;}    // tableClass - client-side
set_name(n){this.name =  n;}    // tableClass - client-side


set_value(  // tableClass - client-side
  pk        // table primary key
  ,field    // field name we want value of
  ,value 
) {
  this.check_pk(pk);

  const meta_field = this.meta.fields[field];
  if (meta_field === undefined) {
    alert(`file="table_module.js"
method="set_value"
field="${field}"`); 
    return;
  }
  switch(meta_field.location) {
    case "column":
      if (this.columns[field] === undefined) {
        this.columns[field] = {}; // init
      }
      this.columns[field][pk] = value;
      break;
      
    default:
      // code block
      alert(`file="table_module.js"
method="set_value" 
meta_field.location="${meta_field.location}"`);
      return;
  }
}


get_value(  // tableClass - client-side
  pk        // table primary key
  ,field    // field name we want value of
) {
  if (pk === null || pk === undefined ) {
    // pk is null or un
    return undefined;
  }
  const meta_field = this.meta.fields[field];
  if (meta_field === undefined) {
    // assume data is stored in column, // not tested well, put in to support csv import
    return this.columns[field][pk];
  }

  switch(meta_field.location) {
    case "column":
      if (this.columns[field]) {
        return this.columns[field][pk];  // still may return undefined
      } else {
        return undefined;
      }
      
    default:
      // code block
      alert(`file="table_module.js"
method="get_value"
meta_field.location=${meta_field.location}`);
  }
}


get_value_relation(  // tableClass - client-side
// returns display value for both relation fields and non-relation fields
pk
,field
) {
  let value = this.get_value(pk,field);
  if (this.meta_get("fields")[field].location === "relation") {
    // value is an array of PK, convert to human readable
    let r_value="";
    for(var i=0; i<value.length; i++){
      let pkr=value[i]; // relation pk
      let relation = this.db.getTable("relations").get_object(pkr);  // get relation object 
      if        (relation.table_1 === this.name && relation.pk_1 === pk) {
        // related to table 2
        r_value += this.format_values(2, relation);
      } else if (relation.table_2 === this.name && relation.pk_2 === pk) {
        // related to table 1
        r_value += this.format_values(1, relation);
      } else {
        // error
        alert(`error file="table_module.js" method="get_value_relation" pk="${pk}" this.name="${this.name}" relationn=${JSON.stringify(relation)}`);
      }
    }
    value = r_value;
  } else {
    value = this.value2string(value);
  }

  return value;
}


value2string(  // tableClass - client-side
  value
){ 
  // value is json
  const type = typeof(value);
  switch (type) {
    case "undefined":
      value = ""; break;
    case "object":
      value = JSON.stringify(value); break;
    case "number":
      value = value.toString();
    case "string":
      break; // no chages need
    default: 
      alert(`file="table_module.js"
method="get_value_relation"
type="${type}"
value="${value}"`);
  }
  return value;
}


format_values( // tableClass - client-side
   table_number  // 
  ,relation
  ){
  let html = "";
  const fields=["label","display","comment"];
  for(var i=0; i<fields.length; i++) {
    let table_name = relation[`table_${table_number}`];
    let pk         = relation[`pk_${table_number}`];
    let table      = this.db.getTable(table_name);
    html += table.get_value(pk,fields[i]) +" - "; 
  }
  return html+"<br>";
}


get_unique_values(// tableClass - client-side
  field_name
){
  alert(`file="table_module.js
method="get_unique_values"
msg="depricated"`)
/*
  if (!this.#json.unique_values            )  {
    // init if needed
    this.#json.unique_values             = {}
  }

  if (!this.#json.unique_values[field_name])  {;
    // build, if it does not exist
    const unique_values = this.#json.unique_values[field_name] = {};
    let pk = this.get_PK();
    // walk entire column/field
    for(var i=0; i<pk.length; i++){
      let value = this.get_value(pk[i],field_name);
      if(value) {
        if(!unique_values[value]) {
          // init
          unique_values[value] = []
        }
        // add pk to list for value
        unique_values[value].push(pk[i]);  // remember pk assocated with value
      }
    }
  }

  // make sure this.#json.unique_values is changed
  return Object.keys(this.#json.unique_values[field_name] );
  */
}



get_unique_pks(// tableClass - client-side
  field_name
  ,value
){
  alert(`file="table_module.js
  method="get_unique_pks"
  msg="depricated"`);
  // return list of pks that have
  //return this.#json.unique_values[field_name][value];
}


add_column_value( // tableClass - client-side
   pk             // primary key
  ,column_name    //
  ,column_value   //
){
  this.check_pk(pk);

  if (this.columns[column_name] === undefined) {
    // add columns_name
    this.columns[column_name] = {};
  }

  this.columns[column_name][pk] = column_value;
}


check_pk(// tableClass - client-side
  pk  // make sure pk is a number
  ){  
  let pk_num = pk;
  if (typeof(pk_num)==="string"){
    pk_num = Number.parseInt(pk_num)
  } else if (typeof(pk_num)!="number") {
alert(`file="table_module"
method="check_pk"
typeof(pk_num)="${typeof(pk_num)}"`);
  return;
  }

  if (this.columns.pk === undefined) {
    // init the primary key column
    this.columns.pk = {}
  }
  
  if (this.columns.pk[pk] === undefined) {
    // new pk, so add it
    this.columns.pk[pk]= pk;
    if (this.meta.PK_max <= pk_num) {
      this.meta.PK_max = pk_num;   // this should always be the case
    } else {
      alert(`file="tabe_module.js
method="check_pk"
pk = "${pk}"
this.meta.PK_max="${this.meta.PK_max}"
this.url_meta="${this.url_meta}"`);
    }
  }
}


set_select(  // tableClass - client-side
field_names  // array of field names
){
  this.meta.select = field_names;

  // set header based on select - seems like this should be in UX module (dwb)
  this.meta.header=[];
  for(var i=0; i<this.meta.select.length; i++) {
    let field_name =  this.meta.select[i];
    this.meta.header.push( this.meta.fields[field_name].header);
  }
}


meta_get(  // tableClass - client-side
  name // meta attribute name
  ){  
  return this.meta[name];
}


get_PK( // tableClass - client-side
) {
  // array of PK keys for entire table;
  if (this.columns.pk === undefined) {
    return []; // table is empty so return empty array
  } else {
    return Object.keys(this.columns.pk);
  }
}


url_set(  // tableClass - client-side
  dir     // root page where table lives
  ){
  this.dir          = dir;
  this.url_meta     = dir+"/_meta.json";
  this.url_columns  = dir+"/columns.json";
  this.url_changes  = dir+"/changes.nsj";   // new line seperated json
}


async load(  // tableClass - client-side
  dir        // location of table to load
  ) { 
  this.url_set(dir);

  // load table meta data
  let msg = await app.proxy.getJSONwithError(this.url_meta);
  if (msg.status === 200){
    this.meta = msg.json;
  } else {
    alert(`file="table_module.js"
method="load"
url="${this.url_meta}"
msg=${JSON.stringify(msg)}`);
    return;
  }

  // load columns
  msg = await app.proxy.getJSONwithError(this.url_columns);
  if (msg.status === 200){
    this.columns = msg.json;
  } else {
    alert(`file="table_module.js"
method="load"
url="${this.url_columns}"
msg=${JSON.stringify(msg)}`);
    return;
  }

  // load and apply change log
  await this.apply_changes();

  this.setHeader();
}



async apply_changes(){ // tableClass - client-side
  // load change file from csv 
  const msg     = await app.proxy.RESTget(this.url_changes);                            
  if (!msg.ok) {
    alert(`error file="table_module.js"
method="apply_changes"
msg="${JSON.stringify(msg)}"`);
    return;  // nothing todo since change file not loaded
  }
  let start =0;
  while(start < msg.value.length) {
    let end = msg.value.indexOf("\n", start);
    let obj = JSON.parse(msg.value.slice(start,end));
    this.set_value(obj[0],obj[1],obj[2]);
    start = end+1;
  }
}

async create(  // tableClass - client-side
  name,      // name of table
  meta_name  // name of structure
  ) {

  // get temple meta of table
  let url       = `/_lib/db/tables_meta/${meta_name}.json`;
  let msg = await app.proxy.RESTget(url);
  if (!msg.ok) {
    alert(`file="table_module.js"
method="create"
url="${url}"
RESTget failed`);
    return;
  }

  // save meta data fro table
  this.meta = JSON.parse(msg.value);                       
  msg = await app.proxy.RESTpost(msg.value, this.url_meta);
  if (!msg.success) {
    alert(`file="table_module.js"
method="create"
this.url_meta="${this.url}"
RESTpost failed`
);
  }

  return msg;
}


get_object( // tableClass - client-side
  id        // primary key of row/object
  ){ 
  // 
  let object = {}, value;
  const select = this.meta.select;  // list of object attributes 

  for(let i=0; i<select.length ;i++){
    const field_name = select[i];
    const field      = this.meta.fields[field_name];
    switch(field.location) {
      case "column":
        // data is in column
        if (this.columns[field_name] === undefined) {
          value = undefined;
        } else {
          value = this.columns[field_name][id];  // maybe undefined
          if ( "string pk json text textarea float integer date-time date".includes(field.type) ) {
             // value is already set, do not want to trigger the alert below
          } else {
            alert(`file="table_module"
method="get_object"
field.type="${field.type}"
field_name="${field_name}"`);
          }
        }
        break;

      default:
        // code block
        alert(`error: class="tableClass" method="get_object" location="${location}"`)
    }

    if (value !== undefined) {
      object[field_name] = value;
    }
  }

  return object;  // json version of row in table
}


get_object_display( // tableClass - client-side
  id        // primary key of row/object
  ){ 
  // 
  let object = {}, value;
  const select = this.meta.select;  // list of object attributes 

  for(let i=0; i<select.length ;i++){
    const field_name = select[i];
    const field      = this.meta.fields[field_name];
    switch(field.location) {
      case "column":
        // data is in column
        if (this.columns[field_name] === undefined) {
          value = undefined;
        } else {
          value = this.columns[field_name][id];  // maybe undefined
          if ( "string pk json text textarea float integer date-time date".includes(field.type) ) {
             // value is already set, do not want to trigger the alert below
          } else {
            alert(`file="table_module"
method="get_object_display"
field.type="${field.type}"
field_name="${field_name}"`);
          }
        }
        break;

      default:
        // code block
        alert(`file="table_module.js"
method="get_object_display"
field.location="${field.location}"`);
    }

    if (value !== undefined) {
      object[field_name] = value;
    } else {
      object[field_name] = "";
    }
  }

  return object;  // json version of row in table
}


PK_get( // tableClass - client-side
  key  // primary key, return row
  ){
    alert(`file="table_module.js"
method="PK_get is depricated"`);
}


// rewwrite to save to change file and memory
async save( // tableClass - client-side
  // make change in memory and update change log
  record            // new record values
  ) {
  if(record.pk === undefined) {
    // adding a new record, so create a new PK
    record.pk = (++this.meta.PK_max).toString();      // get next primary key                           // add it the record being saved
  }

  // get change log for row
  let csv = "",change;
  // see what fields changed for the row
  const fields = this.meta.select;
  const date = new Date();
  for(var i=0; i< fields.length; i++) {
    let field = fields[i];
    let edited_value   = record[field];                    // from edit form
    let current_value  = this.get_value_relation(record.pk,field);  // from table memory - convert to string for compare 
    
    // update change log
    if (this.value2string(edited_value) !== current_value ) {
      // append to  change log
      let csv_value = edited_value;      // convert new line -> /n and quotes -> /""
      if (csv_value === "") {
        csv_value = undefined;  // convert empty fields to undifined
      }
      change = [record.pk, field, csv_value, date.toISOString()]
      csv += `${JSON.stringify(change)}\n`;                          // add /n to make it easier to view in statndard editor

      // update memery row
      if (edited_value===""){
        // convert form value of empty string to undefined
        edited_value = undefined;
      }
      this.set_value(record.pk, field, edited_value);
    }
  }

  // append to change file
  const msg  = await app.proxy.RESTpatch( csv, this.url_changes);
  if (!msg.success) {
    // save did not work
    alert(`
file="table_module.js"
method="save_changes"
url="${this.url_changes}"
msg=${msg.message}`);
  };

  return msg; // was set to new value if null;
  // need to save memory change log to server incase session is lost, so user will not loose there work
  // code here
}


async merge( // tableClass - client-side
dir
){
  if (dir != undefined) {
    this.url_set(dir);
  }
 
  // save column file with changes applied
  let msg  = await app.proxy.RESTpost( JSON.stringify(this.columns), this.url_columns);
  if (!msg.success) {
    // save did not work
    alert(`file="table_module.js" 
method="merge"
this.url_changes="${this.url_changes}"
REST.post failed`);
  return msg;
  };

  // empty change file
  msg  = await app.proxy.RESTpost("", this.url_changes);
  if (!msg.success) {
    // save did not work
    alert(`file="table_module.js"
method="merge"
this.url_changes="${this.url_changes}"
RESTpost failed`);
  };
  
  return msg;
}

async delete(){// tableClass - client-side
  // delete table
  let msg = await app.proxy.RESTdelete(this.dir );
  return msg;
}


get_field( // tableClass - client-side
  i  // index into select array
  ,attribute  // header or type or location..
  ){
  const field_name = this.meta.select[i];
  const value = this.meta.fields[field_name][attribute];
  if (typeof(value) === "string") {
    return value.toLowerCase(); // convert strings to lowercase for easy compare
  } else {
    return value;
  }
  }


 get_column(  // tableClass - client-side
  pk  // primary key
  ,i  // select index into header/select
 ) {
   const column_name  = this.meta.select[i];
   let   column_value = this.columns[column_name][pk];
   if (column_value === undefined) {
    // return empty string if not defin
    column_value = "";
    }
   return column_value;
 }
 

setHeader() {   // tableClass - client-side
  // create header from meta data
  this.meta.header = [];
  const fields           = this.meta.fields;  // point to field meta data
  const select           = this.meta.select;  // array of field names to be displayed
  for(let i=0; i<select.length; i++) {
    let field = fields[select[i]];
    if (field === undefined) {
      alert(`file="table_module.js"
method="setHeader"
select[i] = "${select[i]}"
this.dir="${this.dir}"
msg="select field does not exist in field meta data"`)
    } else {
      this.meta.header.push(field.header); 
    }
    
  }
}


genCSV_header(){  // tableClass - client-side
  let csv = "";
  let header = this.meta_get("header");
  for(let i=0; i<header.length; i++) {
    csv += `,"${header[i]}"`; // export header
  }
  csv = csv.slice(1)+"\n";
  return csv;
}


genCSVrow( // tableClass - client-side
  pk) {
  // will only work for numbers, strings, boolean
  // Will not  work for dates, objects, etc...
  let line = "";
  let fields = this.meta_get("select");
  for(var i=0; i<fields.length; i++){
    let value = this.get_value(pk,fields[i]);
    if(!value){
      value="";   // empty string is value is not defined
    }
    let location = this.meta_get("fields")[fields[i]].location;
    if (location==="relation") {
      // add "[]"" so it only takes up one field location in the csv file
      value = `"[${value}]"`;
    }
    line += `${value},`;
  }
  return  line.slice(0, line.length-1) +"\r\n";     // get rid of trailing comma
}


getColumnFormat(i) { // tableClass - client-side
  alert(`file="table_module.js
method="getColumnFormat"
msg="method deprecated"`);
return false;
  //let f = this.#json.columnFormat[i];
  if (f === undefined) return "";
  return f;
}


//getField()       {return this.meta.field         ;} // tableClass - client-side


/*
change_summary(  // tableClass - client-side
  field
  ){
  const change = this.changes_get("summary");
  if (change[field] === undefined) {
    // first time data is stored so create empty
    change[field] = {count: 0};
  }

  change[field]["count"]++;
}
*/


/*
sortList(  // tableClass - client-side
    a_list     // array of row indexes that need to be sorted
  , a_fields   // array of fields to sort on
) {
  // a_list will be return sorted
  a_list.sort( (a,b)=> {
    // a and b are indexes in table
    const ra = this.#json.rows[a];    // a row from a_table
    const rb = this.#json.rows[b];    // b row from a_table
    const f  = this.#json.field;

    let ret = 0;
    a_fields.forEach((field, i) => {
      let va = ra[f[field]];  // value of field in row a
      let vb = rb[f[field]];  // value of field in row b
      if        ( va < vb ) {
        ret = -1;
        return;
      } else if ( va > vb ) {
        ret =  1;
        return;
      }
    });
    return ret;  // must be equal for all fields in the a_list
  });
}
*/

/*getRows()        {return this.#json.rows          ;} // tableClass - client-side
getRow(index)    {return this.#json.rows[index]   ;} // tableClass - client-side  */
//get_primary_key(){return this.#json.primary_key   ;} // tableClass - client-side

/*
changes_get(key=null) { // tableClass - client-side
  // return change object for record with primary key = key
  if (key === null){
    // return all the changes is a key is not passed in
    return this.#json.changes;
  }

  let changes = this.#json.changes[key];
  if (changes === undefined) {
    // no privous changes to row, so init to empty change object
              this.#json.changes[key] = {};
    changes = this.#json.changes[key];
  } 
  
  return changes;
}
*/
/*
getRowByIndex( // tableClass - client-side
   index // index number 0-> first field in table
  ,value // value of index
  )   {return this.#json.rows[ this.#json.index[index][value] ];} // tableClass - client-side

getRowsLength() {return this.#json.rows.length   ;} // tableClass - client-side
getJSON(      ) {return this.#json               ;} // tableClass - client-side
*/

/*
appendRow(  // tableClass - client-side
  a_row
  ){
  this.#json.rows.push(a_row);  // adding new row
  this.change_summary("append");  // incremnet append count
}
*/

/*
genRows() {  // tableClass - client-side
  // creating text file to save
  let txt="";

  this.#json.rows.forEach((r, i) => {
    // will only work for numbers, strings, boolean
    //  Will not work for dates, objects, etc...
    txt += ","+JSON.stringify(r)+"\n"
  })

  return " "+ txt.slice(1)  // replace leading comma with a space
}*/
/*
clearRows() {this.#json.rows = [];}  // tableClass - client-side
*/

/*
total(  // tableClass - client-side
  col  // integer of column
) {
  // add error checking for non-numbers
  let total = 0;

  // add col rows
  this.#json.rows.forEach((row, i) => {
    total += row[col];
  });

  return total;
}
*/


/*
select(   // tableClass - client-side
  f  // f is boolean function, returns true if we want the row included in the list
) {
  let a=[]  // return a list of indexes of table that match the selection criteria
  let field = this.#json.field;
  this.#json.rows.forEach((r, i) => {
    // need to pass the test into the function, for now hard code
    try {
      if ( f(field, r) ) {
        a.push(i);
      }
    }  catch(err) {
      alert(`tableClass.select error=${err}`)
    }
  });
  return a;
}
*/

/*

filter(  // tableClass - client-side
  f  // f is boolean function, returns true if we want the row included in the list
) {
  return this.#json.rows.filter(f);
}
*/


} //  end  of // tableClass - client-side

export {tableClass};