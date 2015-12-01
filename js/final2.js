var w = 600;
var h = 500;
var padding = [20, 10, 30, 180]; //Top, right, bottom, left

var widthScale = d3.scale.linear()
    .range([0, w - padding[1] - padding[3]]);

var heightScale = d3.scale.ordinal()
    .rangeRoundBands([padding[0], h - padding[2]], 0.1);

var xAxis = d3.svg.axis()
    .scale(widthScale)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(heightScale)
    .orient("left");

var svg = d3.select("#final")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

var crimes = ["Assault", "Homicide", "Kidnapping or Abduction", "Sex Offenses", "Extortion", "Robbery"];


function drawchart(currentdata, alldata, crime) {
    currentdata.sort(function(a, b) {
        return d3.descending(+a[crime], +b[crime]);
    });

    widthScale.domain([0, d3.max(currentdata, function(d) {
        return +d[crime];
    })]);

    heightScale.domain(currentdata.filter(function(d) {
        return d[crime] > 0;
    }).map(function(d) {
        return d.Type;
    }));

    var rects = svg.selectAll("rect")
        .data(currentdata.filter(function(d) {
            return d[crime] > 0;
        }));
    rects.exit().remove();
    rects.enter()
        .append("rect")
        .on("click", function(d) { //filter so that only top level cats show
            var Parent = d.Type
            var toplevel = alldata.filter(function(d) {
                return d.Parent === Parent
            })
            if (toplevel.length === 0) { //make sure empty categories don't show up
                return
            }

            d3.select('.back-button').style('display', 'block');

            drawchart(toplevel, alldata, crime)
        })
        .append("title");

    rects.transition().duration(1000)
        .attr("x", padding[3])
        .attr("y", function(d) {
            return heightScale(d.Type);
        })
        .attr("width", function(d) {
            return widthScale(d[crime]);
        })
        .attr("height", heightScale.rangeBand())
        .select("title")
        .text(function(d) {
            return "Number of violent offenses that involved the use of a" + d.Type;
        });

    svg.select("g.x.axis")
        .attr("transform", "translate(" + padding[3] + "," + (h - padding[2]) + ")")
        .call(xAxis);

    svg.select("g.y.axis")
        .attr("transform", "translate(" + padding[3] + ",0)")
        .call(yAxis);
}

d3.csv("OffensebyWeapon.csv", function(data) {
    var toplevel = data.filter(function(d) {
        return !d.Parent
    });

    svg.append("g")
        .attr("class", "x axis");
    svg.append("g")
        .attr("class", "y axis");

    drawchart(toplevel, data, "Total Offenses Involving Weapons");

    var crime;

    //change the name of "body" to the div name for the dropdown //
    d3.select("#dropdown")
        .append("select")
        .on("change", function(d) {
            crime = d3.select("select").property("value")
            drawchart(toplevel, data, crime)
        })
        .selectAll("option")
        .data(crimes)
        .enter()
        .append("option")
        .text(function(d) {
            return d
        })
        .property("selected", function(d) {
            if (d === crime) {
                return (true)
            }
        });

    d3.select('#dropdown')
        .append('button')
        .text('Back')
        .attr('class', 'back-button')
        .on('click', function() {
            var toplevel = data.filter(function(d) {
                return !d.Parent && !d.Hide
            });
            d3.select('.back-button').style('display', 'none');
            drawchart(toplevel, data, "Total Offenses Involving Weapons");
        });

    // hide on first level
    d3.select('.back-button').style('display', 'none');
});