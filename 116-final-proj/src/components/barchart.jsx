'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const SegmentedBarChart = () => {
  const svgRef = useRef();
  
  useEffect(() => {
    // // Clear any existing SVG content
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Data
    const data = [
      { category: "buyers", value: 60, color: "#ff0000" },
      { category: "no data", value: 10, color: "#cccccc" },
      { category: "renters", value: 30, color: "#0000ff" }
    ];
    
    // Dimensions
    const width = 600;
    const barHeight = 30; // Height of the bar
    const gap = 10; // Gap between bar and axis
    const height = barHeight + gap; // Total height including gap
    const margin = { top: 30, right: 20, bottom: 40, left: 40 };
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Create scale
    const xScale = d3.scaleLinear()
      .domain([-100, 100])
      .range([0, width]);
    
    // Create axis
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d => Math.abs(d));
    
    // Add axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis);
    
    // Calculate cumulative positions
    let cumulative = -data[0].value;
    const segments = data.map(d => {
      const segment = {
        ...d,
        start: cumulative,
        end: cumulative + d.value
      };
      cumulative += d.value;
      return segment;
    });

    svg.append('text')
      .attr('x', xScale(segments[0].end))
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', 'black')
      .text('Highest Buyer Percentage');

    
    // Create segments
    const bars = svg.selectAll('.segment')
      .data(segments)
      .enter()
      .append('rect')
      .attr('class', 'segment')
      .attr('x', d => xScale(d.start))
      .attr('y', 0) // Start at top
      .attr('width', d => Math.abs(xScale(d.value) - xScale(0)))
      .attr('height', barHeight) // Use barHeight instead of total height
      .attr('fill', d => d.color)
      .style('cursor', 'pointer');
    
    // Add interactivity
    bars.on('mouseover', function(event, d) {
      d3.select(this)
        .attr('opacity', 0.7);
        
      // Add tooltip
      svg.append('text')
        .attr('class', 'tooltip')
        .attr('x', xScale(d.start + d.value/2))
        .attr('y', -5)
        .attr('text-anchor', 'middle')
        .text(`${d.category}: ${Math.abs(d.value)}%`);
    })
    .on('mouseout', function() {
      d3.select(this)
        .attr('opacity', 1);
      svg.selectAll('.tooltip').remove();
    });

    bars.transition()
      .duration(500)
      .attr('width', d => Math.abs(xScale(d.value) - xScale(0)));
    
    // Add year label
    svg.append('text')
      .attr('x', width/2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .attr('font-size', '24px')
      .text('1985');
      
    // Add label
    svg.append('text')
      .attr('x', width/2)
      .attr('y', height + 35)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .text('Percentage of renters vs. buyers in selected region.');
      
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <svg ref={svgRef} className="w-full"></svg>
    </div>
  );
};

export default SegmentedBarChart;
