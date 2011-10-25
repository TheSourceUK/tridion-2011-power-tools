﻿Type.registerNamespace("PowerTools.Popups");

PowerTools.Popups.PagePublisher = function () {
    Type.enableInterface(this, "PowerTools.Popups.PagePublisher");
    this.addInterface("Tridion.Cme.View");


    var p = this.properties;
    p.processId = null;
    p.structureId = null;
    p.pollInterval = 500; //Milliseconds between each call to check the status of a process

    // Params: items, republish, userWorkflow
    p.params = null;
    // Items to publish list
    p.itplHeight = null;
    p.isItplVisible = true;
    p.itpList = null;
    p.itpListHeadXml = null;
    // Priority dropdown
    p.isPddLoaded = false;
    // Target types domain list
    p.targetTypesListId;
    // Selected target type ids
    p.selectedTts = [];

};


PowerTools.Popups.PagePublisher.DROPDOWN_HEAD_PATH = $config.expandEditorPath("/Xml/ListDefinitions/PublishQueueDropdown-head.xml", $const.CMEEditorName);
PowerTools.Popups.PagePublisher.TARGETTYPE_HEAD_PATH = $config.expandEditorPath("/Xml/ListDefinitions/TargetTypeList-head.xml", $const.CMEEditorName);
PowerTools.Popups.PagePublisher.ITEMSTOPUBLISH_HEAD_PATH = $config.expandEditorPath("/Xml/ListDefinitions/ItemsToPublishList-head.xml", $const.CMEEditorName);


PowerTools.Popups.PagePublisher.prototype.initialize = function () {

    $log.message("Initializing page publisher...");
    this.callBase("Tridion.Cme.View", "initialize");

    var p = this.properties;
    var c = p.controls;

    p.params = window.dialogArguments ? window.dialogArguments : null;
    p.structureId = $url.getHashParam("structureId");


    // Publish target select list
    c.TargetTypeList = $controls.getControl($("#TargetTypeList"), "Tridion.Controls.List");
    $evt.addEventHandler(c.TargetTypeList, "select", this.getDelegate(this._onTargetTypeListSelectionChanged));
    $evt.addEventHandler(c.TargetTypeList, "deselect", this.getDelegate(this._onTargetTypeListSelectionChanged));

    // Priority drop down
    c.Priority = $controls.getControl($("#Priority"), "Tridion.Controls.Dropdown");

    // Exe and close
    c.ExecuteButton = $controls.getControl($("#ExecuteButton"), "Tridion.Controls.Button");
    c.CloseButton = $controls.getControl($("#CloseDialog"), "Tridion.Controls.Button");
    $evt.addEventHandler(c.ExecuteButton, "click", this.getDelegate(this._onExecuteButtonClicked));
    $evt.addEventHandler(c.CloseButton, "click", this.getDelegate(this._onCloseButtonClicked));

    // Init controls
    this._setupControls();
    //this._toggleItemsToPublish();
    // Start loading data
    this._asyncLoadTargetTypeListHeader();

};

PowerTools.Popups.PagePublisher.prototype._onExecuteButtonClicked = function () {


    $j('#CloseDialog').hide();

    var p = this.properties;


    //-Local directory on the server
    var localDirectory = $j("#Main_SourceFolder").val();

    var onSuccess = Function.getDelegate(this, this._onExecuteStarted);
    var onFailure = null;
    var context = null;

    // pass in structure uri, publishing target uri
    PowerTools.Model.Services.PagePublisher.Execute("tcm:xx-yy-zz", "tcm:xx-yy-zz");

    var dialog = $j("#dialog");
    var win = $j(window);

    //Get the screen height and width
    var maskHeight = $j(document).height();
    var maskWidth = win.width();

    //Set height and width to mask to fill up the whole screen
    $j('#mask').css({ 'width': maskWidth, 'height': maskHeight }).fadeIn(1000).fadeTo("slow", 0.8);

    //Get the window height and width

    var winH = win.height();
    var winW = win.width();

    //Set the popup window to center
    dialog.css({ "top": (winH / 2 - dialog.height() / 2),
        "left": (winW / 2 - dialog.width() / 2)
    }).fadeIn(2000);
};

PowerTools.Popups.PagePublisher.prototype._onCloseButtonClicked = function () {
    $j('#mask, .window').hide();
    $j('#ProgressStatus').html("");
    $j('#ProgressBar').css({ 'width': 0 + '%', 'display': 'none' });
};



PowerTools.Popups.PagePublisher.prototype._updateProgressBar = function (process) {

    $j('#ProgressStatus').html(process.Status);
    $j('#ProgressBar').css({ 'width': process.PercentComplete + '%', 'display': 'block' });
}

PowerTools.Popups.PagePublisher.prototype._handleStatusResponse = function (result) {
    var p = this.properties;

    p.processId = result.Id;

    this._updateProgressBar(result);

    if (result.PercentComplete < 100) {
        this._pollStatus(p.processId);
    }
    else {
        $j('#ProgressStatus').html(result.Status);
        $j('#CloseDialog').show();
        p.processId = ""
    }
}

PowerTools.Popups.PagePublisher.prototype._pollStatus = function (id) {
    var onFailure = null;
    var onSuccess = Function.getDelegate(this, this._handleStatusResponse);
    var context = null;

    var callback = function () {
        $log.debug("Checking the status of process #" + id);
        PowerTools.Model.Services.PagePublisher.GetProcessStatus(id, onSuccess, onFailure, context, false);
    };

    setTimeout(callback, this.properties.pollInterval);
}

PowerTools.Popups.PagePublisher.prototype._onExecuteStarted = function (result) {
    if (result) {
        this._pollStatus(result.Id);
    }
};


// Publishing related stuff :)

/*
Dev notes: 
Checks if the action is a publish or unpublish and specifies the button text accordingly.


*/

PowerTools.Popups.PagePublisher.prototype._setupControls = function _setupControls() {
    var p = this.properties;
    var c = p.controls;

    $log.message("page publisher set up controls entered");

    // Disable some buttons
    c.ExecuteButton.disable();
    var publishLabel = $localization.getEditorResource("Publish");
    document.title = publishLabel;
    c.ExecuteButton.setText(publishLabel);

    var dropdownHeadPath = $config.expandBasePath(PowerTools.Popups.PagePublisher.DROPDOWN_HEAD_PATH + "?forView=" + Tridion.Core.Configuration.CurrentView + "&forControl=" + this.properties.controls.Priority.getId());
    $xml.loadXmlDocument(dropdownHeadPath, this.getDelegate(this._dropdownHeadLoaded), this.getDelegate(this._dropdownHeadLoadFailed));
}



// =========================================================================================================================
/**
* Handles the list selection change event.
* @param {Tridion.Core.Event} event. The event is the event fired from the list.
* @private
*/
PowerTools.Popups.PagePublisher.prototype._onTargetTypeListSelectionChanged = function _onTargetTypeListSelectionChanged(e) {
    var p = this.properties;
    var c = p.controls;
    var eventName = e.name;
    var selection = (e && e.data) ? e.data.items : null;
    var enable = false;

    // Update selected tt array	
    var checkBoxes = p.checkBoxView.getSelectedCheckBoxes();
    for (var checkboxKey in checkBoxes) {
        var tcmId = checkBoxes[checkboxKey];
        if (tcmId) {
            enable = true;
            break;
        }
    }

    if (enable) {
        c.ExecuteButton.enable();
    }
    else {
        c.ExecuteButton.disable();
    }
};


// =======================================================================================================

/**
* Asynchronously load Target types list header.
*/
PowerTools.Popups.PagePublisher.prototype._asyncLoadTargetTypeListHeader = function _asyncLoadTargetTypeListHeader() {
    var p = this.properties;
    $log.message("PagePublisher - loading target list header");
    // Continue loading target types list header
    var ttListHeadPath = $config.expandBasePath(PowerTools.Popups.PagePublisher.TARGETTYPE_HEAD_PATH + "?forView=" + Tridion.Core.Configuration.CurrentView + "&forControl=" + this.properties.controls.TargetTypeList.getId());
    alert(ttListHeadPath);
    // Async load
    $xml.loadXmlDocument(ttListHeadPath, this.getDelegate(this._ttListHeadLoaded), this.getDelegate(this._ttListHeadLoadFailed));
};


// =======================================================================================================


/**
* Handles the definitions XML document load event.
* @param {XMLDocument} headXml Definitions XML document.
*/
PowerTools.Popups.PagePublisher.prototype._ttListHeadLoaded = function _ttListHeadLoaded(headXml) {
    // Save target type list header
    this.properties.ttListHeadXml = headXml;
    // Load target type list
    this._asyncLoadTargetTypeList();
};


// =======================================================================================================


/**
* Handles the definitions XML document load faild event.
*/
PowerTools.Popups.PagePublisher.prototype._ttListHeadLoadFailed = function _ttListHeadLoadFailed() {
    $log.message("PowerTools.Popups.PagePublisher._ttListHeadLoadFailed");
};

$display.registerView(PowerTools.Popups.PagePublisher);

// =======================================================================================================


/**
* Asynchronously load Target types list header.
*/
PowerTools.Popups.PagePublisher.prototype._asyncLoadTargetTypeListHeader = function _asyncLoadTargetTypeListHeader() {
    var p = this.properties;
    // Continue loading target types list header
    var ttListHeadPath = $config.expandBasePath(PowerTools.Popups.PagePublisher.TARGETTYPE_HEAD_PATH + "?forView=" + Tridion.Core.Configuration.CurrentView + "&forControl=" + this.properties.controls.TargetTypeList.getId());
    // Async load
    $xml.loadXmlDocument(ttListHeadPath, this.getDelegate(this._ttListHeadLoaded), this.getDelegate(this._ttListHeadLoadFailed));
};

// =======================================================================================================

/**
* Asynchronously load target types list header.
*/
PowerTools.Popups.PagePublisher.prototype._asyncLoadTargetTypeList = function _asyncLoadTargetTypeList() {
    var p = this.properties;
    var c = p.controls;

    // Show loading
    c.TargetTypeList.setLoading(true);

    // Async handler
    var self = this;
    var populateList = function _asyncLoadTargetTypeList$listLoaded(event) {
        var ttList = self.getListTargetTypes();
        $evt.removeEventHandler(ttList, "load", populateList);
        // Get a local threaded xml document
        var xml = $xml.getNewXmlDocument(ttList.getXml());
        // Add Icon attribute if it's not there
        var nodes = $xml.selectNodes(xml, "/tcm:*/tcm:Item");
        if (nodes) {
            for (var i = 0, cnt = nodes.length; i < cnt; i++) {
                if (!nodes[i].getAttribute("Icon")) {
                    nodes[i].setAttribute("Icon", $const.ItemType.TARGET_TYPE.replace(/tcm:/i, "T"));
                }
                else {
                    // If one is there most probably all of them are there
                    break;
                }
            }
        }

        // restore previous settings after the list has been drawn
        $evt.addEventHandler(c.TargetTypeList, "draw", self.getDelegate(self._applyTargetTypePreferences));

        // Draw the list
        c.TargetTypeList.draw(xml, p.ttListHeadXml);
        c.TargetTypeList.setView(Tridion.Controls.List.ViewType.CHECKBOXES);
        p.checkBoxView = c.TargetTypeList.getCurrentView();

        // Stop showing loading
        c.TargetTypeList.setLoading(false);

    };

    // Try load target type list from model
    var ttList = this.getListTargetTypes();
    if (ttList) {
        if (ttList.isLoaded(true)) {
            populateList();
        }
        else {
            $evt.addEventHandler(ttList, "load", populateList);
            ttList.load();
        }
    }
};


// =======================================================================================================


/**
* Gets Target Types List. 
* @returns {Object} Target Types  List. 
*/
PowerTools.Popups.PagePublisher.prototype.getListTargetTypes = function getListTargetTypes() {
    var p = this.properties;
    if (!p.targetTypesListId) {
        var publication = this._getPublicationFromParams();
        if (publication) {
            var list = publication.getListTargetTypes($const.ColumnFilter.ID);
            p.targetTypesListId = list.getId();
            return list;
        }
    }
    else {
        return $models.getItem(p.targetTypesListId);
    }
};


// =======================================================================================================


/**
* Gets item publication.
* @returns {Tridion.ContentManager.Publication} Using item <c>Tridion.ContentManager.Publication</c>.
* @private 
*/
PowerTools.Popups.PagePublisher.prototype._getPublicationFromParams = function _getPublicationFromParams() {
    var p = this.properties;
    var itemId = p.structureId;
    if (itemId) {
        var item = $models.getItem(itemId);
        if (item) {
            return item.getPublication();
        }
    }
    return null;
};




/* Populate drop down priority functions */

// ======================================================================================================================================

/**
* Handles the definitions XML document load event.
* @param {XMLDocument} headXml Definitions XML document.
*/
PowerTools.Popups.PagePublisher.prototype._dropdownHeadLoaded = function _dropdownHeadLoaded(headXml) {
    // Save dropdown header
    this.properties.dropdownHeadXml = headXml;
    // Update priority dropdown
    this._populatePriorityDropdown();
};

// ========================================================================================================================

/**
* Handles the definitions XML document load faild event.
*/
PowerTools.Popups.PagePublisher.prototype._dropdownHeadLoadFailed = function _dropdownHeadLoadFailed() {
    $log.message("PowerTools.Popups.PagePublisher._dropdownHeadLoadFailed");
};

// ========================================================================================================================


/**
* Populates Publish Priorities dropdown
* @private
*/
PowerTools.Popups.PagePublisher.prototype._populatePriorityDropdown = function _populatePriorityDropdown() {
    var p = this.properties;
    var list = Tridion.ContentManager.Model.getListPublishPriorities();
    this._populateDropdown(p.controls.Priority, list, p.dropdownHeadXml);
};



/**
* Populates dropdown
* @param {Tridion.Controls.Dropdown} dropdown Dropdown to populate.
* @param {Tridion.ContentManager.List} list List items.
* @param {XMLDocument} head Definitions XML document. 
* @private
*/
PowerTools.Popups.PagePublisher.prototype._populateDropdown = function _populateDropdown(dropdown, list, head) {
    var p = this.properties;
    if (!dropdown || !list || !head) {
        return;
    }
    // Async handler
    var populateDropdown = function $_populateDropdown$listLoaded(event) {
        // Set dropdown options
        var xml = $xml.getNewXmlDocument(list.getXml());
        dropdown.draw(xml, head);
        // Set as loaded
        p.isPddLoaded = true;
        // One time, set default value
        var node = $xml.selectSingleNode(xml, "//tcm:Value[last()-1]");
        if (node) {
            dropdown.setValue(node.getAttribute("ID"), node.getAttribute("Title"));
        }
    };

    if (list.isLoaded(true)) {
        populateDropdown();
    }
    else {
        $evt.addEventHandler(list, "load", populateDropdown);
        list.load();
    }
};

