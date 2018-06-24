'use strict';
var express = require('express');
var express_graphql = require('express-graphql');
var { 
	buildSchema, 
	GraphQLSchema,
	GraphQLList,
	GraphQLObjectType, 
	GraphQLStringType, 
	GraphQLFloatType 
} = require('graphql');

var sensors = require('./sensors');

var schema = buildSchema(`
	type Record {
		time: String,
		t: Float,
		h: Float,
		f: Boolean
	}

    type Query {
		currentTemperature: Float,
		currentHumidity: Float,
		currentFanState: Boolean,
		history(from: String!, to: String!): [Record],
        message: String
    }
`);

class Record {
  constructor(time, t, h, f) {
    this.time = time;
    this.t = t;
    this.h = h;
    this.f = f;
  }
}

function resolveHistory({from, to}) {
	if (to === 'now' && /-[0-9]+h/.test(from)) { 
		to = (new Date()).toISOString();
		let hrs = parseInt(from) * -1;
		let d = new Date();
		d.setHours(d.getHours() - hrs);
		from = d.toISOString();
	}
	
	let recs = sensors.getHistory(new Date(from), new Date(to));
	recs = recs.map(r => new Record(r[0], r[1], r[2], r[3]));
	return recs;
}

// Root resolver
var root = {
    message: () => 'Hello World!',
    currentTemperature: () => sensors.getCurrentTemperature(),
    currentHumidity: () => sensors.getCurrentHumidity(),
    currentFanState: () => sensors.getCurrentFanState(),
    history: resolveHistory
};

// Create an express server and a GraphQL endpoint
var app = express();
app.use('/graphql', express_graphql({
    schema: schema,
    rootValue: root,
    graphiql: true
}));

app.listen(4000, () => console.log('GraphQL started on localhost:4000/graphql'));
