'use client';

import { useEffect, useState } from "react";
import * as d3 from "d3";
import geoData from './counties.json'; // Importing the GeoJSON file
import MapTooltip from "@/components/utils/map_tooltip";
import { Switch } from '@headlessui/react';

export default function MapVis({ onBrush }) {
  const [tooltipContent, setTooltipContent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isBrush1Active, setIsBrush1Active] = useState(true);
  const [isZoomMode, setIsZoomMode] = useState(true);

  useEffect(() => {
    const width = 800;
    const height = 600;

    // Select the SVG 
    const svg = d3.select('#map')
      .attr('width', width)
      .attr('height', height)
      .style("background", "#000000");

    // Ensure clean slate for containers
    svg.selectAll(".zoom-container").remove();
    svg.selectAll(".brush-container").remove();

    // Create new containers
    const zoomContainer = svg.append("g").attr("class", "zoom-container");
    const brushContainer = svg.append("g").attr("class", "brush-container");

    // Set up projection and path generator
    const projection = d3.geoAlbersUsa().fitSize([width, height], geoData);
    const pathGenerator = d3.geoPath().projection(projection);

    // Draw map regions
    const mapPaths = zoomContainer.selectAll("path")
      .data(geoData.features)
      .join("path")
      .attr("d", pathGenerator)
      .attr("fill", "#FFFFFF")
      .attr("stroke", "#555")
      .attr("stroke-width", 0.5)
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill", "#ffcc00");
        setTooltipContent(d.properties.NAME);
        setTooltipPosition({ x: event.clientX, y: event.clientY });
      })
      .on("mousemove", function (event) {
        setTooltipPosition({ x: event.clientX, y: event.clientY });
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill", "#FFFFFF");
        setTooltipContent(null);
      });

    // Define zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .translateExtent([[0, 0], [width, height]])
      .on("zoom", (event) => {
        zoomContainer.attr("transform", event.transform);
      });

    // Define brush behavior for brush 1 (currently no linked visualization)
    const brush1 = d3.brush()
      .extent([[0, 0], [width, height]])
      .on("start brush", (event) => {
        const selection = event.selection;
        if (selection) {
          const [[x0, y0], [x1, y1]] = selection;
          // Brush 1 logic (visualization will be added later)
        }
      });
      

    // Define brush behavior for brush 2 (currently no linked visualization)
    const brush2 = d3.brush()
      .extent([[0, 0], [width, height]])
      .on("start brush", (event) => {
        const selection = event.selection;
        if (selection) {
          const [[x0, y0], [x1, y1]] = selection;
          // Brush 2 logic (visualization will be added later)
        }
      });

    // Update behavior function
    const updateBehavior = () => {
      svg.on(".zoom", null);
      brushContainer.selectAll("*").remove();

      if (isZoomMode) {
        svg.call(zoom);
      } else {
        brushContainer.call(isBrush1Active ? brush1 : brush2);
      }
    };

    // Initial behavior setup
    updateBehavior();

    // Cleanup
    return () => {
      svg.on(".zoom", null);
      brushContainer.selectAll("*").remove();
    };
  }, [isZoomMode, isBrush1Active]); // Dependencies trigger re-render

  return (
    <div className="map-container relative border border-gray-300 p-4">
      <svg id="map" className="w-full h-auto"></svg>
      {tooltipContent && (
        <MapTooltip tooltipContent={tooltipContent} position={tooltipPosition} />
      )}
      <div className="mt-4 flex items-center gap-4">
        <Switch
          checked={isZoomMode}
          onChange={setIsZoomMode}
          className={`${isZoomMode ? 'bg-green-400' : 'bg-blue-400'} 
                      relative inline-flex items-center h-6 rounded-full w-11`}
        >
          <span className="sr-only">Toggle between Zoom and Brush mode</span>
          <span
            className={`${
              isZoomMode ? 'translate-x-6' : 'translate-x-1'
            } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
          />
        </Switch>
        <span>{isZoomMode ? "View Mode" : "Insight Mode"}</span>
        {!isZoomMode && (
          <div className="ml-4">
            <Switch
              checked={isBrush1Active}
              onChange={setIsBrush1Active}
              className={`${isBrush1Active ? 'bg-orange-400' : 'bg-blue-400'} 
                          relative inline-flex items-center h-6 rounded-full w-11`}
            >
              <span className="sr-only">Toggle between Brush 1 and Brush 2</span>
              <span
                className={`${
                  isBrush1Active ? 'translate-x-6' : 'translate-x-1'
                } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
              />
            </Switch>
            <span className="ml-2">{isBrush1Active ? "Brush 1 Active" : "Brush 2 Active"}</span>
          </div>
        )}
      </div>
    </div>
  );
}
