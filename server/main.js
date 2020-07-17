import { Meteor } from 'meteor/meteor';
this.Documents = new Mongo.Collection("documents");

Meteor.startup(() => {
  if(!Documents.findOne()){//no documents yet
  	Documents.insert({title:"my new document"});
  }// code to run on server at startup
});
