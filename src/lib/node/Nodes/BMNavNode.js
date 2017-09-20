"use strict"

/*
    for fixed navigation use 
    
    doesn't replace ubnodes on read 
    instead matches with subnode titles and sends appropriate setNodeDict to them
    
    NOTE: have to make sure we set a "title" property when saving so we can do this
*/

window.BMNavNode = BMStorableNode.extend().newSlots({
    type: "BMNavNode",
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        //this.setLoadsUnionOfChildren(true)
    },
    
    /*
    nodeChildrenDict: function () {
        // makes sure we add a title filed on the child dicts
        
        return this.subnodes().map( (child) => { 
            if (!child.nodeDict) {
                var s = this.type() + " nodeChildrenDict can't serialize " + child.type()
                console.log("WARNING: " + s)
                //throw s
            }
            var dict =  child.nodeDict()
            dict.title = child.title()
            return dict
         })
    },

    setNodeDictForChildren: function (aDict) {
        // instead of creating new children, map dicts to currenct children with 
        // same title
                
        if (aDict.children) {
            var subnodes = aDict.children.map(function (childDict) {
                var title = childDict.title
                var subnode = this.subnodeWithTitle(title)
                if (subnode) {
                    subnode.setNodeDict(childDict)
                }
                return subnode
            })            
        }
    },
    */  
})
