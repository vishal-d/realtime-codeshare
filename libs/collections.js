this.Documents = new Mongo.Collection("documents");
//documents is how mongo refer to the collection
//Documents is how we are refering to the collection in our code
EditingUsers = new Mongo.Collection("editingUser");
Comments=new Mongo.Collection("Comments");
Comments.attachSchema(new SimpleSchema({
	title:{
		type: String,
		label: "Title",
		max: 200
	},
body:{
	type: String,
	label: "Comment",
	max:1000
},
docid:{
	type:String,
},
owner:{
	type:String, 
}
}));


