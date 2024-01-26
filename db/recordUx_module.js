class recordUxClass { // recordUxClass - client-side

  //////////////////////////////////////////////////////
  /*

  User Experince for things that have can have table display.

  */

#primary_key_value  // can these be moved from tableUxClass


constructor( // recordUxClass - client-side
   tableUX       // where table will be displayed
) {
  this.tableUX    = tableUX;                       
  this.globalName = tableUX.globalName + ".recordUX";
}


show(  // client side recordUxClass - for a page
  pk // primary key to show
){
  if (!(pk === undefined)) {
    // user clicked on elemnt, remember primary key for other record methodes
    this.#primary_key_value = pk; 
  }

  // recordShow Fields
  const table   = this.tableUX.getModel()  // get tableClass being displayed
  let      html = `<b>Table:</b>  ${this.tableUX.tableName}&nbsp <b>PK:</b> ${this.#primary_key_value}<br><table>`;
  const  select = table.meta_get("select");
  const  fields = table.meta_get("fields");
  let rowValue;
  for(var i=0; i<select.length; i++) {
    rowValue = table.get_value_relation(this.#primary_key_value, select[i]);
    if (fields[select[i]].type === "textarea") {
      rowValue = `<textarea>${rowValue}</textarea>$`
    }
    html += `<tr><td>${i+1}</td> <td>${fields[select[i]].header}</td> <td>${rowValue}</td></tr>`
  }

  // show relations
  const table_relation = app.spa.relation_index[this.tableUX.tableName]; // all relations attached to table
  let relation;
  if (table_relation != undefined) {
    relation = table_relation[this.#primary_key_value];  // all the relations connenting displayed object to other objects
  }

  if (relation != undefined) {
    html += `<tr><td></td> <td><b>--- Relations ---</b></td> <td></td></tr>`
    // there are relations to display
    const tables = Object.keys(relation);  // array of tables that object is related to
    // walk the tables
    for(i=0; i<tables.length; i++) {
      let table     = tables[i];
      let relations = relation[table];
      let pks_table = Object.keys(relations);
      
      // walk the links
      html += `<tr><td></td> <td><b>${table}</b></td> <td></td></tr>`
      for (let ii=0; ii<pks_table.length; ii++) {
          let pk          = pks_table[ii];
          let record      = app.spa.db.tables[table].get_object(pk);
          let pk_relation = relation[table][pk];
          html += this.relation_display(ii+1,record,table,pk_relation);
      }
    }
  }

  
  html += "</table>"
  let dom = document.getElementById(this.tableUX.DOMid + "_record_data")
  dom.innerHTML = html;
  dom.display = "block";

  // show buttons
  this.buttonsShow("New Duplicate Edit Delete Relation-T1 Relation-T2 Clear");

  // show relations
  // need to set filters to only things connected to record
  //app.spa.display_relations("tableUXRelations");
}

relation_display( // client side recordUxClass - for a page
  i             // count 
  ,record       // object
  ,table_name   // table
  ,pk_relation  
){
  const relation = app.spa.db.getTable("relations").get_object(pk_relation);
  switch (table_name) {
    case "phone":
      return `<tr><td>${i}</td> <td>${record.label}</td> <td>${record.display}</td></tr>`
      
    case "people":
      return `<tr><td>${i}</td> <td>${record.name_last},${record.name_first}</td> <td>${relation.direction} ${relation.relation}</td></tr>`  

    default:
      return `<tr><td>${i}</td> <td>${JSON.stringify(record)}</td> <td>${relation.direction} ${relation.relation} - default case</td></tr>`  
  }

}


buttonsShow( // client side recordUxClass - for a page
  // "New Add  Edit Duplicate Delete Save  Cancel"
  s_values   // walk through id=Buttons and show all in the list   
){  // client side recordUxClass - for a page
  let button = document.getElementById(this.tableUX.DOMid + "_record_buttons").firstElementChild;
  while(button) {
    button.hidden = (s_values.includes(button.value) ? 
      false  // show button
    : true  )// hide button
    button = button.nextSibling;
  }
}

form_create( // client side recordUxClass - for a page
  dom // id 
  ,fields_meta
  ,fields_list
){
  let html = ``;
  for(let i=0; i<fields_list.length; i++) {
      html += this.form_add(dom, fields_meta, fields_list[i]);
  }
  document.getElementById(dom).innerHTML = html;
}

form_add( // client side recordUxClass - for a page
  dom
  ,fields_meta
  ,field_name
){
  const field=fields_meta[field_name]
  switch (field.type) {
  case "pk"      : return `${field.header} <input    id="${dom}_${field_name}" type="text" readonly>    <br>`;
  case "json"    :
  case "text"    : return `${field.header} <input    id="${dom}_${field_name}" type="text">    <br>`;
  case "textarea": return `${field.header} <textarea id="${dom}_${field_name}"></textarea>     <br>`;
  case "integer" : return `${field.header} <input    id="${dom}_${field_name}" type="number" onfocusout="app.integer_validate(this)">  <br>`;
  case "float"   : return `${field.header} <input    id="${dom}_${field_name}" type="number" onfocusout="app.float_validate(  this)">  <br>`;
  case "date"    : return `${field.header} <input    id="${dom}_${field_name}" type="date">    <br>`;
  case "date-time": return `${field.header}<input    id="${dom}_${field_name}" type="date"> <input id="${dom}_${field_name}_time" type="time"> <br>`;
  case "boolean" : return `${field.header} <input    id="${dom}_${field_name}" type="checkbox"><br>`;

  default        : alert(`file="recordUx_module.js"
method="form_add"
field.type="${field.type}"
field_name="${field_name}"
case not handled
  `);
  }
}


form_write(  // client side recordUxClass - for a page
    obj
    ,dom // id 
    ,fields_meta
    ,fields_list
){
    for(let i=0; i<fields_list.length; i++) {
        let field_name = fields_list[i];
        let value = obj[field_name];
        let type = fields_meta[field_name].type;
        
        if (value!==undefined) {
        switch (type) {
        case "pk"      :
        case "float"   :
        case "integer" : 
        case "text"    :
        case "textarea": document.getElementById(`${dom}_${field_name}`).value        =  value                                 ; break;
        case "boolean" : document.getElementById(`${dom}_${field_name}`).checked      =  value                                 ; break;
        case "date"    : document.getElementById(`${dom}_${field_name}`).valueAsDate  =  new Date(value[0],value[1]-1,value[2]); break;
        case "date-time": document.getElementById(`${dom}_${field_name}`).valueAsDate =  new Date(value[0],value[1]-1,value[2]); 
                          document.getElementById(`${dom}_${field_name}_time`).value  =  
                                               `${app.format.padZero(value[3],2)}:${app.format.padZero(value[4],2)}`           ; break;
        default        : alert(`file="recordUx_module.js"
method="form_write"
type="${type}"
field_name=${field_name}`);
        }}
    }
}


edit(){ // client side recordUxClass - for a page
  const table      = this.tableUX.getModel();
  const dom        = `${this.tableUX.DOMid}_record_data`;
  const fields     = table.meta_get("fields");
  const field_list = table.meta_get("select");

  this.form_create(          dom, fields, field_list) ;  // create empty form
  const obj = table.get_object(this.#primary_key_value)  ;  // get object from table
  this.form_write(obj,       dom, fields, field_list );  // load form with values

  if (this.#primary_key_value  === undefined ) {
    this.buttonsShow("Add Cancel");  // adding new record
  } else {
    this.buttonsShow("Save Cancel"); // edit record
  }
}

/*
edit(  // client side dbUXClass
 //    this.#primary_key_value === null -> edit new record
){// client side recordUxClass - for a page
  let html = "<table>";
  const table  = this.tableUX.getModel();  // get tableClass being displayed
  const select = table.meta_get("select"); // array of fields to work with
  const fields = table.meta_get("fields");
  let multi_value,location,type,field,value,readonly;

  for(var i=0; i<select.length; i++) {
    // walk the fields and creat edit html
    field    = select[i];
    location = table.get_field(i,"location");
    type     = table.get_field(i,"type");
    value    = table.get_value_relation(this.#primary_key_value,field);
    switch(location) {
      case "relation":
        // multi value
        //let multi = table.get_value(this.#primary_key_value, field);   // get array of edes
       // html += `<tr><td>${fields[field].header}</td> 
       //          <td>${table.get_value_relation(this.#primary_key_value,field)}</td></tr>`;
        break;
      default:
        // single value- column or row
        if (type === "pk") {
          // do not allow editing of primary key
          readonly = "readonly";
        } else {
          readonly = "";
        }
        /*
        if (this.#primary_key_value === undefined) {
          value = "";  // new record, no previous value
        } else {
          value = table.get_value(this.#primary_key_value,field);
          if (!value) {
            // undifined, null
            value = "";
          }
        }
    }
    let input = `<input ${readonly} id='edit-${i}' type='text' value='${value}'>`
    if (type==="text"){
      input = `<textarea id='edit-${i}' rows="11" cols="50" style="border-radius: 5px;">${value}</textarea>`;
    } 
    html += `<tr><td>${fields[field].header}</td> <td>${input} ${readonly}</td></tr>`
  }

  html += "</table>";
  document.getElementById(this.tableUX.DOMid + "_record_data").innerHTML = html;
  if (this.#primary_key_value  === undefined ) {
    this.buttonsShow("Add Cancel");  // adding new record
  } else {
    this.buttonsShow("Save Cancel"); // edit record
  }
}
*/

async save( // client side recordUxClass - for a page
) {
  // user clicked save or add record
  // save to change file
  const table  = this.tableUX.getModel();  // get tableClass being displayed

  // create object from edit form
  //const select = table.meta_get("select");  // get array of fields to work with
  const obj    = this.form_read(table);          // move data from form to obj
  /*let field_name;
  for(var i=0; i<select.length; i++) {
    // walk the form 
    field_name      = select[i];
    let edit = document.getElementById(`edit-${i}`); 
//    if (edit && 0<edit.value.length) {
    if (edit) {
      obj[field_name] = edit.value;
    }
  }*/

  // value of this.#primary_key_value determines add or update
  const prior_key = this.#primary_key_value;
  this.#primary_key_value = await table.save(obj); 
  if (prior_key != this.#primary_key_value) {
    // added a new record, update tableUX PK list
    this.tableUX.display(); // will update pk display list
  } else {
    this.tableUX.displayData()
  }
  this.show();          // display record with new data
}


form_read( /////
    table
){
  const obj         = {};
  const dom         = `${this.tableUX.DOMid}_record_data`;
  const fields_list = table.meta_get("select");
  const fields_meta = table.meta_get("fields");

  for(let i=0; i<fields_list.length; i++) {
      let field_name = fields_list[i]
      obj[fields_list[i]] = this.form_value(`${dom}_${field_name}`, fields_meta, field_name);
      if (obj[fields_list[i]] === undefined){
          delete obj[fields_list[i]];  // do not save undevined attributes
      }
  }

  return obj;
}


form_value( // client side recordUxClass
  dom // id 
  ,fields_meta
  ,fields_name
){
  let date,time,value;
  const field = fields_meta[fields_name];
  switch (field.type) {
  case "pk":
  case "float":
  case "integer" :
  case "text"    :
  case "textarea": value = document.getElementById(`${dom}`).value; break;
  case "date"    : 
      date = document.getElementById(`${dom}`).value.split("-");
      if (date[0] === "" && date.length === 1) {
          value = "";
      } else {
          value = [parseInt(date[0]), parseInt(date[1]), parseInt(date[2]) ];
      }
      break;

  case "date-time"    : 
      date = document.getElementById(`${dom}`).value.split("-");
      time = document.getElementById(`${dom}_time`).value.split(":");
      if (date[0] === "" && date.length === 1 && time[0] === "" && time.length === 1) {
          value = "";
      } else {
          value = [ parseInt(date[0]), parseInt(date[1]), parseInt(date[2]), parseInt(time[0]), parseInt(time[1])];
      }
      break;
  case "json"    : 
    value = document.getElementById(`${dom}`).value;
    if (!value === "") {
      value = JSON.parse(value);
    }
     break;
  case "boolean" : value = document.getElementById(`${dom}`).checked          ; break;
  default        : alert(`file="recordUX_module.js"
methed="form_value"
field.type="${field.type}"
fields_name="${fields_name}"
case not handled`);
  }

  if (value === "" ) {
    return undefined;
  } else {
    return value;
  }
}


new(){// client side recordUxClass - for a page
  this.#primary_key_value = undefined;   // will cause edit to create new record on this.save()
  this.edit();
}


createUX(){ // client side recordUxClass - for a page
  const dom = document.getElementById(this.tableUX.DOMid + "_record");
  if(0<dom.innerHTML.length) {
    // allready created, no work todo
    return;
  }
    // first time UX is used, so make space for data, and add buttons
  dom.innerHTML = `<div id='${this.tableUX.DOMid}_record_data'></div>
  <div id='${this.tableUX.DOMid}_record_buttons'> 
  <input hidden type='button' value='New'       onclick="${this.globalName}.new()">
  <input hidden type='button' value='Add'       onclick="${this.globalName}.save()">
  <input hidden type='button' value='Duplicate' onclick="${this.globalName}.duplicate()">
  &nbsp - &nbsp
  <input hidden type='button' value='Edit'      onclick="${this.globalName}.edit()"> 
  <input hidden type='button' value='Delete'    onclick="${this.globalName}.delete()"> 
  <input hidden type='button' value='Save'      onclick="${this.globalName}.save()">
  &nbsp - &nbsp
  <input hidden type='button' value='Relation-T1'  onclick="app.spa.copy2record('1')">
  <input hidden type='button' value='Relation-T2'  onclick="app.spa.copy2record('2')">
  &nbsp - &nbsp
  <input hidden type='button' value='Clear'     onclick="${this.globalName}.clear()">
  <input hidden type='button' value='Cancel'    onclick="${this.globalName}.cancel()">
  </div>`
  this.buttonsShow("New");
}


get_pk() {  // client side recordUxClass - for a page
  return this.#primary_key_value;
}

clear(){  // client side recordUxClass - for a page
  document.getElementById(`${this.tableUX.DOMid}_record_data`).innerHTML = "";
  this.buttonsShow("New");
}


cancel(){ // client side recordUxClass - for a page
  // similar to save, move data from buffer to memory, then save
  if (this.#primary_key_value === null ) {
    // cancled from new
    this.clear();
  } else {
    // cancled from edit
    this.show();
  }
}


recordDuplicate(){// client side recordUxClass - for a page
  alert("recordDuplicate from memery, not implemented yet")
}


delete(){// client side recordUxClass - for a page
  //alert("recordDelete from memery, not implemented yet")
  //return;
  const table = this.tableUX.getModel();  // get tableClass being displayed
  table.delete(this.#primary_key_value);  // delete row from data
  this.tableUX.display(table.PK_get() );  // redisplay data
  this.recordCancel();                    // hide record form
  //this.show_changes();                    // show changes
}



} // recordUxClass - client-side //  end


export {recordUxClass};