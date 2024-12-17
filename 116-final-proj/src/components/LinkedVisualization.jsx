'use client';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import dynamic from 'next/dynamic';
import { useFilteredCounties, FilteredCountiesProvider } from './utils/filtered_counties';

const LinkedVisualization = () => {
  const [brush1Regions, setBrush1Regions] = useState([]);
  const [brush2Regions, setBrush2Regions] = useState([]);
  const { filteredCounties } = useFilteredCounties();
  const mountedRef = useRef(true);

  const handleMapBrush = useCallback((selectedRegions, brushNumber) => {
    if (!mountedRef.current) return;
    
    // Process regions and ensure they are in the filtered set if filters are active
    const processedRegions = selectedRegions
      .filter(feature => {
        if (filteredCounties.length === 0) return true;
        return filteredCounties.some(
          county => 
            county.properties.STATEFP === feature.properties.STATEFP &&
            county.properties.NAME === feature.properties.NAME
        );
      })
      .map(feature => ({
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
  }, [filteredCounties]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const MapVis = dynamic(() => import('./map'), { ssr: false });
    const SegmentedBarChart = dynamic(() => import('./barchart'), { ssr: false });
    
    const combinedRegions = [...brush1Regions, ...brush2Regions];
    
    // Render map
    const mapContainer = document.getElementById('map-container');
    if (mapContainer) {
      const MapComponent = (
        <FilteredCountiesProvider>
          <MapVis onBrush={handleMapBrush} filteredCounties={filteredCounties} />
        </FilteredCountiesProvider>
      );
      const mapRoot = document.createElement('div');
      mapRoot.className = 'w-full h-full';
      mapContainer.innerHTML = '';
      mapContainer.appendChild(mapRoot);
      const mapReactRoot = ReactDOM.createRoot(mapRoot);
      mapReactRoot.render(MapComponent);
    }

    // Render chart
    const chartContainer = document.getElementById('barchart-container');
    if (chartContainer) {
      const ChartComponent = <SegmentedBarChart data={combinedRegions} />;
      const chartRoot = document.createElement('div');
      chartRoot.className = 'w-full h-full';
      chartContainer.innerHTML = '';
      chartContainer.appendChild(chartRoot);
      const chartReactRoot = ReactDOM.createRoot(chartRoot);
      chartReactRoot.render(ChartComponent);
    }

    return () => {
      mountedRef.current = false;
      const mapContainer = document.getElementById('map-container');
      const chartContainer = document.getElementById('barchart-container');
      if (mapContainer) mapContainer.innerHTML = '';
      if (chartContainer) chartContainer.innerHTML = '';
    };
  }, [brush1Regions, brush2Regions, filteredCounties, handleMapBrush]);

  return null;
};

export default LinkedVisualization;