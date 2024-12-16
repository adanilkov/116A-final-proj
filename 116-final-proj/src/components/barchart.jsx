'use client';
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const SegmentedBarChart = ({ data = [] }) => {
  const svgRef = useRef();

  useEffect(() => {
    console.log("BarChart received data:", data);
    
    // Clear any existing SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    if (!data || data.length === 0) {
      // Show empty state
      const svg = d3.select(svgRef.current)
        .attr('width', 1200)
        .attr('height', 100);
      
      svg.append('text')
        .attr('x', 600)
        .attr('y', 50)
        .attr('text-anchor', 'middle')
        .text('Select regions on the map to see statistics');
      return;
    }

    // Process data for each metric
    const metrics = [
      { key: 'avg_price', label: 'Average Price', format: '$.2s' },
      { key: 'total_transactions', label: 'Average Total Transactions', format: ',.0f' },
      { key: 'total_price', label: 'Average Total Price', format: '$.2s' }
    ];

    const processedData = metrics.map(metric => {
      const aggregated = d3.rollup(data,
        v => ({
          value: d3.mean(v, d => d[metric.key]),
          count: v.length
        }),
        d => d.brushNumber
      );

      return {
        metric: metric.key,
        label: metric.label,
        format: metric.format,
        data: Array.from(aggregated, ([brushNumber, values]) => ({
          brushNumber,
          value: values.value,
          count: values.count,
          label: `Selection ${brushNumber} (${values.count})`
        }))
      };
    });

    // Dimensions
    const width = 1200; // Increased overall width
    const height = 400;
    const margin = { top: 50, right: 40, bottom: 60, left: 60 };
    const spacing = 120; // Increased spacing between charts
    const chartWidth = (width - margin.left - margin.right - spacing * 2) / 3;
    const innerHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create each chart
    processedData.forEach((metricData, index) => {
      const xOffset = margin.left + (chartWidth + spacing) * index;
      
      const g = svg.append('g')
        .attr('transform', `translate(${xOffset},${margin.top})`);

      // Add background rectangle for visual separation
      g.append('rect')
        .attr('x', -20)
        .attr('y', -30)
        .attr('width', chartWidth + 40)
        .attr('height', innerHeight + 80)
        .attr('fill', '#f8f9fa')
        .attr('rx', 10); // Rounded corners

      // Scales
      const yScale = d3.scaleLinear()
        .domain([0, d3.max(metricData.data, d => d.value)])
        .range([innerHeight, 0]);

      const xScale = d3.scaleBand()
        .domain(metricData.data.map(d => d.label))
        .range([0, chartWidth])
        .padding(0.4); // Increased padding between bars

      // Axes
      const yAxis = d3.axisLeft(yScale)
        .tickFormat(d => d3.format(metricData.format)(d))
        .ticks(5);
      
      const xAxis = d3.axisBottom(xScale);

      // Add axes
      g.append('g')
        .call(yAxis)
        .selectAll('text')
        .style('font-size', '12px')
        .style('text-anchor', 'end');

      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis)
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('font-size', '12px')
        .style('text-anchor', 'end');

      // Add bars
      const bars = g.selectAll('.bar')
        .data(metricData.data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.label))
        .attr('width', xScale.bandwidth())
        .attr('y', innerHeight)
        .attr('fill', d => d.brushNumber === 1 ? '#ff6347' : '#4682b4')
        .attr('rx', 4); // Rounded corners on bars

      // Add value labels
      g.selectAll('.value-label')
        .data(metricData.data)
        .enter()
        .append('text')
        .attr('class', 'value-label')
        .attr('x', d => xScale(d.label) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(d.value) - 8)
        .attr('text-anchor', 'middle')
        .style('fill', 'black')
        .style('font-size', '12px')
        .text(d => d3.format(metricData.format)(d.value));

      // Animate bars
      bars.transition()
        .duration(500)
        .attr('y', d => yScale(d.value))
        .attr('height', d => innerHeight - yScale(d.value));

      // Add title for each chart
      g.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', -20)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text(metricData.label);
    });

  }, [data]); // Re-render when data changes

  return (
    <div className="w-full h-full">
      <svg ref={svgRef} className="w-full h-full" preserveAspectRatio="xMidYMid meet"></svg>
    </div>
  );
};

export default SegmentedBarChart;