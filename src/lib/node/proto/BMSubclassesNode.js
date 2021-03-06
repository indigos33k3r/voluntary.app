"use strict"

/*
	BMArchiveNode
	Way to compose 
*/

window.BMSubclassesNode = BMNode.extend().newSlots({
    type: "BMSubclassesNode",
    protoValue: Proto,
}).setSlots({
    init: function () {
        BMNode.init.apply(this)
        //this.setViewClassName("GenericView")
        //this.setViewClassName("BMDataStoreRecordView")
        //this.addAction("delete")
        this.setNodeMinWidth(300)
        this.setNoteIsSubnodeCount(true)
    },

    title: function () {
        return "subclasses"
    },

    subtitle: function () {
        return null
    },

    setupSubnodes: function() {
        var childProtos = this.protoValue().childProtos()
        var childNodes = childProtos.map((childProto) => {
            return BMProtoNode.clone().setProtoValue(childProto);
        })

        this.setSubnodes(childNodes);
        return this
    },

    prepareToAccess: function () {
        if (this._subnodes.length == 0) {
            this.setupSubnodes()
        }
    },
})

