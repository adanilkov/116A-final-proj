'use client';

import { useEffect, useState } from "react";
import * as d3 from "d3";
import geoData from './counties.json'; // Importing the GeoJSON file
import MapTooltip from "@/components/utils/map_tooltip";
import { Switch } from '@headlessui/react';

export default function MapVis() {
  const [tooltipContent, setTooltipContent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [brush1Selection, setBrush1Selection] = useState([]);
  const [brush2Selection, setBrush2Selection] = useState([]);
  const [isBrush1Active, setIsBrush1Active] = useState(true); // Tracks which brush is active

  useEffect(() => {
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
        setTooltipContent(d.properties.NAME); // Example: Show county/state name
        setTooltipPosition({ x: event.pageX, y: event.pageY });
      })
      .on("mousemove", function (event) {
        setTooltipPosition({ x: event.pageX, y: event.pageY }); // Update tooltip position
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill", "black");
        setTooltipContent(null); // Hide tooltip on mouse out
      });

    // Define the brushes
    const brush1 = d3.brush()
      .extent([[0, 0], [width, height]])
      .on("brush end", brushed1);

    const brush2 = d3.brush()
      .extent([[0, 0], [width, height]])
      .on("brush end", brushed2);

    // Append brush elements to the SVG
    const brush1Group = svg.append("g")
      .attr("class", "brush brush1")
      .call(brush1);

    const brush2Group = svg.append("g")
      .attr("class", "brush brush2")
      .call(brush2)
      .style("display", "none"); // Hide brush 2 initially

    // Brush event handlers
    function brushed1(event) {
      const selection = event.selection;
      if (selection) {
        const [[x0, y0], [x1, y1]] = selection;
        const selectedRegions = geoData.features.filter(d => {
          const centroid = projection(d3.geoCentroid(d));
          return centroid && centroid[0] >= x0 && centroid[0] <= x1 && centroid[1] >= y0 && centroid[1] <= y1;
        });
        setBrush1Selection(selectedRegions);
      }
    }

    function brushed2(event) {
      const selection = event.selection;
      if (selection) {
        const [[x0, y0], [x1, y1]] = selection;
        const selectedRegions = geoData.features.filter(d => {
          const centroid = projection(d3.geoCentroid(d));
          return centroid && centroid[0] >= x0 && centroid[0] <= x1 && centroid[1] >= y0 && centroid[1] <= y1;
        });
        setBrush2Selection(selectedRegions);
      }
    }

    // Toggle visibility of the brushes when isBrush1Active changes
    if (isBrush1Active) {
      brush1Group.style("display", "inline");
      brush2Group.style("display", "none");
    } else {
      brush1Group.style("display", "none");
      brush2Group.style("display", "inline");
    }
  }, [isBrush1Active]); // Re-run effect when isBrush1Active changes

  return (
    <div className="map-container relative border border-white p-2">
      <svg id="map"></svg>
      <MapTooltip tooltipContent={tooltipContent} position={tooltipPosition} />
      <div className="mt-4 flex items-center">
        <Switch
          checked={isBrush1Active}
          onChange={setIsBrush1Active}
          className={`${isBrush1Active ? 'bg-orange-400' : 'bg-blue-400'} 
                      relative inline-flex items-center h-6 rounded-full w-11`}
        >
          <span className="sr-only">Switch between Brush 1 and Brush 2</span>
          <span
            className={`${
              isBrush1Active ? 'translate-x-6' : 'translate-x-1'
            } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
          />
        </Switch>
        <span className="ml-2 text-gray-700">
          {isBrush1Active ? "Brush 1 Active" : "Brush 2 Active"}
        </span>
      </div>
    </div>
  );
}
