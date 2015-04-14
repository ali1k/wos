var _ = require('lodash');
var FieldTag=require('./config').FieldTag;
var sharedParser=require('./shared_parsing_functions');

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
        current_record={}, records = [];

input = byline(fs.createReadStream(source)).on('data', function (line) {
  lineCount++;
  processor(line);

}).on('end', function () {
  //addign the last record
  records.push(current_record);
  current_record={};
  console.log('Finished conversion');
  console.log(_.size(records)+ ' records were converted!');
  //preparing records
  var fixed_records=fix_records(records);
  console.log(fixed_records[1]);

});

/* Process the header line of a TSV file. */
function processHeader(line) {
  // Split line into field names
  fieldNames = line.split(separator);
  if (fieldNames.length < 2) {
    die('Expected at least two fields, but got:\n' + line);
  }
  //fix encoding issue
  fieldNames[0]='PT';
  //cleanup the filed null character
  _.forEach(fieldNames, function(field, k) {
      fieldNames[k]=_.trim(field).replace(/\0/g, '');
    });
    //fix encoding issue
  fieldNames[(fieldNames.length-1)]='UT';
  // Report about found field names
  // console.log('Found ' + fieldNames.length + ' fields:');
  // console.log(fieldNames.join(','));
  // console.log('*******************************************');

  // Process the next line as a record
  processor = processRecord;
}

/* Process a record line of a TSV file. */
function processRecord(line) {
  var cleanedFieldValue;
  // Split line into fields
  var fields = line.split(separator);
  if(fields.length==1){
    //end of file
    return 0;
  }
    // store all fields
  _.forEach(fields, function(field, k) {
    //remove redundant null chars
      cleanedFieldValue=_.trim(field).replace(/\0/g, '');
      if(cleanedFieldValue){
        if(cleanedFieldValue=='\r'){
          records.push(current_record);
          current_record={};
          // console.log('------------------------------------------------------------------------');
        }else{
          current_record[fieldNames[k]]=cleanedFieldValue;
          // console.log(fieldNames[k], '--> '+FieldTag[fieldNames[k]]);
          // console.log(cleanedFieldValue);
          // console.log('*******************************************');
        }
      }

  });
}
//make arrays of items form some values
function separate_connected_values(record){
  var new_v, new_record={};
  _.forEach(record, function(v, k) {
      new_v=v;
      if(_.indexOf(['AU','AF','DE','ID','CR','WC','SC'], k)!=-1){
        new_v=v.split('; ');
        new_record[k]=new_v;
      }else{
        new_record[k]=[new_v];
      }
    });
  return new_record;
}

/* batch clean records */
function fix_records(records){
  var new_records = [];
  _.forEach(records, function(record) {
    record = separate_connected_values(record);
    record = sharedParser.parse_citations(record);
    record = sharedParser.build_id(record);
    new_records.push(record)
    });
  return new_records;
}
/* Halt execution with an error message. */
function die(message) {
  console.log(message);
  process.exit(1);
}
