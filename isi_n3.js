var _ = require('lodash');
var FieldTag=require('./config').FieldTag;
var sharedParser=require('./shared_parsing_functions');

var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    http = require('http'),
    byline = require('byline');

console.log('Starting...');

var source = "./test/second.txt",
current_record={}, records = [], record_type, record_value;

input = byline(fs.createReadStream(source)).on('data', function (line) {
  processor(line);

}).on('end', function () {
  console.log('Finished conversion');
  console.log(_.size(records)+ ' records were converted!');
  var fixed_records=fix_records(records);
  console.log(fixed_records[1]);
});


/* Process a record line */
function processor(line) {
  var match = line.match(/^(\w{2})\s(.+)/);
  if(match){
    record_type=match[1];
    record_value=match[2];
    //document metadata
    if(record_type=='FN' || record_type=='VR'){
      return;
    }else{
      //handle fileds
      current_record[record_type]=[record_value];
      // console.log('******* '+FieldTag[record_type]+' *********');
      // console.log(record_value);
    }
  }else{
    //end of record
    if(_.trim(line)=='ER'){
      records.push(current_record);
      current_record={};
      // console.log('--------------------------------------------------------');
    }else{
      //end of file
      if(_.trim(line)=='EF'){
        if(!_.isEmpty(current_record))
          records.push(current_record);
        // console.log(FieldTag['EF']);
      }else{
        if(_.trim(line)){
          //values realted to the previous filed
          current_record[record_type].push(_.trim(line));
          // console.log(_.trim(line));
        }
      }
    }

  }

}

/*  Concats separated value */
//This appends lines for some records (e.g. the abstract)
function concatenate_record(record){
  var new_v, new_record={};
  _.forEach(record, function(v, k) {
    if(_.indexOf(['AB','FX','PA','TI','RP','ID'], k)!=-1){
      new_v = v.join(' ');
      if(k=='ID'){
        new_v=new_v.split('; ');
      }
      new_record[k]=new_v;
    }else{
      if(k=='CR'){
        //handle citations when the DOI goes to the next line
        var new_citations=[], concat_citation = 0, previous_citation='';
        _.forEach(v, function(citation) {
            if(_(citation).endsWith('DOI')){
              concat_citation=1;
              previous_citation=citation;
            }else{
              if(concat_citation){
                new_citations.push(previous_citation+' '+citation);
                concat_citation=0;
              }else{
                new_citations.push(citation);
                previous_citation='';
              }
            }
          });
        new_record[k]=new_citations;
      }else{
        new_record[k]=v;
      }
    }
  });
  return new_record;
}

/* batch clean records */
function fix_records(records){
  var new_records = [];
  _.forEach(records, function(record) {
    record = concatenate_record(record);
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
