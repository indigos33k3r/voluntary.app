/*

*/

BMStunServers = BMStorableNode.extend().newSlots({
    type: "BMStunServers",
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
		this.setShouldStore(true)
        this.setTitle("STUN Servers")
        this.setNoteIsItemCount(true)
        this.setNodeMinWidth(270)
        this.addAction("add")
		this.addItemsIfAbsent(this.bootStrapServers())
    },
    
    addServer: function (aServer) {
        return this.addItem(aServer)
    },
    
    servers: function () {
        return this.items()
    }, 

	defaultOptions: function() {
		return {'iceServers': [
		    {url:'stun:stun01.sipphone.com'},
		    {url:'stun:stun.ekiga.net'},
		    {url:'stun:stun.fwdnet.net'},
		    {url:'stun:stun.ideasip.com'},
		    {url:'stun:stun.iptel.org'},
		    {url:'stun:stun.rixtelecom.se'},
		    {url:'stun:stun.schlund.de'},
		    {url:'stun:stun.l.google.com:19302'},
		    {url:'stun:stun1.l.google.com:19302'},
		    {url:'stun:stun2.l.google.com:19302'},
		    {url:'stun:stun3.l.google.com:19302'},
		    {url:'stun:stun4.l.google.com:19302'},
		    {url:'stun:stunserver.org'},
		    {url:'stun:stun.softjoys.com'},
		    {url:'stun:stun.voiparound.com'},
		    {url:'stun:stun.voipbuster.com'},
		    {url:'stun:stun.voipstunt.com'},
		    {url:'stun:stun.voxgratia.org'},
		    {url:'stun:stun.xten.com'},
		]}	
	},

    bootStrapServers: function (dict) {
		var dicts = this.defaultOptions().iceServers
		return dicts.map((dict) => {
        	return BMStunServer.clone().setIceEntry(dict) 
		})
    },

	iceEntries: function() {
	    if (this.servers()) {
		    return this.servers().map((server) => { return server.asIceEntry() })
	    } else {
	        console.log(this.type() + " WARNING: using defaultOptions")
	        return this.defaultOptions()
	    }
	},
	
	peerOptionsDict: function() {
		var dict = { 'iceServers': this.iceEntries() }
		//console.log("peerOptionsDict: " + JSON.stringify(dict))
		return dict
	},
})
