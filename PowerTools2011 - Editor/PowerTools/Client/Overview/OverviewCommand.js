﻿Type.registerNamespace("PowerTools2011.Commands");

PowerTools2011.Commands.Overview = function ()
{
	Type.enableInterface(this, "PowerTools2011.Commands.Overview");
	this.addInterface("Tridion.Cme.Command", ["Overview"]);

	this.addInterface("PowerTools2011.ToolBase", ["Overview"]);
};

PowerTools2011.Commands.Overview.prototype.isAvailable = function (selection)
{
	return true;
};

PowerTools2011.Commands.Overview.prototype.isEnabled = function (selection)
{
	return true;
};

PowerTools2011.Commands.Overview.prototype._execute = function (selection)
{
//	var uriSelection = selection.getItem(0);
//	var PopUpUrl = $ptUtils.expandPath("/powertools/client/example/example.aspx") + "?id=" + uriSelection;
//	var popup = $popup.create(PopUpUrl, "toolbar=no,width=600,height=300,resizable=false,scrollbars=false", null);
//	popup.open();
};
