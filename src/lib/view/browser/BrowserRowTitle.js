BrowserRowTitle = DivView.extend().newSlots({
    type: "BrowserRowTitle",
	isSelected: false,
	selectedColor: "white",
	unselectedColor: "",
}).setSlots({
    init: function () {
        DivView.init.apply(this)
        this.setInnerHTML("title")
        this.turnOffUserSelect()
		//this.setUnfocusOnEnterKey(true)
		this.setIsRegisteredForKeyboard(true)
		this.setDisplay("inline-block")
        return this
    },

    /*
	updateSubviews: function() {
		 if (this.isSelected()) {
			this.setColor("#CBCBCB")
		}
	},
	*/
	
	setIsSelected: function(aBool) {
	    this._isSelected = aBool
	    this.updateColors()
	    return this
	},
	
	updateColors: function() {
	    if (this.isSelected()) {
	        this.setColor(this.selectedColor())
	    } else {
	        this.setColor(this.unselectedColor())
	    }
	    return this
	},

    setHasSubtitle: function(aBool) {        
        if (aBool) {
            this.setTop(10)
        } else {
            this.setTop(22)      
        }

        return this
    },

	// --- begin editing when return is hit ------
	// --- remove return characters when editing title -------

	cleanText: function() {
		console.log(this.type() + " cleanText")
		var s = this.innerHTML()
		s = s.replaceAll("<br>", "")
		s = s.replaceAll("<div></div>", "")
		s = s.replaceAll("<div>", "")
		s = s.replaceAll("</div>", "")
		
		this.setInnerHTML(s)
		return this
	},

	onKeyUp: function(event) {
		//console.log(this.type() + " onKeyUp ", event.keyCode)
		
		if (event.keyCode == 13) { // enter key
			//this.setContentEditable(false)
						
			setTimeout(() => {
				this.blur()
				this.cleanText()
				var p = this.element().parentNode.parentNode
				console.log("blurred self and focusing ", p.className)
				p.focus()
			}, 10)
			
			return true
		}
		
        event.preventDefault()
		event.stopPropagation()
        this.tellParentViews("onDidEdit", this)
		return false
		//return DivView.onKeyUp.apply(this, [event])
	},
})
