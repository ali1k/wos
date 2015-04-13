var _ = require('lodash');
var isiCode=require('./config').isiCode;

var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    http = require('http'),
    byline = require('byline');

console.log('Starting...');

var source = "./test/first.txt",
        input,
        processor = processHeader,
        separator = '\t',
        fieldNames,
        lineCount = 0,
        recordCount = 0;


input = byline(fs.createReadStream(source)).on('data', function (line) {
  lineCount++;
  processor(line);

}).on('end', function () {

  console.log('Finished conversion');
});

/* Process the header line of a TSV file. */
function processHeader(line) {
  // Split line into field names
  fieldNames = line.split(separator);
  if (fieldNames.length < 2) {
    die('Expected at least two fields, but got:\n' + line);
  }

  // Report about found field names
  console.log('Found ' + fieldNames.length + ' fields:');
  console.log(fieldNames.join(','));
  console.log('*******************************************');

  // Process the next line as a record
  processor = processRecord;
}

/* Process a record line of a TSV file. */
function processRecord(line) {
  // Split line into fields
  var fields = line.split(separator);
  if(fields.length==1){
    //end of file
    return 0;
  }
  //console.log(fields.join('|'));
  console.log(fields[0]);//Publication type
  console.log(fields[1]);//Authors
  console.log(fields[7]);//title
  console.log(fields[19]);//abstract
  console.log('---------------------------------------');
}

/* Halt execution with an error message. */
function die(message) {
  console.log(message);
  process.exit(1);
}
