'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import SegmentedBarChart from './barchart';
import MapVis from './map';

const LinkedVisualization = ({filteredCounties, previewToggled}) => {
  const [brush1Regions, setBrush1Regions] = useState([]);
  const [brush2Regions, setBrush2Regions] = useState([]);
  const [mapRoot, setMapRoot] = useState(null);
  const [chartRoot, setChartRoot] = useState(null);

  const handleMapBrush = useCallback((selectedRegions, brushNumber) => {
    
    const processedRegions = selectedRegions.map(feature => ({
      name: feature.properties.NAME,
      avg_price: parseFloat(feature.properties.avg_price),
      total_price: parseFloat(feature.properties.total_price),
      total_transactions: parseInt(feature.properties.total_transactions),
      brushNumber
    }));

    if (brushNumber === 1) {
      setBrush1Regions(processedRegions);
    } else {
      setBrush2Regions(processedRegions);
    }
  }, []);

  const combinedRegions = [
    ...brush1Regions,
    ...brush2Regions
  ];

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Cleanup function to prevent memory leaks
    return () => {
      if (mapRoot) mapRoot.unmount();
      if (chartRoot) chartRoot.unmount();
    };
  }, [mapRoot, chartRoot]);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Render map into map-container
    const mapContainer = document.getElementById('map-container');
    if (mapContainer && !mapRoot) {
      mapContainer.innerHTML = '';
      const mapDiv = document.createElement('div');
      mapDiv.className = 'w-full h-full';
      mapContainer.appendChild(mapDiv);
      const newMapRoot = createRoot(mapDiv);
      setMapRoot(newMapRoot);
      newMapRoot.render(<MapVis onBrush={handleMapBrush} filteredCounties={filteredCounties} previewToggled={previewToggled} />);
    } else if (mapRoot) {
      mapRoot.render(<MapVis onBrush={handleMapBrush} filteredCounties={filteredCounties} previewToggled={previewToggled} />);
    }

    // Render barchart into barchart-container
    const barchartContainer = document.getElementById('barchart-container');
    if (barchartContainer && !chartRoot) {
      barchartContainer.innerHTML = '';
      const barchartDiv = document.createElement('div');
      barchartDiv.className = 'w-full h-full';
      barchartContainer.appendChild(barchartDiv);
      const newChartRoot = createRoot(barchartDiv);
      setChartRoot(newChartRoot);
      newChartRoot.render(<SegmentedBarChart data={combinedRegions} />);
    } else if (chartRoot) {
      chartRoot.render(<SegmentedBarChart data={combinedRegions} />);
    }
  }, [combinedRegions, handleMapBrush, mapRoot, chartRoot]);

  // Return null since we're rendering into specific containers
  return null;
};

export default LinkedVisualization;