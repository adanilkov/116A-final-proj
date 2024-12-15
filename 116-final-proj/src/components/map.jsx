'use client';

import { useEffect, useState } from "react";
import * as d3 from "d3";
import geoData from './counties_with_real_estate.json';
import MapTooltip from "@/components/utils/map_tooltip";
import { Switch } from '@headlessui/react';

export default function MapVis({ onBrush }) {
  const [tooltipContent, setTooltipContent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isBrush1Active, setIsBrush1Active] = useState(true);
  const [isZoomMode, setIsZoomMode] = useState(true);
  const [brush1Selection, setBrush1Selection] = useState(null);
  const [brush2Selection, setBrush2Selection] = useState(null);

  useEffect(() => {
    const width = 800;
    const height = 600;

    const svg = d3.select('#map')
      .attr('width', width)
      .attr('height', height)
      .style("background", "#000000");

    svg.selectAll(".zoom-container").remove();
    svg.selectAll(".brush-container").remove();

    const zoomContainer = svg.append("g").attr("class", "zoom-container");
    const brushContainer = svg.append("g").attr("class", "brush-container");

    const projection = d3.geoAlbersUsa().fitSize([width, height], geoData);
    const pathGenerator = d3.geoPath().projection(projection);

    const mapPaths = zoomContainer.selectAll("path")
      .data(geoData.features)
      .join("path")
      .attr("d", pathGenerator)
      .attr("fill", "#FFFFFF")
      .attr("stroke", "#555")
      .attr("stroke-width", 0.5)
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill", "#ffcc00");
        setTooltipContent({
          name: d.properties.NAME,
          avg_price: d.properties.avg_price,
          total_price: d.properties.total_price,
          total_transactions: d.properties.total_transactions
        });
        setTooltipPosition({ x: event.clientX, y: event.clientY });
      })
      .on("mousemove", function (event) {
        setTooltipPosition({ x: event.clientX, y: event.clientY });
      })
      .on("mouseout", function () {
        const d = d3.select(this).datum();
        const fill = getRegionFill(d);
        d3.select(this).attr("fill", fill);
        setTooltipContent(null);
      });

    const getRegionFill = (region) => {
      const isInBrush1 = brush1Selection && isRegionInSelection(region, brush1Selection);
      const isInBrush2 = brush2Selection && isRegionInSelection(region, brush2Selection);
      
      if (isInBrush1 && isInBrush2) return "#800080"; // Purple for overlap
      if (isInBrush1) return "#ff6347"; // Red for brush 1
      if (isInBrush2) return "#4682b4"; // Blue for brush 2
      return "#FFFFFF"; // Default white
    };

    const isRegionInSelection = (region, selection) => {
      const centroid = projection(d3.geoCentroid(region));
      const [[x0, y0], [x1, y1]] = selection;
      return centroid &&
             centroid[0] >= x0 &&
             centroid[0] <= x1 &&
             centroid[1] >= y0 &&
             centroid[1] <= y1;
    };

    const updateMapColors = () => {
      mapPaths.attr("fill", d => getRegionFill(d));
    };

    const handleBrush = (event, brushNumber) => {
      const selection = event.selection;
      if (selection) {
        // Update colors in real-time during brushing
        mapPaths.attr("fill", (d) => {
          const centroid = projection(d3.geoCentroid(d));
          if (!centroid) return "#FFFFFF";
          
          const [[x0, y0], [x1, y1]] = selection;
          const isInCurrentBrush = centroid[0] >= x0 && 
                                 centroid[0] <= x1 && 
                                 centroid[1] >= y0 && 
                                 centroid[1] <= y1;
          
          // For brush1 (active)
          if (brushNumber === 1) {
            const isInBrush2 = brush2Selection && isRegionInSelection(d, brush2Selection);
            if (isInCurrentBrush && isInBrush2) return "#800080"; // Purple for overlap
            if (isInCurrentBrush) return "#ff6347"; // Red for brush1
            if (isInBrush2) return "#4682b4"; // Keep brush2 selections
            return "#FFFFFF";
          }
          // For brush2 (active)
          else {
            const isInBrush1 = brush1Selection && isRegionInSelection(d, brush1Selection);
            if (isInCurrentBrush && isInBrush1) return "#800080"; // Purple for overlap
            if (isInCurrentBrush) return "#4682b4"; // Blue for brush2
            if (isInBrush1) return "#ff6347"; // Keep brush1 selections
            return "#FFFFFF";
          }
        });
      } else {
        // If no selection (e.g., during brush start), restore previous state
        updateMapColors();
      }
    };

    const handleBrushEnd = (event, brushNumber) => {
      const selection = event.selection;
      if (selection) {
        const selectedRegions = geoData.features.filter(d => 
          isRegionInSelection(d, selection)
        );

        if (brushNumber === 1) {
          setBrush1Selection(selection);
        } else {
          setBrush2Selection(selection);
        }

        if (typeof onBrush === "function") {
          onBrush(selectedRegions, brushNumber);
        }
      } else {
        if (brushNumber === 1) {
          setBrush1Selection(null);
        } else {
          setBrush2Selection(null);
        }
        if (typeof onBrush === "function") {
          onBrush([], brushNumber);
        }
      }
      updateMapColors();
    };

    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .translateExtent([[0, 0], [width, height]])
      .on("zoom", (event) => {
        zoomContainer.attr("transform", event.transform);
      });

    const brush1 = d3.brush()
      .extent([[0, 0], [width, height]])
      .on("brush", (event) => handleBrush(event, 1))
      .on("end", (event) => handleBrushEnd(event, 1));

    const brush2 = d3.brush()
      .extent([[0, 0], [width, height]])
      .on("brush", (event) => handleBrush(event, 2))
      .on("end", (event) => handleBrushEnd(event, 2));

    const updateBehavior = () => {
      svg.on(".zoom", null);
      brushContainer.selectAll("*").remove();

      if (isZoomMode) {
        svg.call(zoom);
      } else {
        brushContainer.call(isBrush1Active ? brush1 : brush2);
        // Restore previous brush selection if it exists
        if (isBrush1Active && brush1Selection) {
          brushContainer.select(".brush")
            .call(brush1.move, brush1Selection);
        } else if (!isBrush1Active && brush2Selection) {
          brushContainer.select(".brush")
            .call(brush2.move, brush2Selection);
        }
      }
      updateMapColors();
    };

    updateBehavior();

    return () => {
      svg.on(".zoom", null);
      brushContainer.selectAll("*").remove();
    };
  }, [isZoomMode, isBrush1Active, brush1Selection, brush2Selection]);

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