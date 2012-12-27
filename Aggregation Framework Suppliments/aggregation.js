// make sure we're using the right db; this is the same as "use aggdb;" in shell
db = db.getSiblingDB("aggdb");

// simple projection
var p1 = db.runCommand(
{ aggregate : "article", pipeline : [
    { $project : {
    	tags : 1,
	    pageViews : 1
    }}
]});


// unwinding an array
var u1 = db.runCommand(
{ aggregate : "article", pipeline : [
    { $unwind : "$tags" }
]});


// combining pipeline operations
var p2 = db.runCommand(
{ aggregate : "article", pipeline : [
    { $project : {
      author : 1,
      tags : 1,
      pageViews : 1
    }},
    { $unwind : "$tags" }
]});


// pulling values out of subdocuments
var p3 = db.runCommand(
{ aggregate : "article", pipeline : [
    { $project : {
    	otherfoo : "$other.foo",
	    otherbar : "$other.bar"
    }}
]});


// projection includes a computed value
var p4 = db.runCommand(
{ aggregate : "article", pipeline : [
    { $project : {
    	author : 1,
	    daveWroteIt : { $eq:["$author", "dave"] }
    }}
]});


// projection includes a virtual (fabricated) document
var p5 = db.runCommand(
{ aggregate : "article", pipeline : [
    { $project : {
	    author : 1,
    	pageViews : 1,
    	tags : 1
    }},
    { $unwind : "$tags" },
    { $project : {
    	author : 1,
    	subDocument : { foo : "$pageViews", bar : "$tags"  }
    }}
]});


// nested computed expression; $ifNull
var p7 = db.runCommand(
{ aggregate : "article", pipeline : [
    { $project : {
    	theSum : { $add:["$pageViews",
			 { $ifNull:["$other.foo",
				    "$other.bar"] } ] }
    }}
]});


// dotted path inclusion; _id exclusion
var p8 = db.runCommand(
{ aggregate : "article", pipeline : [
    { $project : {
    	_id : 0,
    	author : 1,
    	tags : 1,
    	"comments.author" : 1
    }}
]});


// simple sort
var p10 = db.runCommand(
{ aggregate : "article", pipeline : [
    { $sort : { title : 1 }
    }
]});


// date tests
var p19 = db.runCommand(
{aggregate : "article", pipeline : [
    { $project : {
        authors : 1,
        seconds: {$second: "$posted"},
        minutes: {$minute: "$posted"},
        hour: {$hour: "$posted"},
        dayOfYear: {$dayOfYear: "$posted"},
        dayOfMonth: {$dayOfMonth: "$posted"},
        dayOfWeek: {$dayOfWeek: "$posted"},
        month: {$month: "$posted"},
        week: {$week: "$posted"},
        year: {$year: "$posted"}
    }}
]});


// ternary conditional operator
var p21 = db.runCommand(
{ aggregate : "article", pipeline : [
    { $project : {
    	_id : 0,
	    author : 1,
	    pageViews : { $cond : [ {$eq:["$author", "dave"]},
				{$add:["$pageViews", 1000]}, "$pageViews" ]
	  }
  }}
]});


// simple matching
var m1 = db.runCommand(
{ aggregate : "article", pipeline : [
    { $match : { author : "dave" } }
]});


// combining matching with a projection
var m2 = db.runCommand(
{ aggregate : "article", pipeline : [
    { $project : {
    	title : 1,
	    author : 1,
    	pageViews : 1,
	    tags : 1,
	    comments : 1
    }},
    { $unwind : "$tags" },
    { $match : { tags : "nasty" } }
]});


// grouping
var g1 = db.runCommand(
{ aggregate : "article", pipeline : [
    { $project : {
    	author : 1,
	    tags : 1,
	    pageViews : 1
    }},
    { $unwind : "$tags" },
    { $group : {
	    _id : "$tags",
	    docsByTag : { $sum : 1 },
	    viewsByTag : { $sum : "$pageViews" },
	    mostViewsByTag : { $max : "$pageViews" },
	    avgByTag : { $avg : "$pageViews" }
    }}
]});


// $addToSet as an accumulator; can pivot data
var g5 = db.runCommand(
{ aggregate : "article", pipeline : [
    { $project : {
    	author : 1,
	    tags : 1,
    }},
    { $unwind : "$tags" },
    { $group : {
	    _id : { tags : 1 },
	    authors : { $addToSet : "$author" }
    }}
]});
