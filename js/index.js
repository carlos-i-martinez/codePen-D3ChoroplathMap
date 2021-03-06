var w = 960,
h = 600;

var svgC = d3.select("#visual").append("svg").
attr("width", w).
attr("height", h);

var myTool = d3.select("#visual").
append("div").
attr("class", "myTool").
attr("id", "tooltip").
style("opacity", 0);

//Counties Data
var url = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';

//Educational Data
var durl = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';

d3.json(durl).then(function (data) {
  d3.json(url).then(function (us) {

    var counties = topojson.feature(us, us.objects.counties);

    data.forEach(function (d)
    {
      d.fips = +d.fips;
      d.bachelorsOrHigher = +d.bachelorsOrHigher;
    });

    var dataByCounty = d3.nest().
    key(function (d) {return d.fips;}).
    object(data);

    counties.features.forEach(function (county)
    {
      if (dataByCounty[+county.id] != null)
      {
        county.properties.therate = dataByCounty[+county.id];
      }
    });

    var path = d3.geoPath();

    var colorHold = ['#F1F7D0', '#EDF26E', '#F2E06E', '#D5AF61', '#DA6F32', '#C30E0E'];
    svgC.append("g").
    attr("class", "counties").
    selectAll("path").
    data(counties.features).
    enter().append("path").
    attr("d", path).
    attr("class", "county").
    attr("data-fips", d => {return d.properties.therate[0].fips;}).
    attr("data-education", d => {return d.properties.therate[0].bachelorsOrHigher;}).
    attr("fill", (d, i) => {
      if (d.properties.therate[0].bachelorsOrHigher > 30) {
        return colorHold[5];
      }
      if (d.properties.therate[0].bachelorsOrHigher > 25) {
        return colorHold[4];
      }
      if (d.properties.therate[0].bachelorsOrHigher > 20) {
        return colorHold[3];
      }
      if (d.properties.therate[0].bachelorsOrHigher > 15) {
        return colorHold[2];
      }
      if (d.properties.therate[0].bachelorsOrHigher > 10) {
        return colorHold[1];
      } else
      {
        return colorHold[0];
      }
    }).
    on("mouseover", function (d, i) {
      var lcolor = 0;
      var trip = 200;
      if (d.properties.therate[0].bachelorsOrHigher > 30) {
        lcolor = 5;
        trip = 2200;
      } else
      if (d.properties.therate[0].bachelorsOrHigher > 25) {
        lcolor = 4;
        trip = 1800;
      } else
      if (d.properties.therate[0].bachelorsOrHigher > 20) {
        lcolor = 3;
        trip = 1400;
      } else
      if (d.properties.therate[0].bachelorsOrHigher > 15) {
        lcolor = 2;
        trip = 1000;
      } else
      if (d.properties.therate[0].bachelorsOrHigher > 10) {
        lcolor = 1;
        trip = 600;
      } else
      {
        lcolor = 0;
        trip = 200;
      }
      d3.select(".trianglepointer").transition().delay(100).attr("transform", "translate(" + -(trip / colorScale.range().length / 2) + ",0)");
      d3.select(".LegText").select("text").text(colorLText[lcolor]);

      myTool.transition().duration(250).style("opacity", 1);
      myTool.html(
      "<p><strong>" + d.properties.therate[0].area_name + ", " + d.properties.therate[0].state + "</strong></p>" +
      "<table><tbody><tr><td class='wide'>Bachelor's Degree or Higher:</td><td>" + d.properties.therate[0].bachelorsOrHigher + "%</td></tr></tbody></table>").
      attr("data-education", d.properties.therate[0].bachelorsOrHigher).
      style("left", d3.event.pageX + 20 + "px").
      style("top", d3.event.pageY - 20 + "px").
      style("display", "inline-block").
      style("opacity", 1);
    }).
    on("mouseout", function (d) {
      myTool.style("display", "none");
    });

    svgC.append("path").
    attr("class", "county-borders").
    attr("d", path(topojson.mesh(us, us.objects.counties, function (a, b) {return a !== b;})));

    // Legends section          
    legends = svgC.append("g").attr("class", "legends").
    attr("id", "legend").
    attr("transform", "translate(" + w / 1.5 + "," + 15 + ")");

    // Legend traingle pointer generator
    var symbolGenerator = d3.symbol().
    type(d3.symbolTriangle).
    size(54);


    var colorScale = d3.scaleOrdinal().domain([10, 15, 20, 25, 30]).range(colorHold);

    //alert(colorScale.range().length)
    legends.append("g").attr("transform", "rotate(180)").append("g").attr("class", "trianglepointer").
    attr("transform", "translate(" + -200 / colorScale.range().length / 2 + ")").
    append("path").attr("d", symbolGenerator());

    //Legend Rectangels
    legends.append("g").attr("class", "LegRect").
    attr("transform", "translate(0," + 9 + ")").
    selectAll("rect").data(colorScale.range()).enter().
    append("rect").
    attr("width", 200 / colorScale.range().length + "px").
    attr("height", "20px").attr("fill", function (d) {return d;}).
    attr("stroke", "black").
    attr("x", function (d, i) {return i * (200 / colorScale.range().length);});

    // legend text
    var colorLText = ["Below 10%", "10% to 15%", "15% to 20%", "20% to 25%", "25% to 30%", "Greater than 30%"];
    legends.append("g").attr("class", "LegText").
    attr("transform", "translate(0,45)").
    append("text").
    attr("x", 30).
    attr('font-weight', 'normal').
    style("text-anchor", "left").
    text(colorLText[0]);

  });

});