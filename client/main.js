import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';


import './main.html';
import './docItem.html';
import './docList.html';
import './navbar.html';
import'./accounts.js';
import '../libs/collections.js';

Meteor.subscribe("documents");
Meteor.subscribe("editingUser");
Meteor.subscribe("comments");

Router.configure({
	layoutTemplate:'ApplicationLayout'
});
Router.route('/', function(){
	console.log("you hit /");
	this.render("navbar",{to:"header"});
	this.render("docList",{to:"main"});
});
Router.route('/documents/:_id', function(){
	Session.set("docid",this.params._id);
	this.render("navbar",{to:"header"});
	this.render("docItem",{to:"main"});
});


Template.editor.helpers({doc_id:function(){
		setupCurrentDocument();
		return Session.get("docid");
},
config:function(){
	return function(editor){
		editor.setOption("lineNumbers", "true");
		editor.setOption("theme", "dracula");			
		editor.setOption("mode", "html");
		//console.log(editor);
		editor.on("change", function(cm_editor,info){
			//console.log(cm_editor.getValue());
			$("#viewer_iframe").contents().find("html").html(cm_editor.getValue());	
			Meteor.call("addEditingUsers",Session.get("docid"));
		});
	}
},
});



Template.editingUsers.helpers({
	users:function(){
		var doc, euser, users;
		doc = Documents.findOne({_id:Session.get("docid")});
		if(!doc){return};
		euser=EditingUsers.findOne({docid:doc._id});
		if(!euser){return};
		users = new Array();
		var i=0;
		for(var user_id in euser.users){
			users[i]=fixObjectKeys(euser.users[user_id]);
			i++;
		}
		return users;
	}
});

Template.docList.helpers({
	documents:function(){
		return Documents.find();
	}
});

Template.insertCommentForm.helpers({
	docid:function(){
		return Session.get("docid");
	}
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

Template.navbar.helpers({
	documents:function(){
		return Documents.find({});
	},
});

Template.docMeta.helpers({
	document:function(){
		return Documents.findOne({_id:Session.get("docid")});		
	},
	canEdit:function(){
		var doc;
		doc=Documents.findOne({_id:Session.get("docid")});
		if(doc){
			if(doc.owner==Meteor.userId()){
				return true;
			}
		}
		else{
			return false;
		}
	}
});

Template.editableText.helpers({
	userCanEdit:function(doc,Collection){
		doc=Documents.findOne({_id:Session.get("docid"),owner:Meteor.userId()});
		if(doc){
			return true;
		}
		else{
			return false;
		}
	}
});

Template.commentList.helpers({
	comments:function(){
		return Comments.find({docid:Session.get("docid")});
			
	}
})

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
			comment.owner=this.userId;
			comment.createdOn=new Date();
			comment.userId=this.userId;
			return Comments.insert(comment);
		}
		return;
	}
});



function fixObjectKeys(obj){
	var newObj={}
	for(key in obj){
		var key2=key.replace("-","");
		newObj[key2]=obj[key];
	}
	return newObj;
}

function setupCurrentDocument(){
	var doc;
	if(!Session.get("docid")){
		doc=Documents.findOne();
		if(doc){
			Session.set("docid",doc._id);
		}
	};
}


Template.navbar.events({
	"click .js-add-doc":function(event){
		event.preventDefault();
		//console.log("Add a new event");
		if(!Meteor.user()){
			alert("You need to login first");
		}
		else{
			//they are logged in insert the doc
			var id=Meteor.call("addDoc", function(err, res){
				if(!err){
					Session.set("docid",res);
				}
			});
			 
		}
	},
	"click .js-load-doc":function(event){
		Session.set("docid",this._id);
	},
});

Template.docMeta.events({
	"click .js-toggle-private":function(event){
		console.log(event.target.checked)//give the target of check box check gives if check box is true or false
		var doc={_id:Session.get("docid"), isPrivate:event.target.checked};
		Meteor.call("updateDocPrivacy",doc);
	}
});