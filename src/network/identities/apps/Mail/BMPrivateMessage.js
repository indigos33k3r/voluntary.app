
BMPrivateMessage = BMFieldSetNode.extend().newSlots({
    type: "BMPrivateMessage",
    status: "",
    isSent: false,
	canReceive: false,
	objMsg: null,
	senderPublicKeyString: null,
	receiverPublicKeyString: null,
}).setSlots({
    init: function () {
        BMFieldSetNode.init.apply(this)
		this.setShouldStore(true)

        //this.addFieldNamed("stamp").setKey("stamp").setValueIsEditable(false)
		//this.setStamp("Unstamped")
		
		//this.addStoredField(BMIdentityField.clone().setValueMethod("senderPublicKeyString").setKey("fromPubkey").setValueIsEditable(false))
		//this.addStoredField(BMIdentityField.clone().setValueMethod("receiverPublicKeyString").setKey("toPubkey").setValueIsEditable(false))

		this.addStoredField(BMOptionsField.clone().setKey("from").setValueMethod("fromContact")).setValueIsEditable(false).setValidValuesMethod("fromContactNames") //.setNoteMethod("fromContactPublicKey")
		this.addStoredField(BMOptionsField.clone().setKey("to").setValueMethod("toContact")).setValueIsEditable(true).setValidValuesMethod("toContactNames") //.setNoteMethod("toContactPublicKey")
        this.addFieldNamed("subject").setKey("subject")	

        //this.addFieldNamed("senderPublicKeyString").setKey("senderPublicKeyString").setValueIsEditable(false)
        //this.addFieldNamed("receiverPublicKeyString").setKey("receiverPublicKeyString").setValueIsEditable(false)

		this.addStoredField(BMTextAreaField.clone().setKey("body").setValueMethod("body"))
        this.setStatus("")

        this.setActions(["send", "delete"])
        this.setNodeMinWidth(600)
        this.setNodeBackgroundColor("white")

		this.addStoredSlots(["senderPublicKeyString", "receiverPublicKeyString"])
		//this.didUpdateNode()
    },

	// sync

	didUpdateField: function(aField) {
		BMFieldSetNode.didUpdateField.apply(this)

		var name = aField.valueMethod()
		//console.log("didUpdateField(" + name + ")")
		
		
		if (name == "toContact") {
			this.setupReceiverPubkeyFromInput()
			this.updateCanSend()
		}
				
		return this
	},
	
	updateCanSend: function() {
		if (this.canSend()) {
			this.addAction("send")
		} else {
			this.removeAction("send")
		}		
	},
	
	prepareToSyncToView: function() {
		BMFieldSetNode.prepareToSyncToView.apply(this)
		
		/*
		if (this.canSend()) {
			this.addAction("send")
		} else {
			this.removeAction("send")
		}
		
		//this.fieldNamed("from").setValueIsEditable(this.canEdit())
		this.fieldNamed("to").setValueIsEditable(this.canEdit())
		this.fieldNamed("subject").setValueIsEditable(this.canEdit())
		this.fieldNamed("body").setValueIsEditable(this.canEdit())
		
		//console.log(this.type() + " prepareToSyncToView")
		//this.setupInputsFromPubkeys()
*/
		return this
	},
	
	didLoadFromStore: function() {
		
		if (App.shared().network()) {
			this.setupInputsFromPubkeys()
		} else {
			setTimeout(() => {
				this.setupInputsFromPubkeys()
			})
		}
		
		return this
	},

	// ids

	senderId: function() {
		if (!App.shared().network()) { return null }
		var senderId = App.shared().network().idWithPublicKeyString(this.senderPublicKeyString())      
		return senderId
	},
	
	receiverId: function() {
		if (!App.shared().network()) { return null }
        var receiverId = App.shared().network().idWithPublicKeyString(this.receiverPublicKeyString())
		return receiverId
	},

	// set pubkeys from inputs
	
	/*
	setupSenderPubkeyFromInput: function() { // called on edits
		if (!App.shared().network()) { return null }
		var senderId = App.shared().network().idWithNameOrPubkey(this.fromContact())      
		this.setSenderPublicKeyString(senderId ? senderId.publicKeyString() : null)
	},
	*/
	
	setupReceiverPubkeyFromInput: function() { // called on edits
        var receiverId = App.shared().network().idWithNameOrPubkey(this.toContact())
		this.setReceiverPublicKeyString(receiverId? receiverId.publicKeyString() : null)
		return this
	},
	
	setupInputsFromPubkeys: function() { // called on load from store
		//console.log(this.type() + " setupInputsFromPubkeys this.senderPublicKeyString() = " + this.senderPublicKeyString())
		
		//if (!App.shared().network()) { return null }
		// if pubkey matches a contact name, set to name
		// otherwise, set to the pubkey
		
		var senderId = App.shared().network().idWithNameOrPubkey(this.senderPublicKeyString())      
		//console.log(this.type() + " senderId = " + senderId)
		var from = senderId ? senderId.name() : ""
		if (from != this.fromContact()) { this.setFromContact(from) }
	
		var receiverId = App.shared().network().idWithNameOrPubkey(this.receiverPublicKeyString())      
		var to = receiverId ? receiverId.name() : ""
		if (to != this.toContact()) { this.setToContact(to) }
	},

	duplicate: function() {
		var dup = BMPrivateMessage.clone().setPostDict(this.postDict())
		dup.setIsSent(true)
		return dup
	},


	fromContactNames: function() {
		//console.log("App.shared().network().localIdentityNames() = ", App.shared().network().localIdentityNames())
		return App.shared().network().localIdentityNames()
	},

	toContactNames: function() {
		//return App.shared().network().remoteIdentityNames()
		return App.shared().network().allIdentityNames()
	},

    localIdentity: function() {
        var localId = this.parentNodeOfType("BMLocalIdentity")
        //console.log("localId = ", localId)
        assert(typeof(localId) != null)
		assert(localId.type() == "BMLocalIdentity")
        return localId
    },

	
	validateFromAddress: function() {
		if (this.localIdentity()) {
			this.setFromContact(this.localIdentity().name())
		}
	},
    
	localIdentityIsSender: function() {
	    if (this.senderId()) {
		    return this.senderPublicKeyString() == this.localIdentity().publicKeyString()
		}
		return false
	},
    
    title: function() {
		if (!this.localIdentityIsSender()) {
			return this.localIdentity().title()
		} else {
			var s = this.toContact()
	        if (s) {
	            return s
	        }			
	        return "No recipient"
		}
    },
    
    subtitle: function () {
        var s = this.subject()
        if (s) {
            return s
        }
        return "No subject"
    },   
    
    // ------------------------

    postDict: function() {
		var contentDict = {}
		contentDict.subject = this.subject()
		contentDict.body = this.body()
		var encryptedData = this.senderId().encryptMessageForReceiverId(JSON.stringify(contentDict), this.receiverId()).toString()
				
        var dict = {}
		dict.type = "BMPrivateMessage"
		dict.senderPublicKey   = this.senderPublicKeyString()
		dict.receiverPublicKey = this.receiverPublicKeyString()
		dict.encryptedData = encryptedData
		//dict.signature = senderId.signatureForMessageString(dict.toJsonStableString().sha256String())

        return dict
    },

	canSend: function() {
		return (this.senderPublicKeyString() != null) && (this.receiverPublicKeyString() != null)
	},

	setObjMsg: function(objMsg) {
		this._obkMsg = objMsg
		assert(objMsg.senderPublicKeyString())
		assert(objMsg.receiverPublicKeyString())
		console.log(this.typeId() + ".setObjMsg()")
		console.log("objMsg.senderPublicKeyString() = ", objMsg.senderPublicKeyString())
		console.log("objMsg.receiverPublicKeyString() = ", objMsg.receiverPublicKeyString())
		this.setSenderPublicKeyString(objMsg.senderPublicKeyString())
		this.setReceiverPublicKeyString(objMsg.receiverPublicKeyString())
		this.setPostDict(objMsg.data())
		return this
	},

	setPostDict: function(dict) {
		
		//console.log("dict.senderPublicKey = ", dict.senderPublicKey)
		//console.log("dict.receiverPublicKey = ", dict.receiverPublicKey)
		
		//this.setSenderPublicKeyString(dict.senderPublicKey)
		//this.setReceiverPublicKeyString(dict.receiverPublicKey)
		
		this.setCanReceive(true)
		
		var senderId   = this.senderId()
		var receiverId = this.receiverId()
		
		if (!senderId) {
			console.log("no contact for senderPublicKey '" + dict.senderPublicKey + "'")
			this.setCanReceive(false)
			return this
		}
				
		if (!receiverId) {
			this.setCanReceive(false)
			console.log("no identity for receiverPublicKey '" + dict.receiverPublicKey + "'")
			return this
		}
		
		//console.log(this.type() + ".setPostDict(" + JSON.stringify(dict, null, 2) + ")")

		
		this.setFromContact(senderId.name())
		this.setToContact(receiverId.name())
		
		//console.log("dict = ", dict)
		//console.log("dict.encryptedBuffer = ", dict.encryptedData)
		//console.log("receiverId = ", receiverId.type())
		
		if (receiverId.hasPrivateKey()) {
			var decryptedData = receiverId.decryptMessageFromSenderPublicKeyString(dict.encryptedData, dict.senderPublicKey)
		
			if (!decryptedData) {
				this.setSubject("[INVALID KEY]")
				this.setBody("[INVALID KEY]")
			} else {
				//console.log("decryptedData = ", decryptedData)
				var contentDict = JSON.parse(decryptedData)
				//console.log("contentDict = ", contentDict)
				this.setSubject(contentDict.subject)
				this.setBody(contentDict.body)
			}
		} else {
			this.setSubject("[ENCRYPTED]")
			this.setBody("[ENCRYPTED]")			
		}
		
		
		return this
	},

	place: function() {
		console.log("placing " + this.type() + " from '" + this.senderId().name() + "' to '" + this.receiverId().name() + "'")
		
		if(!this.canReceive()) {
			console.log("can't receive message")
			return
		}

		this.isSent(true)
		
		if (this.receiverId()) {
			this.receiverId().handleMessage(this.duplicate())
		}
		
		if (this.senderId()) {
         	this.senderId().handleMessage(this.duplicate())	
		}
		
		return this
	},
	
	canEdit: function() {
		return !this.isSent()
	},

    send: function () {
        var objMsg = BMObjectMessage.clone()

        objMsg.setSenderPublicKeyString(this.senderPublicKeyString())
        objMsg.setReceiverPublicKeyString(this.receiverPublicKeyString())

        objMsg.setData(this.postDict())
		objMsg.makeTimeStampNow()
    	/*
		objMsg.powObj().setTargetDifficulty(17)
        objMsg.asyncFindPowAndSend()
		*/
		objMsg.signWithSenderId(this.senderId())
		objMsg.send()
        this.delete()
    },
})
