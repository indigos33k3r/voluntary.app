"use strict"

window.BrowserFieldRow = BrowserRow.extend().newSlots({
    type: "BrowserFieldRow",
    allowsCursorNavigation: false,
}).setSlots({
    init: function () {
        BrowserRow.init.apply(this)
        this.setIsSelectable(false) 
        this.makeCursorDefault()
        this.setSpellCheck(false)
		
        this.styles().setToBlackOnWhite()
		
        return this
    },
    
    updateSubviews: function() {   
	    BrowserRow.updateSubviews.apply(this)
	
        var node = this.node()

        if (node && node.nodeMinHeight()) {
            var e = this.element()
            if (node.nodeMinHeight() == -1) {
                
                this.setHeight("auto")
                //e.style.height = "auto"
                
                this.setPaddingBottom("calc(100% - 20px)")
                //e.style.paddingBottom = "calc(100% - 20px)";

            } else {
                //e.style.height = node.nodeMinHeight() + "px"
                this.setHeight(this.pxNumberToString(node.nodeMinHeight()))
            }
        }
        
        //this.applyStyles()
        
        return this
    },
 
})
