/**
 * Visualisation JavaScript. Intended to be run on the client browser of
 * 
 * TODO This code has only been tested on Google Chrome
 * 
 * TODO There is no zoom functionality
 *  * 
 * @author E. Englmeier, A. Dittrich
 */


/*
 * Configuration
 */

/*
 * Variable Initialisation
 */
var nodes;
var links;
var JSONdata;
var nodesNew;
var nodesOld;
var singleNodes;
var IaaSAvailable = true;
var messageLinks;
var appsNew;
var appsOld;
var foci;
var appTables;

var force;
var svg;
var node;
var link;
var table;

initiate(); // starts the visualization

function initiate() {
	svg = d3.select("#svg");
	initVars();
	initPage();
	initD3();
	log(0, "Initiate Visualization");
	getServerData();
	setInterval(getServerData, updateInterval);
	placement();
}

function initVars () {
	nodes = [];
	links = [];
	JSONdata;
	nodesNew = [];
	nodesOld = [];
	singleNodes = [];
	messageLinks = [];
	appsNew = [];
	appsOld = [];
	foci = [];
	appTables = [];
}

function initPage() {
	svg.attr("width", width)
	.attr("height", height);
	d3.select("#euFlag")
	.attr("x", 0)
	.attr("y", height-200);
	d3.select("#frameworkLogo")
	.attr("x", 0)
	.attr("y", height-100);
}

function initD3 () {
	force =	d3.layout
	.force()
	.nodes(nodes)
	.links(links)
	.linkStrength(0)
	.charge(-1)
	.linkStrength(0.1)
	.size([ width, height ])
	.on("tick", tick);

	svg = d3.select("#svg");
	node = svg.selectAll(".node");
	link = svg.selectAll(".link");
	table = svg.selectAll(".table");
}

function getServerData() {
	log(0, "Getting data from Server");
	nodesOld = clone(nodesNew);
	appsOld = clone(appsNew);

	var xhr = new XMLHttpRequest();
	xhr.open("GET", serverUrl + "nodeInfo/", true);
	xhr.onload = function (e) {
		processServerData(xhr.responseText);
	};
	xhr.onerror = function (e) {
		log(xhr.statusText);
	};
	xhr.send(null);
}

function processServerData(responseText) {
	log(0, "Processing data from Server");
	JSONdata = JSON.parse(responseText);

	var tempNodes = JSONdata.nodes;
	log(1, tempNodes.length+" nodes in data");
	var messages = JSONdata.messages;
	log(1, messages.length+" messages in data");
	var config = JSONdata.config;
	
	if (config.IaaS != IaaSAvailable) {
		IaaSAvailable = config.IaaS;
		removeIaaSBox();
	}
//	removeLegendBox();
//	removeVoluntaryBox();
//	removeIaaSBox();

	nodesNew = [];
	singleNodes = [];

	for (var i in tempNodes) {
		if (tempNodes[i].singleNode)
			singleNodes.push(tempNodes[i]);
		else
			nodesNew.push(tempNodes[i]);
	}

	if (showSingleNodes) {
		nodesNew = JSONdata.nodes;
	}

	log(1, nodesNew.length+" nodes in data which must be visualized");

	compareNodes();
	compareMessages(messages);
	createAppTablesForNodes(nodesNew);
	
//	updateIaasNodeList();
}

function removeLegendBox() {
	d3.select("#LegendBox").remove();
}

function removeVoluntaryBox() {
	d3.select("#VoluntaryBox").remove();
}

function removeIaaSBox() {
	d3.select("#IaaSBox").remove();
	d3.select("#VoluntaryBox")
		.attr("y", "250");
}

/**
 * compares old and new nodesets deletes and adds new nodes to the visualization
 */

function compareNodes() {
	var oldLength = nodesOld.length;
	var newLength = nodesNew.length;
	var doStart = false;

	var pos = diffArrayPos(nodesNew, nodesOld);

	var prevPos = pos[0] - 1;
	var nextPos = pos[0] + 1;
	if (prevPos < 0 || prevPos >= nodesNew.length) {
		prevPos = nodesNew.length - 1;
	}
	if (nextPos >= nodesNew.length || nextPos < 0) {
		nextPos = 0;
	}


	if (newLength > oldLength && oldLength == 0) { // init from scratch
		log(1, "Added "+newLength+" new nodes");

		// add SCPi to nodes
		for (var i in nodesNew) {
			nodes.push(nodesNew[i]);
			appTables.push({
				rows : [],
				tableId : nodesNew[i].fullId,
				fullId : i
			});
		}

		// add links between SCPi to links
		for (var i = 0; i < nodesNew.length - 1; i++) {
			var j = i + 1;
			links.push({
				source : nodesNew[i],
				target : nodesNew[j]
			});
			if (i == nodesNew.length - 2) {
				links.push({
					source : nodesNew[j],
					target : nodesNew[0]
				});
			}
		}

		// add app tables to nodes
		for (i in appTables) {
			nodes.push(appTables[i]);
		}

		doStart = true;
	} else if (newLength > oldLength && oldLength > 2) { // at least one new node and at least three existing nodes
		log(1, "Added new Node 1: "+oldLength+" -> "+newLength);
		var idPrevious = nodesNew[prevPos].fullId;
		var idNext = nodesNew[nextPos].fullId;
		nodes.splice(pos[0], 0, nodesNew[pos[0]]);
		appTables.splice(pos[0], 0, {
			rows : [],
			tableId : nodesNew[pos[0]].fullId,
			fullId : Math.random()
		});
		nodes.splice(nodesNew.length + pos[0], 0, appTables[pos[0]]);
		var i = 0;
		while (i < links.length) {
			if ((links[i]['source'].fullId == nodesNew[prevPos].fullId && links[i]['target'].fullId == nodesNew[nextPos].fullId)
					|| (links[i]['source'].fullId == nodesNew[nextPos].fullId && links[i]['target'].fullId == nodesNew[prevPos].fullId)) {
				links.splice(i, 1);
			} else
				i++;
		}

		links.splice(searchLinkPosById(nodes[pos[0]].fullId, idPrevious), 0, {
			source : searchNodeById(idPrevious),
			target : searchNodeById(nodes[pos[0]].fullId)
		});
		links.splice(searchLinkPosById(nodes[pos[0]].fullId, idNext), 0, {
			source : searchNodeById(nodes[pos[0]].fullId),
			target : searchNodeById(idNext)
		});

		doStart = true;
	} else if (newLength > oldLength && oldLength == 2) { // at least one new node and exact two existing nodes
		log(1, "Added new Node 2: "+oldLength+" -> "+newLength);
		var idPrevious = nodesNew[prevPos].fullId;
		var idNext = nodesNew[nextPos].fullId;
		nodes.splice(pos[0], 0, nodesNew[pos[0]]);
		appTables.splice(pos[0], 0, {
			rows : [],
			tableId : nodesNew[pos[0]].fullId,
			fullId : Math.random()
		});
		nodes.splice(nodesNew.length + pos[0], 0, appTables[pos[0]]);
		links.splice(searchLinkPosById(nodes[pos[0]].fullId, idPrevious), 0, {
			source : searchNodeById(idPrevious),
			target : searchNodeById(nodes[pos[0]].fullId)
		});
		links.splice(searchLinkPosById(nodes[pos[0]].fullId, idNext), 0, {
			source : searchNodeById(nodes[pos[0]].fullId),
			target : searchNodeById(idNext)
		});

		doStart = true;
	} else if (newLength > oldLength && oldLength == 1) { // at least one new node and exact one existing node
		log(1, "Added new Node 3: "+oldLength+" -> "+newLength);
		var idNext = nodesNew[nextPos].fullId;
		nodes.splice(pos[0], 0, nodesNew[pos[0]]);
		appTables.splice(pos[0], 0, {
			rows : [],
			tableId : nodesNew[pos[0]].fullId,
			fullId : Math.random()
		});
		nodes.splice(nodesNew.length + pos[0], 0, appTables[pos[0]]);
		links.splice(searchLinkPosById(nodes[pos[0]].fullId, idNext), 0, {
			source : searchNodeById(nodes[pos[0]].fullId),
			target : searchNodeById(idNext)
		});

		doStart = true;
	} else if (newLength == 0 && oldLength > 0) {
		log(1, "Removed all Nodes: "+oldLength+" -> "+newLength);
		initVars();
		doStart = true;
	} else if (newLength < oldLength && oldLength > 1) {  // at least one node removed and at least two existing node
		log(1, "Removed Node 1: "+oldLength+" -> "+newLength);

		var pos = diffArrayPos(nodesOld, nodesNew);
		var id = diffArrayId(nodesOld, nodesNew);

		nodes.splice(nodesNew.length + pos[0] + 1, 1);
		appTables.splice(pos[0], 1);
		nodes.splice(pos[0], 1);
		compareLinks(id[0]);

		doStart = true;
	} else if (newLength < oldLength && newLength < 1) {  // at least one node removed and no new nodes
		log(1, "Removed Node 2: "+oldLength+" -> "+newLength);
		nodes.splice(0, 2);
		appTables.splice(0, 1);

		doStart = true;
	}

	for (var i = 0; i < newLength; i++) {
		for (var j in nodesNew) {
			if (nodes[i].fullId == nodesNew[j].fullId) {
				updateNodeFromNode(nodes[i], nodesNew[j]);
			}
		}
	}

	if (doStart) 
		start();
	else if (newLength > 0)
		drawNodes();
}

function updateNodeFromNode (oldNode, newNode) {
	oldNode.address = newNode.address;
	oldNode.port = newNode.port;
	oldNode.cpuCores = newNode.cpuCores;
	oldNode.cpuSpeed = newNode.cpuSpeed;
	oldNode.cpuModel = newNode.cpuModel;
	oldNode.cpuLoad = newNode.cpuLoad;
	oldNode.memTotal = newNode.memTotal;
	oldNode.memUsed = newNode.memUsed;
	oldNode.location = newNode.location;
	oldNode.virtualized = newNode.virtualized;
	oldNode.nodeStrategy = newNode.nodeStrategy;
}

function createAppTablesForNodes(nodes) {
	log(0, "Creating App tables for "+node.length+" nodes");
	for (var i in nodes) {
		var nodeid = nodes[i].fullId;
		var currentApps = nodes[i].appRoles;

		log(0, "Checking apps for node " + nodeid);

		var currentTable = appTables[searchTablePosById(nodeid)];
		var didSomeChanges = false;
		for (var appName in currentApps) {
			var appRoles = currentApps[appName];

			for (var roleName in appRoles) {
				var roleStatus = appRoles[roleName];

				log(1, "Found row for app " + appName + " role "
						+ roleName + " status " + roleStatus);

				// Add this app and role as a row in the table:
				var isAlreadyThere = false;
				for (var l in currentTable.rows) {
					if (currentTable.rows[l].roleName == roleName
							&& currentTable.rows[l].appName == appName) {
						if (currentTable.rows[l].roleStatus != roleStatus) {
							currentTable.rows[l].roleStatus = roleStatus;
							didSomeChanges = true;
						}
						log(1,"Not adding, is already there.");
						isAlreadyThere = true;
					}
				}

				if (!isAlreadyThere) {
					log(1,"Adding new row.");
					currentTable.rows.push({
						appName : appName,
						roleName : roleName,
						roleStatus : roleStatus
					});
					didSomeChanges = true;
				}
			}
		}

		// Check rows which are no longer appropriate, inverse order to prevent problems with deletion
		if (currentTable != undefined) {
			if (currentTable.rows != undefined) {
	
				var currentIndex= currentTable.rows.length;
	
	
				while (currentIndex != 0) {
					log(1, "We are investigating app table row " + currentIndex + " for deletion");
					currentIndex--;
					
					var appCounter = 0;
					
					for (var appName in currentApps) {
						appCounter++;
	
						var currentAppFound= false;
						// go through apps and check rows:
						if (currentTable.rows[currentIndex].appName == appName) {
							// ok, this app is still here:
							log(1, "App still found: " + appName);
							currentAppFound= true;
	
							// ...but check the roles
							var appRoles = currentApps[appName];
	
							var theRoleNames = [];
							for (var roleName in appRoles) {
								theRoleNames.push(roleName);
							}
	
							if ((theRoleNames.indexOf(currentTable.rows[currentIndex].roleName) == -1)) {
								// no, this role is no longer in the list of roles
								log(1, "Deleting row since role is no longer in the list");
								didSomeChanges= true;
								currentTable.rows.splice(currentIndex, 1);
							} else {
								log(1, "Role for this app still found: " + currentTable.rows[currentIndex].roleName);
							}
						}
	
						// CurrentApp was not found
						if (!currentAppFound) {
							log(1, "Deleting row since app is no longer in the list");
							didSomeChanges= true;
							currentTable.rows.splice(currentIndex, 1);
						} else {
							log(1, "Not deleting row with app " + appName);
						}
					}
	
					if (appCounter == 0) {
						// there are no apps AT ALL in this node, so we need to remove the table completely.
						var currentRow = currentTable.rows.pop();
						while (currentRow != undefined)
							currentRow = currentTable.rows.pop();
						didSomeChanges= true;
					}
				}
			}
		}

		if (didSomeChanges)
			start();
	}
}

function start() {
	log(0, "Start Force Layout");
	link = link.data(links, function(d) { return d.source.fullId + "-" + d.target.fullId;});
	link.enter()
	.insert("line", ".node")
	.attr("class", "link");
	link.exit()
	.remove();

	table = table.data(nodes.slice(nodesNew.length, nodes.length), function(d) { return d.fullId;});
	table.enter().append("g")
	.attr("class", "table")
	.attr("id", function(d) { return "t-" + d.fullId;}).call(force.drag);
	table.exit()
	.remove();

	node = node.data(nodes.slice(0, nodesNew.length), function(d) { return d.fullId;});
	node.enter()
	.append("g")
	.attr("class", "node")
	.attr("id", function(d) { return "n-" + d.fullId;})
	.call(force.drag);
	node.exit()
	.remove();

	drawNodes();
	setGravity();

	force.start();
}

function setGravity() {
	if (nodesNew.length < 5 && nodesNew.length > 1) {
		force.gravity(-0.04);
	} else {
		force.gravity(-0.02);
	}
}

/*
 * places the nodes in a circle
 */

function placement() {
	var centerX = width / 2;
	var centerY = height / 2;
	var radius = height / 2 - width / 9;
	var angle = 360 / nodesNew.length;
	nodes.forEach(function(d, i) {
		if (nodes.length > 1) {
			d.x = centerX + radius * Math.cos(angle * i * Math.PI / 180);
			d.y = centerY + radius * Math.sin(angle * i * Math.PI / 180);
		} else {
			d.x = centerX;
			d.y = centerY;
		}
		d.fixed = false;
	});
}

/*
 * generates focuspoints for each node nodes are always pushed towards their
 * focuspoint
 */

function makeFoci() {
	var centerX = width / 2;
	var centerY = height / 2;
	var radius = height / 2 - width / 9;
	var angle = 360 / nodesNew.length;
	nodesNew.forEach(function(d, i) {
		var x = centerX;
		var y = centerY;
		if (nodesNew.length > 1) {
			var x = centerX + radius * Math.cos(angle * i * Math.PI / 180);
			y = centerY + radius * Math.sin(angle * i * Math.PI / 180);
		}
		foci.push({
			x : x,
			y : y
		});
	});
}

function tick(e) {
	foci.length = 0;
	makeFoci();

	var k = 0.1 * e.alpha;

	for (var i = 0; i < nodesNew.length; i++) {
		var currentNode = nodes[i];
		currentNode.y += (foci[i].y - currentNode.y) * k;
		currentNode.x += (foci[i].x - currentNode.x) * k;
	}

	for (var i = nodesNew.length; i < nodes.length; i++) {
		var currentAppTable = nodes[i];
		var currentNode = nodes[searchNodePosById(currentAppTable.tableId)];
		currentAppTable.y += (currentNode.y - currentAppTable.y) * k;
		currentAppTable.x += (currentNode.x - currentAppTable.x) * k;
	}

	link.attr("x1", function(d) { return d.source.x;})
	.attr("y1", function(d) { return d.source.y;})
	.attr("x2", function(d) { return d.target.x;})
	.attr("y2", function(d) { return d.target.y;});

	node.attr("transform", function(d) {
		return "translate(" + d.x + "," + d.y + ")";
	});

	table.attr("transform", function(d) {
		return "translate(" + d.x + "," + d.y + ")";
	});
}


function messageCheck(oldMessages, messageLinks) {

	var currentTimeNew = oldMessages.map(function(d) {
		return d.currentTime;
	});

	var currentTimeOld = messageLinks.map(function(d) {
		return d.currentTime;
	});

	currentTimeOld = currentTimeOld.toString().split(",");
	currentTimeNew = currentTimeNew.toString().split(",");
	var check = false;

	for (var i = 0; i < messageLinks.length; i++) {
		if (currentTimeOld[i] != currentTimeNew[i]) {
			check = true;
		}
	}
	return check;
}


/*
 * gets new messages out of the data and calls printBroadcast or printMessage to
 * visualize the message
 */

function compareMessages(messages) {
	log(0, "Checking for new messages in data")

	var oldMessages = clone(messageLinks);
	messageLinks = messages;

	var to = messageLinks.map(function(d) {
		return d.fullStringIdTo;
	});

	var from = messageLinks.map(function(d) {
		return d.fullStringIdFrom;
	});

	var type = messageLinks.map(function(d) {
		return d.msgType;
	});

	var ids = d3.selectAll(".node").select(function(d) {
		return d.fullId;
	});

	ids = ids.toString().split(","); // alle Knoten-IDs im System
	to = to.toString().split(","); // alle Ziel IDs
	from = from.toString().split(","); // alle IDs von sendenden Knoten
	type = type.toString().split(","); // Nachrichtentypen

	if (oldMessages.length != messageLinks.length
			|| messageCheck(oldMessages, messageLinks)) {
		for (var i = 0; i < to.length; i++) {
			if (to[i] == "Broadcast" && !to[i] == "") {
				drawBroadcast(to[i], from[i], type[i], ids);
			} else if (!to[i] == "") {
				var c = getSwitch(i);
				drawMessage(to[i], from[i], type[i], c);
			}
		}
	}
}

function getSwitch(i) {
	if (messageLinks.length > 2) {
		var res = 0;
		if (i > messageLinks.length / 2) {
			res = 1;
		}
		return res;
	} else if (messageLinks.length == 2) {
		return i;
	}
}


/*
 * print message/broadcast
 */

function drawMessage(to, from, type, count) {
	
	var d1 = parseFloat(getCordX(to)) - parseFloat(getCordX(from));
	var d2 = parseFloat(getCordY(to)) - parseFloat(getCordY(from));
	var n = Math.sqrt((d1 * d1) + (d2 * d2));

	d1 = (d1 / n) * 35;
	d2 = (d2 / n) * 35;

	if (d1 != 0 && d2 != 0 && !isNaN(d1) && !isNaN(d2)) {

		var messageLine = svg.append("line").attr("class", function() {
			if (type == "AppUiRequestMessage")
				return "Ui";
			else if (type == "AppUiResponseMessage")
				return "Ui";
			else if (type == "ExecuteCommandMessage")
				return "AppManagement";
			else if (type == "ExecutedAppMessage")
				return "Status";
			else if (type == "ExecutorMessage")
				return "AppManagement";
			else if (type == "InitiatedAppsMessage")
				return "Status";
			else if (type == "NodeInfoResultMessage")
				return "Status";
			else if (type == "NodeInfoRequestMessage")
				return "Status";
			else if (type == "ProposalMessage")
				return "AppManagement";
			else if (type == "RunningAppMessage")
				return "Status";
			else if (type == "SimpleMessage")
				return "Ui";
			else if (type == "Ping")
				return "Status";
			else if (type == "Pong")
				return "Status";
		}).attr("type", function() {
			return type;
		}).attr("marker-end", "url(#arrow)").attr("x1", function() {
			return parseFloat(getCordX(from)) + d1;

		}).attr("y1", function() {
			return parseFloat(getCordY(from)) + d2;

		}).attr("x2", function() {
			return parseFloat(getCordX(to)) - d1;

		}).attr("y2", function() {
			return parseFloat(getCordY(to)) - d2;
		}).style("stroke", "black").style("stroke-width", "1")
		.on(
				"mouseover",
				function() {
					var text = svg.append("text").attr("x", function() {
						var mouseCord = [ 0, 0 ];
						mouseCord = d3.mouse(this);
						return mouseCord[0];
					}).attr("y", function() {
						var mouseCord = [ 0, 0 ];
						mouseCord = d3.mouse(this);
						return mouseCord[1];
					}).style("stroke", "black").text(function(d) {
						var parentLine = d3.event.target;
						return parentLine.getAttribute("type");
					}).transition().duration(3000).style("opacity", 0)
					.remove();
				}).transition().duration(6000).style("opacity", 0)
				.remove();
		if (showMessageText) {
			addMessageText(from, to, type, count);
		}
		setMessageGroupColor();
	}
}

//adds a Broadcast to the svg layout
function drawBroadcast(to, from, type, ids) {
	log(0, "Broadcast: " + type + " from " + from + "cordX-from "
			+ getCordX(from));
	for (var j = 0; j < ids.length - appsNew.length; j++) {
		var d1 = parseFloat(getCordX(from)) - parseFloat(getCordX(ids[j]));
		var d2 = parseFloat(getCordY(from)) - parseFloat(getCordY(ids[j]));
		var n = Math.sqrt((d1 * d1) + (d2 * d2));

		d1 = (d1 / n) * -35;
		d2 = (d2 / n) * -35;

		if (d1 != 0 && d2 != 0 && !isNaN(d1) && !isNaN(d2)) {
			var messageLine = svg.append("line").attr("class", function() {
				if (type == "NewRunningAppBroadcast")
					return "AppManagement";
				else if (type == "AppInfoRequestBroadcast")
					return "Status";
				else if (type == "ProposalRequestBroadcast")
					return "AppManagement";
				else if (type == "DeletedAppBroadcast")
					return "AppManagement";
				else if (type == "ExecutorRequestBroadcast")
					return "AppManagement";
				else if (type == "NewInitiatorBroadcast")
					return "AppManagement";
				else
					return "Ui";
			}).attr("marker-end", "url(#arrow)").attr("type", function() {
				// return getStringOfBroadcastType(type)
				return type;
			}).attr("x1", function() {
				return parseFloat(getCordX(from)) + d1;

			}).attr("y1", function() {
				return parseFloat(getCordY(from)) + d2;

			}).attr("x2", function() {
				return parseFloat(getCordX(ids[j])) - d1;

			}).attr("y2", function() {
				return parseFloat(getCordY(ids[j])) - d2;
			}).style("stroke", "black").on("mouseover", function() {
				var text = svg.append("text").attr("x", function() {
					var mouseCord = [ 0, 0 ];
					mouseCord = d3.mouse(this);
					return mouseCord[0];
				}).attr("y", function() {
					var mouseCord = [ 0, 0 ];
					mouseCord = d3.mouse(this);
					return mouseCord[1];
				}).style("stroke", "black").text(function() {
					var parentLine = d3.event.target;
					return parentLine.getAttribute("type");
				}).transition().duration(3000).style("opacity", 0).remove();
			})

			.style("stroke-width", "1").transition().duration(6000).style(
					"opacity", 0).remove();
			if (showBroadcastText) {
				addMessageText(ids[j], from, getStringOfBroadcastType(type), j);
			}
			setMessageGroupColor();
		}
	}
}






//arrow marker
var marker = svg.append("defs")
.append("marker")
.attr("id", "arrow")
.attr("viewbox", "0 0 10 10")
.attr("refX", "0")
.attr("refY", "4.39")
.attr("markerHeight", "10")
.attr("markerWidth", "10")
.attr("orient", "auto")
.append("path")
.attr("d", "M 0 0 L 10 5 L 0 10 Z");



/*
 * draw functions
 */

function drawNodes () {
	d3.selectAll(".svgObj").remove();
	drawNodeTables();
	drawAppTables();
	
	addTooltip();
}

function drawNodeTables() {
	node.append("foreignObject")
	.attr("x", -nodeTableWidth/2)
	.attr("y", -nodeTableHeight/2)
	.attr("class", "svgObj")
	.attr("width", nodeTableWidth)
	.attr("height", nodeTableHeight)
	.on("dblclick", function(d) {openNodeTab(d);})
	.append("xhtml:body")
	
	.html(function(d) {
		var resString = "";
		var nodeClass = "nodeTable";
		if (d.virtualized)
			nodeClass = "virtNodeTable";
		resString = "<table id=\"nodeTable"+d.shortId+"\" class=\"" + nodeClass + "\" cellpadding=4>";
		resString += "<colgroup>";
		resString += "<col>";
		resString += "<col>";		
		resString += "</colgroup>";
		resString += "<thead>";
		resString += "<tr>";
		resString += "<th class=\"tableTitle\" colspan=2>"+d.shortId+"</th>";
		resString += "</tr>";
		resString += "</thead>";
		resString += "<tbody>";
		var cpuState = ""
		if (d.cpuLoad > cpuYellowThreshold * 100)
			cpuState = "yellow";
		if (d.cpuLoad > cpuRedThreshold * 100)
			cpuState = "red";
		resString += "<tr class=\""+cpuState+"\">";
		resString += "<td>CPU</td>";
		resString += "<td>"+d.cpuLoad+"%</td>";
		resString += "</tr>";
		var memState = ""
		if (d.memUsed/d.memTotal > memYellowThreshold)
			memState = "yellow";
		if (d.memUsed/d.memTotal > memRedThreshold)
			memState = "red";			
		resString += "<tr class=\""+memState+"\">";
		resString += "<td>Memory</td>";
		resString += "<td>"+d.memFree+" MB</td>";
		resString += "</tr>";
		var diskState = ""
		if ((d.diskTotal - d.diskFree)/d.diskTotal > diskYellowThreshold)
			diskState = "yellow";
		if ((d.diskTotal - d.diskFree)/d.diskTotal > diskRedThreshold)
			diskState = "red";		
		resString += "<tr class=\""+diskState+"\">";
		resString += "<td>Disk</td>";
		var diskFreeString = "";
		if (d.diskFree > 10 * 1024) {
			diskFreeString = Math.round((d.diskFree / 1024) * 100) / 100+" GB";
		}	else
			diskFreeString = d.diskFree+" MB";
		resString += "<td>"+diskFreeString+"</td>";
		resString += "</tr>";
		resString += "<tbody>";
		resString += "</table>";
		return resString;
	});
	
}

function addTooltip() {

	node.append("title").attr("class", "svgObj").text(
			function(d) {
				if ("shortId" in d) {
					return d.fullId + "\n\n"
					+ "Address: " + d.address + "\n"
					+ "Port: " + d.port + "\n"
					+ "Virtualized: " + d.virtualized + "\n" 
					+ (d.virtualized ? "Deployment ID: " + d.deploymentId + "\n" : "")
					+ "CPU-Model: "+ d.cpuModel + "\n" 
					+ "CPU-Cores: "+ d.cpuCores + "\n" 
					+ "CPU-Speed: " + d.cpuSpeed + "\n" 
					+ "CPU-Load: " + d.cpuLoad + " %" + "\n"
					+ "Memory-Total: " + d.memTotal + "\n"
					+ "Memory-Used: " + d.memUsed + "\n"
					+ "Memory-Free: " + d.memFree + "\n"
					+ "Disk-Total: " + d.diskTotal + "\n"
					+ "Disk-Free: " + d.diskFree
				} else {
					return "";
				}
			});
}
	
function drawAppTables() {

	var centerX = width / 2;
	var centerY = height / 2;
	var node = null;
	var factor = appTablePositioningFactor;
	
	table.append("foreignObject")
	.attr("class", "svgObj")
	.attr("x",  function (d) {
		if (d.rows.length > 0) {
			node = searchNodeById(d.tableId);
			
			var x_0 = node.x - centerX;
			var y_0 = node.y - centerY;
			var a_0 = Math.sqrt((x_0 * x_0) + (y_0 * y_0));
			
			var a = a_0 * factor;
			var x = Math.sin(Math.atan(Math.abs(x_0)/Math.abs(y_0))) * a;
			
			var x = x_0 > 0 ? x : -x - 180;
			
			return x;
		}
		return 0;
	})
	.attr("y", function (d) {
		if (d.rows.length > 0) {
			node = searchNodeById(d.tableId);
			
			var x_0 = node.x - centerX;
			var y_0 = node.y - centerY;
			var a_0 = Math.sqrt((x_0 * x_0) + (y_0 * y_0));
			
			var a = a_0 * factor;
			var y = Math.cos(Math.atan(Math.abs(x_0)/Math.abs(y_0))) * a;
			var y = y_0 > 0 ? y : -y - 40 - d.rows.length * 15;

			return y;
		}
		return 0;
	})
	.attr("width", appTableWidth)
	.attr("height", appTableHeight)
	.attr("opacity", function(d) {
		for (i in d.rows) {
			return 1;
		}
		return 0;
	})
	.append("xhtml:body")
	.html(function(d) {
		var resString = "";
		if (d.rows) {
			resString = "<table class=\"appTable\" cellpadding=4><thead><tr><th class=\"tableTitle\">App</th><th class=\"tableTitle\">Role</th></tr></thead>";
			var apps = [];
			var appRoleCount = [];
			for (i in d.rows) {
				var appName = d.rows[i].appName;
				if (appRoleCount[appName] == null) {
					apps[appName] = [];
					appRoleCount[appName] = 0;
				}
				appRoleCount[appName] += 1;
				apps[appName].push(d.rows[i].roleName.replace(" ", "&nbsp;"));
			}
			
			var lastAppName = "";
			for (i in d.rows) {
				var appName = d.rows[i].appName;
				if (lastAppName != appName) {
					resString += "<tr>";
					resString += "<td>" + appName + "</td><td>" + apps[appName].join(", ") + "</td>"
					lastAppName = appName;
					resString += "</tr>";
				}
			}
			resString = resString + "</table>";
			return resString;
		}
	});
}


/*
 * util functions
 */

function clone(obj) {
	if (null == obj || "object" != typeof obj)
		return obj;
	var copy = obj.constructor();
	for ( var attr in obj) {
		if (obj.hasOwnProperty(attr))
			copy[attr] = obj[attr];
	}
	return copy;
}

//returns the xCoordinate of a node
function getCordX(id) {
	var x = d3.selectAll(".node").select(function(d) {
		return d.x;
	});
	var ids = d3.selectAll(".node").select(function(d) {
		return d.fullId;
	});

	var posCount = 0;

	ids = ids.toString().split(",");

	for (var i = 0; i < ids.length; i++) {
		if (ids[i] == id) {
			break;
		} else {
			posCount++;
		}
	}

	var fin = x.toString();
	fin = fin.split(",");
	return fin[posCount];
}

//returns the yCoordinate of a node
function getCordY(id) {
	var y = d3.selectAll(".node").select(function(d) {
		return d.y;
	});
	var ids = d3.selectAll(".node").select(function(d) {
		return d.fullId;
	});

	var posCount = 0;

	ids = ids.toString().split(",");

	for (var i = 0; i < ids.length; i++) {
		if (ids[i] == id) {
			break;
		} else {
			posCount++;
		}
	}

	var fin = y.toString();
	fin = fin.split(",");

	return fin[posCount];
}

function compareLinks(id) {
	var newTarget;
	var newSource;
	var i = 0;

	while (i < links.length) {
		if (links[i]['source'].fullId == id) {
			newTarget = links[i]['target'].fullId;
			links.splice(i, 1);
		} else if (links[i]['target'].fullId == id) {
			newSource = links[i]['source'].fullId;
			links.splice(i, 1);
		} else
			i++;
	}
	links.push({
		source : searchNodeById(newSource),
		target : searchNodeById(newTarget)
	});

}

function diffArrayId(a, b) {
	var seen = [], diff = [];
	for (var i = 0; i < b.length; i++) {
		seen[b[i].fullId] = true;
	}
	for (var i = 0; i < a.length; i++)
		if (!seen[a[i].fullId]) {
			diff.push(a[i].fullId);
		}
	return diff;
}

//returns array with all positions of nodes in a, that are not in b. Calculated by fullId
function diffArrayPos(a, b) {
	var seen = [], diff = [];
	for (var i = 0; i < b.length; i++) {
		seen[b[i].fullId] = true;
	}
	for (var i = 0; i < a.length; i++)
		if (!seen[a[i].fullId]) {
			diff.push(i);
		}
	return diff;
}

function searchLinkPosById(id1, id2) {
	for (var i in links) {
		if ((links[i]['source'].fullId == id1 && links[i]['target'].fullId == id2)
				|| (links[i]['source'].fullId == id1 && links[i]['target'].fullId == id2)) {
			return i;
		}
	}
}

function searchNodeById(id) {
	for (var i in nodesNew) {
		if (id == nodes[i]["fullId"]) {
			return nodes[i];
		}
	}
}

function searchNodePosById(id) {
	for (var i in nodesNew) {
		if (id == nodes[i]["fullId"]) {
			return i;
		}
	}
}

function searchTablePosById(id) {
	for (var i in appTables) {
		if (id == appTables[i]["tableId"]) {
			return i;
		}
	}
}

function setMessageGroupColor() {
	d3.selectAll(".Status").style("stroke", "green");
	d3.selectAll(".AppManagement").style("stroke", "orange");
	d3.selectAll(".Ui").style("stroke", "blue");
}

function addMessageText(to, from, type, j) {

	// Text an alle Nachrichten
	var text = svg.append("text").attr("class", "messageText").attr("x",
			function(d) {
		var xT = parseFloat(getCordX(to));
		var xF = parseFloat(getCordX(from));
		var res = (xT + xF) / 2;

		return res;
	}).attr("y", function(d) {
		var yF = parseFloat(getCordY(from));
		var yT = parseFloat(getCordY(to));
		var res = (yT + yF) / 2;
		if (j % 2 == 0) {
			res += 15;
		}
		return res;
	}).style("stroke", "black").text(function(d) {
		return type;
	}).style("stroke-width", "0.02").style("text-anchor", "middle")
	.transition().duration(6000).style("opacity", 0).remove();
}

function getStringOfBroadcastType(t) {
	if (t == "0")
		return "ShutdownBroadcast";
	else if (t == "1")
		return "NodeInfoRequestBroadcast";
	else if (t == "2")
		return "LocalStoredAppsRequestBroadcast";
	else if (t == "3")
		return "RunnigAppsRequestBroadcast";
	else if (t == "4")
		return "NewRunningAppBroadcast";
	else if (t == "5")
		return "AppInfoRequestBroadcast";
	else if (t == "6")
		return "ProposalRequestBroadcast";
	else if (t == "7")
		return "DeletedAppBroadcast";
	else if (t == "8")
		return "ExecutorRequestBroadcast";
	else if (t == "9")
		return "NewInitiatorForAppBroadcast";
	else
		return t;
}

function openNodeTab (d) {
	var newTab = window.open(serverUrl+"nodeInfo/"+d.fullId+"/", 'blank');
	newTab.focus;
}

function log (level, string) {
	
	if (level >= logLevel) {
		
		var d = new Date();
	
		var dd = d.getDate() < 10 ? "0"+d.getDate() : d.getDate();
		var mm = d.getMonth() < 10 ? "0"+d.getMonth() : d.getMonth();
		var yy = d.getFullYear();
		var HH = d.getHours() < 10 ? "0"+d.getHours() : d.getHours();
		var MM = d.getMinutes() < 10 ? "0"+d.getMinutes() : d.getMinutes();
		var SS = d.getSeconds() < 10 ? "0"+d.getSeconds() : d.getSeconds();
	
		console.log(dd+"."+mm+"."+yy+" "+HH+":"+MM+":"+SS+" "+level+": "+string);
	}
}

function setCookie (cookie, value) {
	var date = new Date();
	date = new Date(date.getTime() + cookieExpiration);
	document.cookie = cookie + "=" + value +"; expires="+date.toGMTString()+";";
}


function enDisableElementWithId (elementId, disabled) {
	document.getElementById(elementId).disabled = disabled;
}



if (legendOpen)
	expandLegend(false);

if (IaaSOpen) {
	expandIaaS(false);
//	setIaaSDemoState(IaaSDemoState);
}
/*
if (voluntaryOpen) {
	expandVoluntary(false);
}*/

