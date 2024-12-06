'use client';

import { useEffect, useState } from "react";
import * as d3 from "d3";
import geoData from './counties.json'; // Importing the GeoJSON file
import MapTooltip from "@/components/utils/map_tooltip";

export default function MapVis() {
  const [tooltipContent, setTooltipContent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Set up the map visualization with D3
    const width = 800;
    const height = 600;

    // Create SVG element for the map
    const svg = d3.select('#map')
      .attr('width', width)
      .attr('height', height);

    // Set up the projection
    const projection = d3.geoAlbersUsa().fitSize([width, height], geoData);
    const pathGenerator = d3.geoPath().projection(projection);

    // Draw the polygons from the GeoJSON data
    svg.selectAll("path")
      .data(geoData.features)
      .join("path")
      .attr("d", pathGenerator)
      .attr("class", "state")
      .attr("fill", "black")
      .attr("stroke", "white")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill", "orange");
        setTooltipContent(d.properties.name || "Unknown"); // Example: Show county/state name
        setTooltipPosition({ x: event.pageX, y: event.pageY });
      })
      .on("mousemove", function (event) {
        setTooltipPosition({ x: event.pageX, y: event.pageY }); // Update position on mouse move
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill", "black");
        setTooltipContent(null); // Hide tooltip on mouse out
      });
  }, []);

  return (
    <div className="map-container relative border border-white p-2">
      <svg id="map"></svg>
      <MapTooltip tooltipContent={tooltipContent} position={tooltipPosition} />
    </div>
  );
}
