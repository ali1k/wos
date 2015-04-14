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

rdf.setBuiltins();

module.exports = {
  convert: function(record){
    var g= new Graph;
    var uri= 'wosR:'+record['qname'];
    //rdf:type
    if(record['DT']){
        g.add(env.createTriple(uri, rdfns('type'), 'wosV:'+record['DT'][0].replace(' ','_')));
    }
    if(record['CR']){
      _.forEach(record['CR'], function(citation) {
        g.add(env.createTriple(uri, 'wosV:CR', 'wosR:'+citation['qname']));
        g.add(env.createTriple('wosR:'+citation['qname'], 'rdfs:label', citation['citation'].l()));
        if(citation['doi']){
          g.add(env.createTriple('wosR:'+citation['qname'], 'owl:sameAs', 'doi:'+citation['doi']));
        }
      });
    }
    _.forEach(record, function(v, k) {
      //exclude the props already addressed
      if(_.indexOf(['DT','qname', 'CR'], k)==-1){

      }
    });
    //return graph in NT format
    var NT = g.toArray().map(function(t){
        return t.toString() + "\n";
    }).join('');
    return NT;
  }
}
