
BMClassifiedPosts = BMStorableNode.extend().newSlots({
    type: "BMClassifiedPosts",
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setTitle("My Posts")
        this.setPid("_myPosts")
        this.setActions(["add"])
        this.setSubnodeProto(BMClassifiedPost)
        this.setNoteIsItemCount(true)
    },
})
