// import project links from json file
import { fetchJSON, renderProjects } from "../global.js";
const projects = await fetchJSON("../lib/projects.json");
const projectsContainer = document.querySelector(".projects");
renderProjects(projects, projectsContainer, "h2");

// add project count to header
const title = document.querySelector(".projects-title");
title.textContent = `Projects (${projects.length})`;

// pie chart using D3.js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let colors = d3.scaleOrdinal(d3.schemeSet3);
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let selectedIndex = -1;

// dynamic pie chart with search
function renderPieChart(projectsGiven) {
  console.log(projectsGiven, d3.select("#projects-pie-plot").node());

  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );
  let newData = newRolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  let newSliceGenerator = d3.pie().value((d) => d.value);
  let newArcData = newSliceGenerator(newData);
  let newArcs = newArcData.map((d) => arcGenerator(d));

  let svg = d3.select("#projects-pie-plot");
  svg.selectAll("path").remove();

  let legend = d3.select(".legend");
  legend.selectAll("li").remove();

  newArcs.forEach((arc, i) => {
    svg
      .append("path")
      .attr("d", arc)
      .attr("fill", colors(i))
      .on("click", () => {
        //select pie chart and filter
        selectedIndex = selectedIndex === i ? -1 : i;

        svg
          .selectAll("path")
          .attr("class", (_, idx) => (idx === selectedIndex ? "selected" : ""));

        legend
          .selectAll("li")
          .attr("class", (_, idx) =>
            idx === selectedIndex ? "legend-item selected" : "legend-item",
          );

        if (selectedIndex === -1) {
          renderProjects(projects, projectsContainer, "h2");
        } else {
          let year = newData[selectedIndex].label;
          let yearProjects = projects.filter((p) => p.year === year);
          renderProjects(yearProjects, projectsContainer, "h2");
        }
      });
  });

  newData.forEach((d, idx) => {
    legend
      .append("li")
      .attr("style", `--color:${colors(idx)}`)
      .attr("class", "legend-item")
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}

renderPieChart(projects);

// project searchbar
let query = "";
let searchInput = document.querySelector(".searchBar");
searchInput.addEventListener("input", (event) => {
  selectedIndex = -1;
  // update query value
  query = event.target.value;
  // filter projects
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join("\n").toLowerCase();
    return values.includes(query.toLowerCase());
  });
  // render filtered projects
  renderProjects(filteredProjects, projectsContainer, "h2");
  renderPieChart(filteredProjects);
});
