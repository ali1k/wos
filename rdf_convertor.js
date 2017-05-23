'use strict';
var _ = require('lodash');
var rdf = require('rdf');
console.log('');
var env=rdf.environment;
var Graph=rdf.Graph;
var rdfns=rdf.rdfns;

rdf.environment.setPrefix("risis", "http://risis.eu/");
rdf.environment.setPrefix("doi", "http://dx.doi.org/");
rdf.environment.setPrefix("wosV", "http://wos.risis.eu/vocabulary/");
rdf.environment.setPrefix("wosR", "http://wos.risis.eu/resource/");
rdf.environment.setPrefix("skos", "http://www.w3.org/2004/02/skos/core#");
rdf.setBuiltins();

module.exports = {
  convert: function(record){
    if(!record['UT'] && !record['qname']){
        return '';
    }
    console.log('#--------------------------------------------');
    var g= new Graph;
    var uri= '';
    var uniqueID= '';
    if(record['UT']){
        uniqueID = encodeURIComponent(record['UT'][0].replace(':', '_'));
        uri= 'wosR:' + uniqueID;
    }else{
        uniqueID = encodeURIComponent(record['qname'].toLowerCase());
        uri= 'wosR:' +uniqueID;
        g.add(env.createTriple(uri, rdfns('type'), 'wosV:RecordWithoutUT'));
    }
    g.add(env.createTriple(uri, rdfns('type'), 'wosV:Publication'));
    //rdf:type
    if(record['DT']){
        g.add(env.createTriple(uri, rdfns('type'), 'wosV:'+encodeURIComponent(record['DT'][0].replace(/\s/g,'_'))));
    }
    if(record['DI']){
        g.add(env.createTriple(uri, 'wosV:DOI', 'doi:'+encodeURIComponent(record['DI'][0])));
    }
    if(record['CR']){
      _.forEach(record['CR'], function(citation) {
        let ctURI = '';
        if(citation['doi']){
            ctURI = 'doi:'+encodeURIComponent(citation['doi']);
            g.add(env.createTriple(ctURI, 'wosV:DOI', 'doi:'+encodeURIComponent(citation['doi'])));
        }else{
            ctURI = 'wosR:'+encodeURIComponent(citation['qname'].toLowerCase());
        }
        g.add(env.createTriple(uri, 'wosV:CR', ctURI));
        g.add(env.createTriple(ctURI, 'rdfs:label', citation['citation'].l()));
        g.add(env.createTriple(ctURI, rdfns('type'), 'wosV:CitedPublication'));
      });
    }
    if(record['AF']){
        var author_id='';
      //do not disambiguate authors, not sure if it is good to have unique authors?!!
      _.forEach(record['AF'], function(author,k) {
        author_id=uniqueID+'_'+author.replace(/\./g,'').replace(/,\s/g,' ').replace(/\s/g,'_');
        g.add(env.createTriple(uri, 'wosV:AF', 'wosR:'+encodeURIComponent(author_id)));
        g.add(env.createTriple('wosR:'+encodeURIComponent(author_id), 'rdfs:label', author.l()));
        g.add(env.createTriple('wosR:'+encodeURIComponent(author_id), rdfns('type'), 'wosV:Author' ));
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
