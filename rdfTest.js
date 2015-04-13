var rdf = require('rdf');
var env=rdf.environment;
var Graph=rdf.Graph;
var rdfns=rdf.rdfns;

var _ = require('lodash');

var isiCode={FN:'File type', VR:'File format version number', PT:'Publication type (e.g., book, journal, book in series)', AU:'Author(s)', TI:'Article title', SO:'Full source title', LA:'Language', DT:'Document type', NR:'Cited reference count', SN:'ISSN', PU:'Publisher', C1:'Research addresses', DE:'Author keywords', ID:'KeyWords Plus', AB:'Abstract', CR:'Cited references', TC:'Times cited', BP:'Beginning page', EP:'Ending page', PG:'Page count', JI:'ISO source title abbreviation', SE:'Book series title', BS:'Book series subtitle', PY:'Publication year', PD:'Publication date', VL:'Volume', IS:'Issue', PN:'Part number', SU:'Supplement', SI:'Special issue', GA:'ISI document delivery number', PI:'Publisher city', WP:'Publisher web address', RP:'Reprint address', CP:'Cited patent', J9:'29-character source title abbreviation', PA:'Publisher address', UT:'ISI unique article identifier', ER:'End of record', EF:'End of file'};

//console.log(_.size(isiCode));

var s=new rdf.NamedNode('http://example.com/');
/*
console.log(s.nodeType());
console.log(s.toNT());
console.log(s.n3());

console.log(env.resolve('rdf:type'));
console.log(env.resolve('rdfs:Class'));
*/
env.setPrefix("risis", "http://risis.eu/");
env.setPrefix("dbp", "http://dbpedia.org/prop/");
env.setPrefix("foaf", "http://foaf.org/");
env.setPrefix("dbr", "http://dbpedia.org/resource/");

//console.log(env.resolve('risis:hint'));

rdf.setBuiltins();

var t={a: 'rdfs:Class'}.ref(s);
//console.log(t.toNT());
// console.log(t.n3());

var t2={dbp$dateOfBirth:new Date("1984-06-26"), 'foaf:depiction': 'http://ali1k.com/image.gif'}.ref('dbr:Ali');

//console.log(t2.toNT());
// console.log(t2.n3());

var g = new Graph;
g.add(rdf.environment.createTriple('http://example.com/Letter', rdfns('type'), 'http://www.w3.org/2000/01/rdf-schema#Class'));
g.add(rdf.environment.createTriple('http://example.com/Vowel', 'http://www.w3.org/2000/01/rdf-schema#subClassOf', 'http://example.com/Letter'));
g.add(rdf.environment.createTriple('http://example.com/A', rdfns('type'), 'http://example.com/Letter'));
g.add(rdf.environment.createTriple('http://example.com/A', 'foaf:depiction', "test".l('en')));
g.add(rdf.environment.createTriple('http://example.com/A', rdfns('type'), 'http://example.com/Vowel'));
g.add(rdf.environment.createTriple('http://example.com/A', 'http://example.com/nextLetter', 'http://example.com/B'));
g.add(rdf.environment.createTriple('http://example.com/B', rdfns('type'), 'http://example.com/Letter'));
g.add(rdf.environment.createTriple('http://example.com/C', rdfns('type'), 'http://example.com/Letter'));

var NT = g.toArray().map(function(t){
    return t.toString() + "\n";
}).join('');
console.log(NT);
