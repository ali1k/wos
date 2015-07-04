'use strict';
var _ = require('lodash');
var rdf = require('rdf');
var env=rdf.environment;
var Graph=rdf.Graph;
var rdfns=rdf.rdfns;

env.setPrefix("risis", "http://risis.eu/");
env.setPrefix("doi", "http://dx.doi.org/");
env.setPrefix("wosV", "http://risis.eu/wos/vocab/");
env.setPrefix("wosR", "http://risis.eu/wos/resource/");
env.setPrefix("skos", "http://www.w3.org/2004/02/skos/core#");

rdf.setBuiltins();

module.exports = {
  convert: function(record){
      if(record['DT'] && record['DT'][0] === 'Article'){
          var g= new Graph;
          var parsedCR;
          var uri= 'wosR:' + encodeURIComponent(record['qname']);
          //rdf:type
              g.add(env.createTriple(uri, rdfns('type'), 'wosV:'+encodeURIComponent(record['DT'][0].replace(/\s/g,'_'))));
          if(record['DI']){
              //g.add(env.createTriple(uri, 'owl:sameAs', 'doi:'+encodeURIComponent(record['DI'][0])));
          }
          if(record['CR']){
            _.forEach(record['CR'], function(citation) {
              g.add(env.createTriple(uri, 'wosV:CR', 'wosR:'+encodeURIComponent(citation['qname'])));
              parsedCR = parseCitation(citation['citation']);
              if(parsedCR[0]){
                  g.add(env.createTriple('wosR:'+encodeURIComponent(citation['qname']) , 'wosV:PY', parsedCR[0].l()));
              }
              if(parsedCR[1]){
                  g.add(env.createTriple('wosR:'+encodeURIComponent(citation['qname']) , 'wosV:source', parsedCR[2]));
                  g.add(env.createTriple(parsedCR[2] , rdfns('type'), 'wosV:Source'));
                  g.add(env.createTriple(parsedCR[2] , 'wosV:J9', parsedCR[1].l()));
              }
              //g.add(env.createTriple('wosR:'+encodeURIComponent(citation['qname']), 'rdfs:label', citation['citation'].l()));
              if(citation['doi']){
                //g.add(env.createTriple('wosR:'+encodeURIComponent(citation['qname']), 'owl:sameAs', 'doi:'+encodeURIComponent(citation['doi'])));
            }else{
                if(parsedCR[3]){
                   // g.add(env.createTriple(parsedCR[2] , 'owl:sameAs', 'doi:'+encodeURIComponent(parsedCR[3])));
                }
            }
            });
          }
          var sourceURI;
          if(record['J9']){
              sourceURI = getSourceURI(record['J9'].join(' '));
              g.add(env.createTriple(uri, 'wosV:source', sourceURI));
              g.add(env.createTriple(sourceURI , rdfns('type'), 'wosV:Source'));
              g.add(env.createTriple(sourceURI, 'wosV:J9', record['J9'].join(' ').l()));
          }
          if(record['JI'] && sourceURI){
              //g.add(env.createTriple(sourceURI, 'wosV:JI', record['JI'].join(' ').l()));
          }
          if(record['SO'] && sourceURI){
              //g.add(env.createTriple(sourceURI, 'wosV:SO', record['SO'].join(' ').l()));
          }
          if(record['PY']){
              g.add(env.createTriple(uri, 'wosV:PY', record['PY'].join(' ').l()));
          }
          //return graph in NT format
          var NT = g.toArray().map(function(t){
              return t.toString() + "\n";
          }).join('');
          return NT;
      }else{
        return '';
        }
  }
}

var getSourceURI = function (source){
    return 'http://risis.eu/wos/resource/source_' + encodeURIComponent(source.replace(/\s/g,'_'));
}
var parseCitation = function(input) {
    var arr = input.split(',');
    var year, source,sourceURI, doi, tmp;
    var l = arr.length;
    if(l > 1){
        year = _.trim(arr[1]);
        source = _.trim(arr[2]);
        sourceURI = getSourceURI(source);
        tmp = arr[l - 1].split('DOI');
        if(tmp.length){
            doi = _.trim(tmp[1]);
        }
    }
    return [year, source, sourceURI, doi];
}
