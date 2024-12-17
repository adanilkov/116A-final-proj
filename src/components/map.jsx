'use client';

import { useEffect, useState } from "react";
import * as d3 from "d3";
import geoData from './counties_with_real_estate.json';
import MapTooltip from "@/components/utils/map_tooltip";
import { Switch } from '@headlessui/react';

export default function MapVis({ onBrush, filteredCounties, previewToggled }) {
  const [tooltipContent, setTooltipContent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isBrush1Active, setIsBrush1Active] = useState(true);
  const [isZoomMode, setIsZoomMode] = useState(true);
  const [brush1Selection, setBrush1Selection] = useState(null);
  const [brush2Selection, setBrush2Selection] = useState(null);
  const [brush1States, setBrush1States] = useState(new Set());
  const [brush2States, setBrush2States] = useState(new Set());
  const [isStateMode, setIsStateMode] = useState(false);

  useEffect(() => {
    const width = 800;
    const height = 525;

    const svg = d3.select('#map')
      .attr('width', '100%')
      .attr('height', height)
      .style("background", "bg-base-200")
      .style("border-radius", "8px");

    svg.selectAll(".zoom-container").remove();
    svg.selectAll(".brush-container").remove();
    svg.selectAll(".zoom-container")
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const zoomContainer = svg.append("g").attr("class", "zoom-container");
    const brushContainer = svg.append("g").attr("class", "brush-container");

    const h = parseInt(svg.style('height'));
    const projection = d3.geoAlbersUsa().fitSize([width, h], geoData);
    const pathGenerator = d3.geoPath().projection(projection);

    // Centering the map
    // const translate = [width / 2.2, height / 2.2];

    const mapPaths = zoomContainer.selectAll("path")
      .data(geoData.features)
      .join("path")
      .attr("d", pathGenerator)
      .attr("fill", "#FFFFFF")
      .attr("stroke", "#555")
      .attr("stroke-width", 0.5)
      // .attr("transform", `translate(${translate})`)
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
        if (isStateMode) {
          const isInBrush1States = brush1States.has(region.properties.STATEFP);
          const isInBrush2States = brush2States.has(region.properties.STATEFP);
          
          if (isInBrush1States && isInBrush2States) return "#800080"; // Purple for overlap
          if (isInBrush1States) return "#ff6347"; // Red for brush 1
          if (isInBrush2States) return "#4682b4"; // Blue for brush 2
          return "#FFFFFF"; // Default white
        } else {
          const isInBrush1 = brush1Selection && isRegionInSelection(region, brush1Selection);
          const isInBrush2 = brush2Selection && isRegionInSelection(region, brush2Selection);
          const inFilter = filteredCounties.includes(region)
          if (inFilter && previewToggled) return "#32a889"
          
          if (isInBrush1 && isInBrush2) return "#800080"; // Purple for overlap
          if (isInBrush1) return "#ff6347"; // Red for brush 1
          if (isInBrush2) return "#4682b4"; // Blue for brush 2
          return "#FFFFFF"; // Default white
        }
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
      if (!selection) {
        updateMapColors();
        return;
      }
    
      const [[x0, y0], [x1, y1]] = selection;
    
      if (isStateMode) {
        // Find all states in the current brush
        const targetStateFps = new Set();
        geoData.features.forEach(feature => {
          const centroid = projection(d3.geoCentroid(feature));
          if (centroid &&
              centroid[0] >= x0 &&
              centroid[0] <= x1 &&
              centroid[1] >= y0 &&
              centroid[1] <= y1) {
            targetStateFps.add(feature.properties.STATEFP);
          }
        });
    
        // Get the current stored states
        const currentStates = brushNumber === 1 ? brush1States : brush2States;
        targetStateFps.forEach(state => currentStates.add(state));
    
        // Update all region colors
        mapPaths.attr("fill", d => getRegionFill(d));
      } else {
        // Original county-based brushing logic
        mapPaths.attr("fill", d => {
          const centroid = projection(d3.geoCentroid(d));
          if (!centroid) return "#FFFFFF";
          
          const isInCurrentBrush = centroid[0] >= x0 && 
                                  centroid[0] <= x1 && 
                                  centroid[1] >= y0 && 
                                  centroid[1] <= y1;
          
          if (brushNumber === 1) {
            const isInBrush2 = brush2Selection && isRegionInSelection(d, brush2Selection);
            if (isInCurrentBrush && isInBrush2) return "#800080";
            if (isInCurrentBrush) return "#ff6347";
            if (isInBrush2) return "#4682b4";
          } else {
            const isInBrush1 = brush1Selection && isRegionInSelection(d, brush1Selection);
            if (isInCurrentBrush && isInBrush1) return "#800080";
            if (isInCurrentBrush) return "#4682b4";
            if (isInBrush1) return "#ff6347";
          }
          return "#FFFFFF";
        });
      }
    };
    
    // Update handleBrushEnd function
    const handleBrushEnd = (event, brushNumber) => {
      const selection = event.selection;
      if (!selection) {
        if (brushNumber === 1) {
          setBrush1Selection(null);
          setBrush1States(new Set());
        } else {
          setBrush2Selection(null);
          setBrush2States(new Set());
        }
        if (typeof onBrush === "function") {
          onBrush([], brushNumber);
        }
        updateMapColors();
        return;
      }
    
      const [[x0, y0], [x1, y1]] = selection;
      let selectedRegions;
    
      if (isStateMode) {
        // Get all states in the brush selection
        const newStates = new Set();
        geoData.features.forEach(feature => {
          const centroid = projection(d3.geoCentroid(feature));
          if (centroid &&
              centroid[0] >= x0 &&
              centroid[0] <= x1 &&
              centroid[1] >= y0 &&
              centroid[1] <= y1) {
            newStates.add(feature.properties.STATEFP);
          }
        });
    
        // Update the appropriate brush's state set
        if (brushNumber === 1) {
          setBrush1States(new Set([...brush1States, ...newStates]));
        } else {
          setBrush2States(new Set([...brush2States, ...newStates]));
        }
    
        // Select all counties in all selected states
        const stateSet = brushNumber === 1 ? brush1States : brush2States;
        newStates.forEach(state => stateSet.add(state));
        selectedRegions = geoData.features.filter(d => stateSet.has(d.properties.STATEFP));
      } else {
        // Normal county-based selection
        selectedRegions = geoData.features.filter(d => isRegionInSelection(d, selection));
      }
    
      if (brushNumber === 1) {
        setBrush1Selection(selection);
      } else {
        setBrush2Selection(selection);
      }
    
      if (typeof onBrush === "function") {
        onBrush(selectedRegions, brushNumber);
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
  }, [isZoomMode, isBrush1Active, brush1Selection, brush2Selection, brush1States, brush2States, isStateMode]);

  return (
    <div className="map-container relative border border-gray-300 p-4 bg-base-200 rounded-xl">
      <svg id="map" className="w-full h-auto"></svg>
      {tooltipContent && (
        <MapTooltip tooltipContent={tooltipContent} position={tooltipPosition} />
      )}
      <div className="mt-4 flex items-center gap-4 h-8">
        <Switch
          checked={isZoomMode}
          onChange={setIsZoomMode}
          className={`${isZoomMode ? 'bg-primary' : 'bg-accent'} 
                      relative inline-flex items-center h-6 rounded-full w-11`}
        >
          <span className="sr-only">Toggle between Zoom and Brush mode</span>
          <span
            className={`${
              isZoomMode ? 'translate-x-6' : 'translate-x-1'
            } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
          />
        </Switch>
        <span>{isZoomMode ? "Toggle View Mode" : "Toggle Insight Mode"}</span>
        {!isZoomMode && (
          <div className="flex gap-4">
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
            <div className="ml-4">
              <Switch
                checked={isStateMode}
                onChange={setIsStateMode}
                className={`${isStateMode ? 'bg-purple-400' : 'bg-gray-400'} 
                            relative inline-flex items-center h-6 rounded-full w-11`}
              >
                <span className="sr-only">Toggle between County and State selection</span>
                <span
                  className={`${
                    isStateMode ? 'translate-x-6' : 'translate-x-1'
                  } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
                />
              </Switch>
              <span className="ml-2">{isStateMode ? "State Selection" : "County Selection"}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
