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
    var g= new Graph;
    var uri= 'wosR:' + encodeURIComponent(record['qname']);
    //rdf:type
    if(record['DT']){
        g.add(env.createTriple(uri, rdfns('type'), 'wosV:'+record['DT'][0].replace(' ','_')));
    }
    if(record['UT']){
        g.add(env.createTriple(uri, 'owl:sameAs', 'urn:'+encodeURIComponent(record['UT'][0])));
    }
    if(record['DI']){
        g.add(env.createTriple(uri, 'owl:sameAs', 'doi:'+encodeURIComponent(record['DI'][0])));
    }
    if(record['CR']){
      _.forEach(record['CR'], function(citation) {
        g.add(env.createTriple(uri, 'wosV:CR', 'wosR:'+encodeURIComponent(citation['qname'])));
        g.add(env.createTriple('wosR:'+encodeURIComponent(citation['qname']), 'rdfs:label', citation['citation'].l()));
        if(citation['doi']){
          g.add(env.createTriple('wosR:'+citation['qname'], 'owl:sameAs', 'doi:'+encodeURIComponent(citation['doi'])));
        }
      });
    }
    if(record['AF']){
        var author_id='';
      //do not disambiguate authors, not sure if it is good to have unique authors?!!
      _.forEach(record['AF'], function(author,k) {
        author_id=author.replace(/\./g,'').replace(/,\s/g,' ').replace(/\s/g,'_');
        g.add(env.createTriple(uri, 'wosV:AF', 'wosR:'+encodeURIComponent(author_id)));
        g.add(env.createTriple('wosR:'+encodeURIComponent(author_id), 'rdfs:label', author.l()));
        //add skos lat label for short author names
        if(record['AU'] && record['AU'][k]){
          g.add(env.createTriple('wosR:'+encodeURIComponent(author_id), 'skos:altLabel', record['AU'][k].l()));
        }
      });
    }
    if(record['WC']){
      _.forEach(record['WC'], function(category) {
        g.add(env.createTriple(uri, 'wosV:WC', category.l()));
      });
    }
    if(record['SC']){
      _.forEach(record['SC'], function(category) {
        g.add(env.createTriple(uri, 'wosV:SC', category.l()));
      });
    }
    if(record['DE']){
      _.forEach(record['DE'], function(keyword) {
        g.add(env.createTriple(uri, 'wosV:DE', keyword.l()));
      });
    }
    if(record['ID']){
      _.forEach(record['ID'], function(keywordp) {
        g.add(env.createTriple(uri, 'wosV:ID', keywordp.l()));
      });
    }
    _.forEach(record, function(v, k) {
      //exclude the props already addressed
      if(_.indexOf(['DT','qname', 'CR', 'WC', 'SC','AF', 'AU', 'DE', 'ID', 'DI', 'UT'], k)==-1){
        g.add(env.createTriple(uri, 'wosV:'+k, v.join(' ').l()));
      }
    });
    //return graph in NT format
    var NT = g.toArray().map(function(t){
        return t.toString() + "\n";
    }).join('');
    return NT;
  }
}
