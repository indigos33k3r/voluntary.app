/*

	base row view, just knows about selected, selectable and colors
*/

BrowserRow = NodeView.extend().newSlots({
    type: "BrowserRow",
    isSelected: false,
    isSelectable: true,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setOwnsView(false)
        this.setIsRegisteredForClicks(true)
        this.turnOffUserSelect()
        return this
    },
    
    column: function () {
        return this.parentView()
    },
    
    updateSubviews: function() {
        this.setBackgroundColor(this.currentBgColor())
        return this
    },
    
    // -------------
    
    onDidEdit: function (changedView) {   
        //console.log("onDidEdit")
        this.syncToNode()
    },
    
	// --- sync ---
	
    syncToNode: function () {   
        //console.log("syncToNode")
        this.node().setTitle(this.titleView().innerHTML())
        this.node().setSubtitle(this.subtitleView().innerHTML())
        this.node().tellParentNodes("onDidEditNode", this.node())   
        this.node().markDirty()
        return this
    },

    syncFromNode: function () {
        this.updateSubviews()
        return this
    },
    
    onTabKeyUp: function() {
        console.log(this.type() + " onTabKeyUp")
    },

	// --- colors ---
	
	currentBgColor: function() {
		if (this.isSelected()) {
			return this.selectedBgColor()
		} 
		
		return this.unselectedBgColor()
	},

    unselectedBgColor: function() {
        return "transparent"
    },
    
    selectedBgColor: function() {
		if (!this.column()) {
			return "transparent"
		}
        return this.column().selectionColor()
    },

	// --- selecting ---
    
    onClick: function (anEvent) {
        if (this.isSelectable()) {
            this.select()
            //console.log(this.type() + " tellParentViews didClickRow")
            this.tellParentViews("didClickRow", this)
        }
		return false
    },

    setIsSelected: function (aBool) {
		if (this._isSelected != aBool) {
	        this._isSelected = aBool
        
	        if (aBool) {
	            this.showSelected()    
	        } else {
	            this.showUnselected() 
	        }
        
	        this.updateSubviews()
		}
        return this
    },

	showSelected: function() {
        //this.setBorderTop("1px solid #333")
        //this.setBorderBottom("1px solid #444")
        this.setOpacity(1)
		return this		
	},
	
	showUnselected: function() {
        //this.setBorderTop("1px solid transparent")
        //this.setBorderBottom("1px solid transparent")
        this.setOpacity(0.7)		
	},
    
    select: function() {
        this.setIsSelected(true)		
        return this
    },

    unselect: function() {
        this.setIsSelected(false)
        return this
    },

})
