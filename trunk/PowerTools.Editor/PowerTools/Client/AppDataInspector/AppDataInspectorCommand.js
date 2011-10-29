﻿Type.registerNamespace("PowerTools.Commands");

PowerTools.Commands.AppDataInspector = function ()
{
    Type.enableInterface(this, "PowerTools.Commands.AppDataInspector");
    this.addInterface("Tridion.Cme.Command", ["AppDataInspector"]);
    this.addInterface("PowerTools.ToolBase", ["AppDataInspector"]);
};

PowerTools.Commands.AppDataInspector.prototype.isAvailable = function (selection)
{
    return this._defineEnabled(selection);
};

PowerTools.Commands.AppDataInspector.prototype.isEnabled = function (selection)
{
    return this._defineEnabled(selection);
};

PowerTools.Commands.AppDataInspector.prototype._execute = function (selection)
{
    var itemId = this._selectedItem(selection);
    var popUpUrl = $ptUtils.expandPath("/PowerTools/Client/AppDataInspector/AppDataInspector.aspx") + "#itemId=" + itemId;
    var popup = $popup.create(popUpUrl, "toolbar=no,width=600px,height=400px,resizable=false,scrollbars=false", null);
    popup.open();
};

PowerTools.Commands.AppDataInspector.prototype._selectedItem = function (selection)
{
    switch (selection.getCount())
    {
        case 0: // check the Tree selection
            var treeView = $controls.getControl($("#DashboardTree"), "Tridion.Controls.FilteredTree");
            return treeView.getSelection().getItem(0);
            break;

        case 1: // multiple items selected in the main list
            return selection.getItem(0);
            break;

        default:
            return null;
            break;
    }
}

PowerTools.Commands.AppDataInspector.prototype._defineEnabled = function (selection)
{
    return true;
}