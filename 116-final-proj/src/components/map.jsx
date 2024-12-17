'use client';

import { useEffect, useState } from "react";
import * as d3 from "d3";
import geoData from './counties_with_real_estate.json';
import MapTooltip from "@/components/utils/map_tooltip";
import { Switch } from '@headlessui/react';
import { useFilteredCounties } from "./utils/filtered_counties";

export default function MapVis({ onBrush, height = 525 }) {
  const [tooltipContent, setTooltipContent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isBrush1Active, setIsBrush1Active] = useState(true);
  const [isZoomMode, setIsZoomMode] = useState(true);
  const [brush1Selection, setBrush1Selection] = useState(null);
  const [brush2Selection, setBrush2Selection] = useState(null);
  const [brush1States, setBrush1States] = useState(new Set());
  const [brush2States, setBrush2States] = useState(new Set());
  const [isStateMode, setIsStateMode] = useState(false);

  // Get filtered counties context at the component level
  const { filteredCounties } = useFilteredCounties();

  useEffect(() => {
    const width = 800;

    const svg = d3.select('#map')
      .attr('width', '100%')
      .attr('height', height)
      .style("background", "bg-base-200")
      .style("border-radius", "8px");

    svg.selectAll(".zoom-container").remove();
    svg.selectAll(".brush-container").remove();

    const zoomContainer = svg.append("g").attr("class", "zoom-container");
    const brushContainer = svg.append("g").attr("class", "brush-container");

    const h = parseInt(svg.style('height'));
    const projection = d3.geoAlbersUsa().fitSize([width, h], geoData);
    const pathGenerator = d3.geoPath().projection(projection);

    const getRegionFill = (region) => {
      if (isStateMode) {
        // State mode logic remains the same
        const isInBrush1States = brush1States.has(region.properties.STATEFP);
        const isInBrush2States = brush2States.has(region.properties.STATEFP);
        
        if (isInBrush1States && isInBrush2States) return "#800080";
        if (isInBrush1States) return "#ff6347";
        if (isInBrush2States) return "#4682b4";
        return "#FFFFFF";
      } else {
        // County mode logic - Fix the filtering check
        const isInBrush1 = brush1Selection && isRegionInSelection(region, brush1Selection);
        const isInBrush2 = brush2Selection && isRegionInSelection(region, brush2Selection);
    
        // Modified filtering check to match exact county
        const isFiltered = filteredCounties.some(
          (county) => 
            county.properties.STATEFP === region.properties.STATEFP &&
            county.properties.NAME === region.properties.NAME
        );
    
        if (isFiltered) return "#00FF00";
        if (isInBrush1 && isInBrush2) return "#800080";
        if (isInBrush1) return "#ff6347";
        if (isInBrush2) return "#4682b4";
        return "#FFFFFF";
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

    const mapPaths = zoomContainer.selectAll("path")
      .data(geoData.features)
      .join("path")
      .attr("d", pathGenerator)
      .attr("fill", getRegionFill)
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
        d3.select(this).attr("fill", getRegionFill(d));
        setTooltipContent(null);
      });

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
    
        const currentStates = brushNumber === 1 ? brush1States : brush2States;
        targetStateFps.forEach(state => currentStates.add(state));
    
        updateMapColors();
      } else {
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
    
        if (brushNumber === 1) {
          setBrush1States(new Set([...brush1States, ...newStates]));
        } else {
          setBrush2States(new Set([...brush2States, ...newStates]));
        }
    
        const stateSet = brushNumber === 1 ? brush1States : brush2States;
        newStates.forEach(state => stateSet.add(state));
        selectedRegions = geoData.features.filter(d => stateSet.has(d.properties.STATEFP));
      } else {
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
  }, [isZoomMode, isBrush1Active, brush1Selection, brush2Selection, brush1States, brush2States, isStateMode, filteredCounties, height, onBrush]);

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
          <>
            <div className="ml-4">
              <Switch
                checked={isBrush1Active}
                onChange={setIsBrush1Active}
                className={`${isBrush1Active ? 'bg-orange-400' : 'bg-accent'} 
                           relative inline-flex items-center h-6 rounded-full w-11`}
              >
                <span className="sr-only">Toggle between Brush 1 and Brush 2</span>
                <span
                  className={`${
                    isBrush1Active ? 'translate-x-6' : 'translate-x-1'
                  } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
                />
              </Switch>
              <span className="ml-2">{isBrush1Active ? "Toggle Brush 1" : "Toggle Brush 2"}</span>
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
          </>
        )}
      </div>
    </div>
  );
}