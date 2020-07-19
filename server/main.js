import { Meteor } from 'meteor/meteor';

import './main.html';
import './docItem.html';
import './docList.html';
import './navbar.html';
import'./accounts.js';
import '../libs/collections.js';

Meteor.startup(() => {
  if(!Documents.findOne()){//no documents yet
  	Documents.insert({title:"my new document"});
Meteor.methods({
	addEditingUsers:function(docid){
		var doc, user, euser;
		doc = Documents.findOne({_id:docid});
		if(!doc){return;}//no document give up
		if(!this.userId){return};//no logged in user give up
        user=Meteor.user().profile;
        euser = EditingUsers.findOne({docid: doc._id});
        if(!euser){
        	euser={
        		docid:doc._id,
        		users:{}
        	}
        }
        user.lastEdit= new Date();
        euser.users[this.userId]=user;
		EditingUsers.upsert({_id:euser._id},euser);
		//upset-checks if there is one already 
	},
	addDoc:function(){
		var doc;
		if(!this.userId){//not loggged in
			return;
		}
		doc={owner:this.userId, createdOn:new Date(),
			title:"my new doc"};
		var id = Documents.insert(doc);
		return id;
	},
	updateDocPrivacy:function(doc){
		var realDoc=Documents.findOne({_id:doc._id, owner:this.userId});
		if(realDoc){
			realDoc.isPrivate=doc.isPrivate;
			Documents.update({_id:doc._id}, realDoc);
		}
	},
	addComment:function(comment){
		if(this.userId){
			comment.createdOn=new Date();
			comment.userId=this.userId;
			return Comments.insert(comment);
		}
		return;
	}	
});
  }// code to run on server at startup
});

Meteor.publish("documents", function(){
	return Documents.find({
		$or:[
		{isPrivate: {$ne:true}},
		{owner:this.userId},
		]
	});
});
Meteor.publish("editingUser", function(){
	return EditingUsers.find();
});

 Meteor.publish("comments", function(){
 	return Comments.find();
 });