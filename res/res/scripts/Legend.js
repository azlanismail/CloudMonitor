/**
 * Methods for legend
 */

var legendHeight = 140;
var legendOpen = true;


function drawLegend () {
	d3.select("svg")
	.append("svg")
	.attr("class", "legendSVG")
	.attr("y", -60);

	d3.select(".legendSVG")
	.append("g")
	.attr("class", "legend")
	.on("click", function() {
		if (legendOpen) {
			contractLegend();
		} else {
			expandLegend(true);
		}
	});

	var collapsedUpperLeftX = 0
	var collapsedUpperLeftY = 0;

	d3.select(".legend")
	.append("path")
	.attr("class", "legendPath")
	.attr("d", "M "+collapsedUpperLeftX+" "+collapsedUpperLeftY+" H "+collapsedMenuWidth+" V "+(collapsedMenuHeight)+" H "+ -(collapsedMenuWidth)+" ")
	.style("fill", "none")
	.style("stroke-width", "0.6")
	.style("stroke", "black")
	.attr("transform", "translate(0, 150)");

	d3.select(".legend")
	.append("text")
	.attr("class", "legendHead menuHead")
	.attr("x", menuLabelOffsetX + 32)
	.attr("y", menuLabelOffsetY + collapsedMenuHeight/2)
	.attr("dy", ".30em")
	.style("text-anchor", "end")
	.text("Legend")
}

function contractLegend() {
	log(0, "Contract legend");

	var collapsedUpperLeftX = 0;
	var collapsedUpperLeftY = 0;

	var IaaSY = parseInt(d3.select(".IaaSSVG").attr("y")) || 0;
//	var voluntaryY = parseInt(d3.select(".voluntarySVG").attr("y")) || 0;

	//d3.select(".legendPath")
	//.attr("d", "M "+collapsedUpperLeftX+" "+collapsedUpperLeftY+" H "+collapsedMenuWidth+" V "+(collapsedMenuHeight)+" H "+ -(collapsedMenuWidth)+" ")
	d3.select(".IaaSSVG")
	.attr("y", IaaSY - (legendHeight - collapsedMenuHeight));
	//d3.select(".voluntarySVG")
	//.attr("y", voluntaryY - (legendHeight - collapsedMenuHeight));
	d3.selectAll(".legendLine").remove();
	d3.selectAll(".legendText").remove();
	d3.selectAll(".legendCircle").remove();
	d3.selectAll(".legendRect").remove();
	legendOpen = false;
}

function expandLegend() {
	expandLegend(true);
}

function expandLegend(transition) {
	log(0, "Expand legend");

	var upperLeftX = 0;
	var upperLeftY = 0;

//	var IaaSY = parseInt(d3.select(".IaaSSVG").attr("y")) || 0;
//	var voluntaryY = parseInt(d3.select(".voluntarySVG").attr("y")) || 0;
	
	d3.select(".legendPath")
	.attr("d", "M "+upperLeftX+" "+upperLeftY+" H "+menuWidth+" V "+legendHeight+" H 0 ")
	//d3.select(".IaaSSVG")
	//.attr("y", IaaSY + (legendHeight - collapsedMenuHeight));
//	d3.select(".voluntarySVG")
//	.attr("y", voluntaryY + (legendHeight - collapsedMenuHeight));


	var x =10;
	var y = 200;
	var r = 10; // circle radius
	var edgeRadius = 4; 
	var w = menuInnerWidth-10; // line width
	var offset = 160;
/*
	d3.select(".legend")
	.append("text")
	.attr("class", "legendText")
	.attr("x", x)
	.attr("y", y)
	.text("Ui-Message");
	d3.select(".legend")
	.append("line")
	.attr("class", "legendLine")
	.attr("x1", x)
	.attr("y1", y + 6)
	.attr("x2", x + w)
	.attr("y2", y + 6)
	.style("stroke", "blue")
	.style("stroke-width", "1");

	y += 40;
	d3.select(".legend")
	.append("text")
	.attr("class", "legendText")
	.attr("x", x)
	.attr("y", y)
	.text("Status-Message");
	d3.select(".legend")
	.append("line")
	.attr("class", "legendLine")
	.attr("x1", x)
	.attr("y1", y + 6)
	.attr("x2", x + w)
	.attr("y2", y + 6)
	.style("stroke", "green")
	.style("stroke-width", "1");

	y += 40;
	d3.select(".legend")
	.append("text")
	.attr("class", "legendText")
	.attr("x", x)
	.attr("y", y)
	.text("AppManagement-Message");
	d3.select(".legend")
	.append("line")
	.attr("class", "legendLine")
	.attr("x1", x)
	.attr("y1", y + 6)
	.attr("x2", x + w)
	.attr("y2", y + 6)
	.style("stroke", "orange")
	.style("stroke-width", "1");

	y += 2*r+10;*/
	d3.select(".legend")
	.append("rect")
	.attr("class", "legendRect nodeTable")
	.attr("x", x)
	.attr("y", y - r)
	.attr("width", 2*r)
	.attr("height", 2*r)
	.attr("rx", edgeRadius)
	.attr("ry", edgeRadius)
	d3.select(".legend")
	.append("text")
	.attr("class", "legendText")
	.attr("x", x + 2*r + 10)
	.attr("y", y + 5)
	.text("Voluntary Node");
	
	d3.select(".legend")
	.append("rect")
	.attr("class", "legendRect gray")
	.attr("x", x + offset)
	.attr("y", y - r)
	.attr("width", 2*r)
	.attr("height", 2*r)
	.attr("rx", edgeRadius)
	.attr("ry", edgeRadius)
	d3.select(".legend")
	.append("rect")
	.attr("class", "legendRect red")
	.attr("x", x + offset)
	.attr("y", y - (0.5 * r))
	.attr("width", 2*r)
	.attr("height", r/2)
	d3.select(".legend")
	.append("text")
	.attr("class", "legendText")
	.attr("x", x + 2*r + 10 + offset)
	.attr("y", y + 5)
	.text("Critical");

	y += 2*r+10;
	d3.select(".legend")
	.append("rect")
	.attr("class", "legendRect virtNodeTable")
	.attr("x", x)
	.attr("y", y - r)
	.attr("width", 2*r)
	.attr("height", 2*r)
	.attr("rx", edgeRadius)
	.attr("ry", edgeRadius)
	d3.select(".legend")
	.append("text")
	.attr("class", "legendText")
	.attr("x", x + 2*r + 10)
	.attr("y", y + 5)
	.text("Virtualized Node");
	
	d3.select(".legend")
	.append("rect")
	.attr("class", "legendRect gray")
	.attr("x", x + offset)
	.attr("y", y - r)
	.attr("width", 2*r)
	.attr("height", 2*r)
	.attr("rx", edgeRadius)
	.attr("ry", edgeRadius)
	d3.select(".legend")
	.append("rect")
	.attr("class", "legendRect yellow")
	.attr("x", x + offset)
	.attr("y", y - (0.5 * r))
	.attr("width", 2*r)
	.attr("height", r/2)
	d3.select(".legend")
	.append("text")
	.attr("class", "legendText")
	.attr("x", x + 2*r + 10 + offset)
	.attr("y", y + 5)
	.text("Alarming");

	y += 2*r+10;
	d3.select(".legend")
	.append("rect")
	.attr("class", "legendRect appTable")
	.attr("x", x)
	.attr("y", y - r)
	.attr("width", 2*r)
	.attr("height", 2*r)
	.attr("rx", edgeRadius)
	.attr("ry", edgeRadius)
	d3.select(".legend")
	.append("text")
	.attr("class", "legendText")
	.attr("x", x + 2*r + 10)
	.attr("y", y + 5)
	.text("App Table");

	legendOpen = true;
}




