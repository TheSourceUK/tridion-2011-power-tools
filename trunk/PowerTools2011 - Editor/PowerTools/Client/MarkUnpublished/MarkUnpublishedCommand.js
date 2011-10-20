﻿Type.registerNamespace("PowerTools2011.Commands");

PowerTools2011.Commands.MarkUnpublished = function ()
{
    Type.enableInterface(this, "PowerTools2011.Commands.MarkUnpublished");
    this.addInterface("Tridion.Cme.Command", ["MarkUnpublished"]);
    this.addInterface("PowerTools2011.ToolBase", ["MarkUnpublished"]);
};

PowerTools2011.Commands.MarkUnpublished.prototype.isAvailable = function (selection) {
    //    //Only show the button if a single FOLDER is selected
    //    if (selection.getCount() == 1) {
    //        var itemType = $models.getItemType(selection.getItem(0));
    //        var item = $models.getItem(selection.getItem(0))
    //        if (itemType == $const.ItemType.FOLDER) {
    //            return true;
    //        }
    //    }
    return this._defineEnabled();
};

PowerTools2011.Commands.MarkUnpublished.prototype.isEnabled = function (selection) {
    return this._defineEnabled();
};

PowerTools2011.Commands.MarkUnpublished.prototype._execute = function (selection)
{
    var uriSelection = selection.getItem(0);
    var baseElement = $("#contentsplitter_container");
    var iFrame = $("#CustomPagesFrame");
    var self = this;

    var PopUpUrl = $ptUtils.expandPath("/PowerTools/Client/MarkUnpublished/MarkUnpublished.aspx") + "#folderId=" + uriSelection;
    var popup = $popup.create(PopUpUrl, "toolbar=no,width=600,height=400,resizable=false,scrollbars=false", null);
    popup.open();
};

PowerTools2011.Commands.MarkUnpublished.prototype._defineEnabled = function () {
    var treeView = $controls.getControl($("#DashboardTree"), "Tridion.Controls.FilteredTree");
    var selection = treeView.getSelection().getItem(0);
    //raise error if >1 item selected
    var itemType = $models.getItemType(selection);
    if (itemType == $const.ItemType.FOLDER || itemType == $const.ItemType.STRUCTURE_GROUP ) {
        return true;
    }
    return false;
}