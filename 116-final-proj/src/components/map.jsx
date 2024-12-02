'use client';

import { useEffect } from "react";
import * as d3 from "d3";
import geoData from './usa_zip_codes_geo_26m.json'; // Importing the GeoJSON file

export default function MapVis() {
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
      .attr("fill", "steelblue")
      .attr("stroke", "white")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill", "orange");
        console.log("Hovered on:", d.properties);
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill", "steelblue");
      });
  }, []);

  return (
    <div className="map-container">
      <svg id="map"></svg>
    </div>
  );
}
