
/*
BMGetDataItem = BMNode.extend().newSlots({
    type: "BMGetDataItem",
    hash: null,
    fromMsg: null,
}).setSlots({
})
*/

"use strict"

window.BMMessages = BMStorableNode.extend().newSlots({
    type: "BMMessages",
    changeNote: null,
    network: null,
    // TODO: deal with timeouts
    globalMinDifficulty: 16,
	debug: false,
	placedSet: null,
	deletedSet: null,
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
		this.setShouldStore(true)
		this.setShouldStoreSubnodes(true)
		
        this.setTitle("Messages")
        this.setChangeNote(NotificationCenter.shared().newNotification().setSender(this).setName("newMessagesMessage"))

        this.setDeletedSet(BMDatedSet.clone())
        this.addStoredSlot("deletedSet")

        this.setPlacedSet(BMDatedSet.clone())
        this.addStoredSlot("placedSet")
        
        this.setNoteIsSubnodeCount(true)
		this.setNodeMinWidth(180)
		
		this.createSubnodeIndex()
    },
    
    subnodeProto: function() {
        return BMObjectMessage
    },

	didLoadFromStore: function() {
	    BMStorableNode.didLoadFromStore.apply(this)
	    
		//console.log(this.type() + " didLoadFromStore subnodes length = ", this.subnodes().length)
		//this.reindexSubnodes()
		
		// these need to wait until after the initial store load is complete
		setTimeout(() => {
			this.removeMessagesNotMatchingIdentities()
			this.handleAllMessages()
		}, 0)
		
		return this
	},
	
    // --- deletedSet -----------------------------------------

    deleteObjMsg: function(objMsg) {
        var h = objMsg.hash()
        this.deletedSet().addKey(h)
        this.placedSet().removeKey(h)
        //this.getQueueSet().removeKey(h)
        this.removeSubnodeWithHash(h) 
        return this
    },
    
    hasDeletedHash: function(h) {
        return this.deletedSet().hasKey(h)
    },
    
    // --------------------------------------------
    
    messages: function () {
        return this.subnodes()
    },

    notifyChange: function() {
        this.changeNote().post()
        return this
    },
    
    validateMsg: function(objMsg) {
        if (this.hasSubnodeWithHash(objMsg.hash())) {
            console.warn("attempt to add duplicate message ", objMsg.msgHash())
            return false
        }

   		if(!objMsg.hasValidSignature()) {
            console.warn("invalid signature on message ", objMsg.msgHash())
   		    return false
   		}
   		return true
    },
        
    addMessage: function(objMsg) { // validate and broadcast

        if (!this.validateMsg(objMsg)) {
			console.log(this.type() + " INVALID MESSAGE")
            return false
        }
        
        this.addSubnode(objMsg)
        
		setTimeout(() => {
            this.handleMessage(objMsg)
	        this.broadcastMessage(objMsg)
		}, 10)
        
        return true
    },
    
    handleMessage: function(objMsg) {
        this.network().localIdentities().handleObjMsg(objMsg)
    },

	handleAllMessages: function() {
		this.messages().forEach((objMsg) => {
			this.handleMessage(objMsg)
		})
	},

	addSubnode: function(msg) {
		//console.log(this.type() + " addSubnode " + msg.pid())
		BMStorableNode.addSubnode.apply(this, [msg])
        this.notifyChange()
		return this
	},

	broadcastMessage: function(msg) {
	    // tell peers
	    var peers = this.network().connectedRemotePeers()
	    console.log("broadcasting to " + peers.length + " peers")
	    peers.forEach(function (peer) {
	        peer.addedObjectMsg(msg)
	    })	
	},
    
    removeMessage: function(msg) {
		this.removeSubnode(msg)
        return this
    },

    
    // handling inv (inventory) messages, immediately respond with BMGetDataMessage for missing hashes

    inv: function(invMsg) {
        var remoteInv = invMsg.data()        
        var getMsg = BMGetDataMessage.clone().setRemotePeer(invMsg.remotePeer())
        
        remoteInv.forEach( (h) => {
            if (this.needsHash(h)) {
                getMsg.addHash(h)
                //this._queue[h] = true
            }
        })
        
        if (getMsg.data().length) {
            getMsg.send()
        }
    },
    
    // handling object messages
    
    network: function() {
        return this.parentNode()
    },
    
    object: function(msg) {
        var h = msg.msgHash()
        
        // remove from the queue
        //delete this._queue[h]
        
        this.addMessage(msg)
    },
    
    getData: function(msg) {
        msg.data().forEach((aHash) => {
            var objMsg = this.message(aHash)
            if (objMsg) {
                msg.remotePeer().sendMsg(objMsg)
            }
        })
    },
    
    // peer connect
    
    onRemotePeerConnect: function(remotePeer) {
        // send inv
        var invMsg = this.currentInvMsg()

        this.log("onRemotePeerConnect send inv " + invMsg.data().length)

        if (invMsg.data().length) {
            remotePeer.sendMsg(invMsg)
        }
    },

    invMsgForMessages: function (msgs) {
        var invMsg = BMInvMessage.clone()
        msgs.forEach( (objMsg) => {
            invMsg.addMsgHash(objMsg.msgHash())
        })
        return invMsg
    },
    
    currentInvMsg: function () {
        return this.invMsgForMessages(this.messages())
    },
    
    messagesMatchingBloom: function (aBloomFilter) {
        return this.messages().select((objMsg) => {
			return aBloomFilter.contains(objMsg.senderPublicKeyString())
        })
    },

    currentInvMsgForBloom: function (aBloomFilter) {
        return this.invMsgForMessages(this.messagesMatchingBloom(aBloomFilter))
    },

	removeMessagesNotMatchingIdentities: function() {
		// this gets slow for large msg count but target is short term
		// ephemeral messages for now 
		
		var pubkeys = BMNetwork.shared().allIdentityPublicKeyStrings()
		var count = 0
				
		this.messages().copy().forEach( (objMsg) => {
			//console.log("objMsg: ", objMsg)
			var senderPK = objMsg.senderPublicKeyString()
            if (!pubkeys.contains(senderPK)) {
				this.removeMessage(objMsg)
				count ++
				console.log("no match for sender " + senderPK)
			} else {
				//console.log("matched sender " + senderPK)
			}
        })

		if (count) {
			this.log("removeMessagesNotMatchingIdentities removed " + count + " messages")
		}
	
		return this
	},
})
