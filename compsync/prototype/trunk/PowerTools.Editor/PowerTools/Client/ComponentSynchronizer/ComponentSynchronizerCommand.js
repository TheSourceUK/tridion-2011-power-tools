﻿Type.registerNamespace("PowerTools.Commands");

/**
* Implements Component Synchronizer command.
* @constructor
*/
PowerTools.Commands.ComponentSynchronizer = function () {
    Type.enableInterface(this, "PowerTools.Commands.ComponentSynchronizer");
    this.addInterface("Tridion.Cme.Command", ["ComponentSynchronizer"]);
    this.addInterface("PowerTools.ToolBase", ["ComponentSynchronizer"]);
    this._isPopupOpen = false;
};


/**
* Checks wether a command is available or not.
* @param {Tridion.Cme.Selection] selection. The selected items in the list
*/
PowerTools.Commands.ComponentSynchronizer.prototype.isAvailable = function (selection)
{   
    return this._defineEnabled(selection);
};

/**
* Checks wether a command is enabled or not.
* @param {Tridion.Cme.Selection] selection. The selected items in the list
*/
PowerTools.Commands.ComponentSynchronizer.prototype.isEnabled = function (selection)
{
    return this._defineEnabled(selection);
};

/**
* Executes the command.
* @param {Tridion.Cme.Selection] selection. The selected items in the list
*/
PowerTools.Commands.ComponentSynchronizer.prototype._execute = function (selection) {

    if (this._isPopupOpen) {
        return;
    }

    var validSelection = this.isValidSelection(selection);

    if (validSelection) {
        var uriSelection = selection.getItem(0);
        var baseElement = $("#contentsplitter_container");
        var iFrame = $("#CustomPagesFrame");
        var self = this;
        
        var PopUpUrl = $ptUtils.expandPath("/PowerTools/Client/ComponentSynchronizer/ComponentSynchronizer.aspx"); // +"#folderId=" + uriSelection;
        this._popup = $popup.create(PopUpUrl, "toolbar=no,width=750px,height=630px,resizable=false,scrollbars=false", { sel: selection });

        $evt.addEventHandler(this._popup, "unload", this.getDelegate(this._onPopupCanceled));       

        
        this._popup.open();
        this._isPopupOpen = true;

    }
    else {
        var msg = $messages.createMessage("Tridion.Cme.Model.WarningMessage", "SELECTION MUST BE EITHER: ", "- A Schema \r\n - A Component \r\n - A list of Components based on the same Schema \r\n ", true, true);
        $messages.registerMessage(msg);
    }

};


/**
* On Popup Canceled Event. 
* @param {Tridion.Core.Event}. The cancel/unload event.
*/
PowerTools.Commands.ComponentSynchronizer.prototype._onPopupCanceled = function (event) {    
    this._popup.dispose();    
    this._popup = null;    
    this._isPopupOpen = false;
    
}


/**
* On Refresh Button Click. 
* @param {Tridion.Core.Event}. The click event.
*/
PowerTools.Commands.ComponentSynchronizer.prototype.isValidSelection = function (sel) {
    var items = sel.getItems();
    if (items.length > 1) {
        var firstSchema = '';
        for (var i = 0, len = items.length; i < len; i++) {
            
            var itemId = sel.getItem(i);
            var item = $models.getItem(itemId);

            if (item) {
                if (item.getItemType() != $const.ItemType.SCHEMA) {
                    return false;
                }
                if (i == 0) {
                    firstSchema = item.getSchema().getId();
                }
                if (i > 0 && item.getSchema().getId() != firstSchema) {
                    return false;
                }
            }

        }
    }
    return true;
}


/**
* Checks wether the Command is Enabled/Available or not
* @param {Tridion.Cme.Selection] selection. The selected items in the list
*/
PowerTools.Commands.ComponentSynchronizer.prototype._defineEnabled = function (selection) {
    if (!selection) {
        return false;
    }
    var items = selection.getItems();
    if (items.length == 0) {
        //Nothing Selected
        return false;
    } else if (items.length == 1) {
        var itemId = selection.getItem(0);        
        var item = $models.getItem(itemId);
        if (item) {
            if (item.getItemType() != $const.ItemType.SCHEMA && item.getItemType() != $const.ItemType.COMPONENT) {
                return false;
            }
        }
    } else {
        for (var i = 0, len = items.length; i < len; i++) {
            var itemId = selection.getItem(0);
            var item = $models.getItem(itemId);

            if (item) {
                if (item.getItemType() != $const.ItemType.COMPONENT) {
                    return false;
                }
            }
        }
    }
    return true;

}