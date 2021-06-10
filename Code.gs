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
      .showModalDialog(html, 'Scalyr');
}

function runningQuery() {
  var html = HtmlService.createHtmlOutputFromFile('running');
  SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
      .showModalDialog(html, 'Scalyr');
}

function openConfig() {
  var html = HtmlService.createHtmlOutputFromFile('config');
  SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
      .showModalDialog(html, 'Scalyr');
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

function processQuery(formObject) {
  runningQuery();
 // formObject = {query: "serverHost = * | limit 3 | columns serverHost, timestamp, message", api_key: "0O/gx0aMXBg/4F00V8cyuN/MfLg2pjZUSsJHoGWLkJjs-", scalyr_server: "https://app.scalyr.com"};
  var url = "https://docs.google.com/spreadsheets/d/1dXBJHbFzguzmEinbvjUgynAjXJ7bvbp2Zsqq1IzVcoY/edit#gid=0";
 // var ss = SpreadsheetApp.openByUrl(url);
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var ws = ss.getActiveSheet();  
  var api_key = PropertiesService.getScriptProperties().getProperty('api_key');
  var scalyr_server = PropertiesService.getScriptProperties().getProperty('scalyr_server');
   //   ws.appendRow([scalyr_server,
   //             api_key]);
  // Make a GET request and log the returned content.
  var query = formObject.query;
  query = encodeURIComponent(query);
  var url =  scalyr_server + '/api/powerQuery?query=' + query + '&' + 'token=' + api_key;
  var response = UrlFetchApp.fetch(url);
  response = response.getContentText();
  var data = JSON.parse(response);
  var columnArray = data.columns;
  var rowsArray = data.values;
  var rows = [];
  var columns = [];
  for (var i = 0; i < columnArray.length; i++) {
        columns[i] = columnArray[i].name
        Logger.log(columnArray[i].name)
        
}
  var allcol = [columns]
  for (var i = 0; i < rowsArray.length; i++) {
        allcol.push(rowsArray[i]);
        Logger.log(rowsArray[i])
        
        
}


Logger.log(allcol)
//SpreadsheetApp.getActiveSheet().getRange('A1:B3').setValue(allcol);
ws.getRange(1,1,rowsArray.length+1,columnArray.length).setValues(allcol);

    }



