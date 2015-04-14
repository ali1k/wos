'use strict';
var _ = require('lodash');
//This is shared between TSV and ISI format parser
module.exports = {
  /* Parse each citation record */
  parse_citations: function (record){
    var citation_dict={}, new_citations = [], id_list=[];
    if(record['CR']){
      _.forEach(record['CR'], function(citation) {
        id_list=[];
        citation_dict={};
        var citation_list = citation.split(', ');
        _.forEach(citation_list, function(c) {
            if(!(_(c).startsWith('DOI ') || _(c).startsWith('ARTN '))){
              id_list.push(c.replace(/\s/g,'_'));
            }else{
              if(_(c).startsWith('DOI ')){
                citation_dict['doi']=c.substr(4);
              }
            }
          });
          citation_dict['qname'] = id_list.join('');
          citation_dict['citation'] = citation;
          new_citations.push(citation_dict);
      });
      record['CR']=new_citations;
    }
    return record;
  },
  /* generate ID for each record */
  build_id: function(record){
    var author='', year='', journal='', volume='', page='', doi;
      try {
        if(record['AU']){
          author=record['AU'][0].replace(', ',' ').replace(/\s/g,'_').toUpperCase();
        }
        if(record['PY']){
          year=record['PY'][0];
        }
        if(record['J9']){
          journal=record['J9'][0].replace(/\s/g,'_');
        }
        if(record['VL']){
          volume='V'+record['VL'][0].replace(/\s/g,'_');
        }
        if(record['DI']){
          doi=record['DI'][0];
        }
        if(record['BP']){
          //todo: check if we have the same page structure in citations
          page='P'+record['BP'][0];
        }
        record['qname']=author+year+journal+volume+page;
        return record;
      }
      catch(err) {
        console.log(err.message);
        return record;
      }
  }
}
