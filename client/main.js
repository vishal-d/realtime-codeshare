import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';

import './main.html';

this.Documents = new this.Mongo.Collection("documents");
//documents is how mongo refer to the collection
//Documents is how we are refering to the collection in our code

Template.editor.helpers({doc_id:function(){
	if(Documents.findOne()){
		return Documents.findOne()._id;
	}
	else{
		return undefined;
	}
},
config:function(){
	return function(editor){
		console.log(editor);
		editor.on("change", function(cm_editor,info){
			console.log(cm_editor.getValue());
			$("#viewer_iframe").contents().find("html").html(cm_editor.getValue());
		});
	}
},
});

Session.set("time",new Date());
Meteor.setInterval(function(){
	Session.set("time", new Date());
}, 1000);
Template.date_display.helpers({
	current_date:function(){
		return Session.get("time");
	},
});
