// Use this code for Google Docs, Slides, Forms, or Sheets.
function onOpen() {
  SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
      .createMenu('Scalyr')
      .addItem('Query', 'openQuery')
      .addItem('Configuration', 'openConfig')
      .addToUi();
}

function openQuery() {
  var html = HtmlService.createHtmlOutputFromFile('index');
  SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
      .showSidebar(html);
}

function runningQuery() {
  var html = HtmlService.createHtmlOutputFromFile('running');
  SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
      .showSidebar(html);
}

function openConfig() {
  var html = HtmlService.createHtmlOutputFromFile('config');
  SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
      .showSidebar(html);
}

/* @Include JavaScript and CSS Files */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}
 
/* @Process Form */
function processConfig(formObject) {
  var url = "https://docs.google.com/spreadsheets/d/1dXBJHbFzguzmEinbvjUgynAjXJ7bvbp2Zsqq1IzVcoY/edit#gid=0";
  var ss = SpreadsheetApp.openByUrl(url);
  var ws = ss.getSheetByName("Data");
  PropertiesService.getScriptProperties().setProperty('api_key', formObject.api_key);
  PropertiesService.getScriptProperties().setProperty('scalyr_server', formObject.scalyr_server);
}

function clearFilter() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var ssId = ss.getId();
    var sheetId = ss.getActiveSheet().getSheetId();
    var requests = [{
        "clearBasicFilter": {
        "sheetId": sheetId
        }
    }];
    Sheets.Spreadsheets.batchUpdate({'requests': requests}, ssId);
}

function processQuery(formObject) {
 // formObject = {query: "serverHost = * |s limit 1 | columns serverHost, timestamp, message", api_key: "0O/gx0aMXBg/4F00V8cyuN/MfLg2pjZUSsJHoGWLkJjs-", scalyr_server: "https://app.scalyr.com", "start": "4h","end": "+1h"};
 
//work on active spreadsheet
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var ws = ss.getActiveSheet();  

//get properties set in config  
  var api_key = PropertiesService.getScriptProperties().getProperty('api_key');
  var scalyr_server = PropertiesService.getScriptProperties().getProperty('scalyr_server');
 
 /* var limit = PropertiesService.getScriptProperties().getProperty('limit');
  if (limit = null) {
      limit = "|limit" + 1000
    
  } else if (limit > 0){
    limit = ""
  } else {
     limit = "|limit" + 1000
  }
  */

  // Make a GET request and log the returned content.
  var query = formObject.query;
  var start = formObject.start;
  var end = formObject.end
  query = encodeURIComponent(query);
  start = encodeURIComponent(start);
  end = encodeURIComponent(end);
  
  var url =  scalyr_server + '/api/powerQuery?query=' + query + '&token=' + api_key + '&startTime=' + start + '&endTime=' + end;
  Logger.log(url)
  var response = UrlFetchApp.fetch(url);
  var responseCode = response.getResponseCode()
  var response = response.getContentText()
  if (responseCode === 200) {

  //parse json
    var responseJson = JSON.parse(response)
    var data = JSON.parse(response);
    Logger.log(response) // may throw three types of exceptions
    var columnArray = data.columns;
    var rowsArray = data.values;
    var rows = [];
    var columns = [];

    //get the columns and add to array [col1, col2, col3]
    for (var i = 0; i < columnArray.length; i++) {
          columns[i] = columnArray[i].name
          Logger.log(columnArray[i].name)
          
  }
    var allcol = [columns]
    // get values and add them to array [val1, val2, val3]
    for (var i = 0; i < rowsArray.length; i++) {
          allcol.push(rowsArray[i]);
          Logger.log(rowsArray[i])
          
          
  }


  Logger.log(allcol)

  //create new range
  name = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getName();
  var range = ws.getRange(1,1,rowsArray.length+1,columnArray.length);
  // if there is data, clear it 
  if (ss.getRangeByName(name) != null) {
          ss.getRangeByName(name).clearContent();
    }
  else {
      name = ss.getActiveSheet();
      ss.setNamedRange(name, range);
      }


//write to current sheet
  
  ws.getRange(1,1,rowsArray.length+1,columnArray.length).setValues(allcol);
  clearFilter()
  ws.getRange(1,1,rowsArray.length+1,columnArray.length).createFilter();
  ss.setNamedRange("pq", range);
  //Logger.log(range)
  return response
  
  } else {
  var err =  ("Issue with the webrequest</br> Expected 200, got %d: %s", responseCode, responseBody);
  return err

}


    }
