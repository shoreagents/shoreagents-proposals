import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

// Data utilities
const generateSalesData = () => [
  { month: 'Jan', sales: 4000, expenses: 2400 },
  { month: 'Feb', sales: 3000, expenses: 1398 },
  { month: 'Mar', sales: 2000, expenses: 9800 },
  { month: 'Apr', sales: 2780, expenses: 3908 },
  { month: 'May', sales: 1890, expenses: 4800 },
  { month: 'Jun', sales: 2390, expenses: 3800 },
  { month: 'Jul', sales: 3490, expenses: 4300 },
];

const generatePieData = () => [
  { label: 'Desktop', value: 45 },
  { label: 'Mobile', value: 35 },
  { label: 'Tablet', value: 20 },
];

const generateScatterData = () => Array.from({ length: 50 }, () => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 20 + 5,
  category: Math.floor(Math.random() * 3),
}));

// Tooltip utility component
const Tooltip = {
  show: (event, content) => {
    d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(0,0,0,0.9)')
      .style('color', 'white')
      .style('padding', '12px')
      .style('border-radius', '8px')
      .style('font-size', '13px')
      .style('font-weight', '500')
      .style('pointer-events', 'none')
      .style('box-shadow', '0 4px 12px rgba(0,0,0,0.3)')
      .style('z-index', '1000')
      .html(content)
      .style('left', (event.pageX + 10) + 'px')
      .style('top', (event.pageY - 10) + 'px')
      .style('opacity', 0)
      .transition()
      .duration(200)
      .style('opacity', 1);
  },
  hide: () => {
    d3.selectAll('.tooltip')
      .transition()
      .duration(200)
      .style('opacity', 0)
      .remove();
  }
};

// BarChart Component
const BarChart = ({ data, width = 500, height = 350, className = '' }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 30, right: 80, bottom: 50, left: 70 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3
      .scaleBand()
      .domain(data.map(d => d.month))
      .range([0, innerWidth])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => Math.max(d.sales, d.expenses)) * 1.1])
      .range([innerHeight, 0]);

    const colorScale = d3.scaleOrdinal()
      .domain(['sales', 'expenses'])
      .range(['#3b82f6', '#ef4444']);

    // Create bar groups
    const barGroups = g.selectAll('.bar-group')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'bar-group')
      .attr('transform', d => `translate(${xScale(d.month)}, 0)`);

    // Sales bars
    barGroups.append('rect')
      .attr('class', 'bar-sales')
      .attr('x', 0)
      .attr('y', innerHeight)
      .attr('width', xScale.bandwidth() / 2.2)
      .attr('height', 0)
      .attr('fill', colorScale('sales'))
      .attr('rx', 4)
      .style('cursor', 'pointer')
      .transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .attr('y', d => yScale(d.sales))
      .attr('height', d => innerHeight - yScale(d.sales));

    // Expenses bars
    barGroups.append('rect')
      .attr('class', 'bar-expenses')
      .attr('x', xScale.bandwidth() / 2)
      .attr('y', innerHeight)
      .attr('width', xScale.bandwidth() / 2.2)
      .attr('height', 0)
      .attr('fill', colorScale('expenses'))
      .attr('rx', 4)
      .style('cursor', 'pointer')
      .transition()
      .duration(800)
      .delay((d, i) => i * 100 + 50)
      .attr('y', d => yScale(d.expenses))
      .attr('height', d => innerHeight - yScale(d.expenses));

    // Add interactivity
    barGroups.selectAll('rect')
      .on('mouseover', function(event, d) {
        const isExpenses = d3.select(this).classed('bar-expenses');
        const value = isExpenses ? d.expenses : d.sales;
        const type = isExpenses ? 'Expenses' : 'Sales';
        
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 0.8)
          .attr('transform', 'scale(1.05)');
        
        Tooltip.show(event, `<strong>${d.month}</strong><br>${type}: $${value.toLocaleString()}`);
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 1)
          .attr('transform', 'scale(1)');
        Tooltip.hide();
      });

    // Axes
    const xAxis = g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .style('font-size', '12px');

    const yAxis = g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d => `$${d/1000}k`))
      .style('font-size', '12px');

    // Axis labels
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (innerHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Amount ($)');

    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + margin.bottom - 10})`)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Month');

    // Legend
    const legend = g.append('g')
      .attr('transform', `translate(${innerWidth - 60}, 20)`);

    const legendData = [
      { label: 'Sales', color: colorScale('sales') },
      { label: 'Expenses', color: colorScale('expenses') }
    ];

    const legendItems = legend.selectAll('.legend-item')
      .data(legendData)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 25})`);

    legendItems.append('rect')
      .attr('width', 18)
      .attr('height', 18)
      .attr('fill', d => d.color)
      .attr('rx', 3);

    legendItems.append('text')
      .attr('x', 25)
      .attr('y', 14)
      .text(d => d.label)
      .style('font-size', '13px')
      .style('font-weight', '500');

  }, [data, width, height]);

  return (
    <div className={className}>
      <svg ref={svgRef} width={width} height={height} style={{ background: 'white', borderRadius: '12px' }}></svg>
    </div>
  );
};

// PieChart Component
const PieChart = ({ data, width = 350, height = 350, className = '' }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const radius = Math.min(width, height) / 2 - 30;
    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const colorScale = d3.scaleOrdinal()
      .domain(data.map(d => d.label))
      .range(['#3b82f6', '#10b981', '#f59e0b']);

    const pie = d3.pie()
      .value(d => d.value)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(radius * 0.4)
      .outerRadius(radius);

    const outerArc = d3.arc()
      .innerRadius(radius * 1.1)
      .outerRadius(radius * 1.1);

    const arcs = g.selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    // Pie slices
    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => colorScale(d.data.label))
      .style('cursor', 'pointer')
      .style('stroke', 'white')
      .style('stroke-width', 3)
      .each(function(d) { this._current = { startAngle: 0, endAngle: 0 }; })
      .transition()
      .duration(1000)
      .delay((d, i) => i * 200)
      .attrTween('d', function(d) {
        const interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return t => arc(interpolate(t));
      });

    // Add interactivity
    arcs.selectAll('path')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', 'scale(1.08)')
          .style('filter', 'brightness(1.1)');
        
        Tooltip.show(event, `<strong>${d.data.label}</strong><br>Value: ${d.data.value}%<br>Angle: ${((d.endAngle - d.startAngle) * 180 / Math.PI).toFixed(1)}°`);
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', 'scale(1)')
          .style('filter', 'brightness(1)');
        Tooltip.hide();
      });

    // Labels
    arcs.append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('fill', 'white')
      .style('opacity', 0)
      .text(d => `${d.data.value}%`)
      .transition()
      .delay(1200)
      .duration(500)
      .style('opacity', 1);

    // Legend
    const legend = g.append('g')
      .attr('transform', `translate(${radius + 20}, ${-data.length * 12})`);

    const legendItems = legend.selectAll('.legend-item')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 25})`);

    legendItems.append('circle')
      .attr('r', 8)
      .attr('fill', d => colorScale(d.label));

    legendItems.append('text')
      .attr('x', 15)
      .attr('y', 5)
      .text(d => d.label)
      .style('font-size', '13px')
      .style('font-weight', '500');

  }, [data, width, height]);

  return (
    <div className={className}>
      <svg ref={svgRef} width={width} height={height} style={{ background: 'white', borderRadius: '12px' }}></svg>
    </div>
  );
};

// LineChart Component
const LineChart = ({ data, width = 500, height = 350, className = '' }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 30, right: 80, bottom: 50, left: 70 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3
      .scalePoint()
      .domain(data.map(d => d.month))
      .range([0, innerWidth])
      .padding(0.1);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => Math.max(d.sales, d.expenses)) * 1.1])
      .range([innerHeight, 0]);

    const colorScale = d3.scaleOrdinal()
      .domain(['sales', 'expenses'])
      .range(['#3b82f6', '#ef4444']);

    // Line generators
    const salesLine = d3
      .line()
      .x(d => xScale(d.month))
      .y(d => yScale(d.sales))
      .curve(d3.curveCardinal);

    const expensesLine = d3
      .line()
      .x(d => xScale(d.month))
      .y(d => yScale(d.expenses))
      .curve(d3.curveCardinal);

    // Add gradient definitions
    const defs = svg.append('defs');
    
    const salesGradient = defs.append('linearGradient')
      .attr('id', 'salesGradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', 0)
      .attr('x2', 0).attr('y2', innerHeight);
    
    salesGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', colorScale('sales'))
      .attr('stop-opacity', 0.3);
    
    salesGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', colorScale('sales'))
      .attr('stop-opacity', 0);

    // Area under sales line
    const salesArea = d3
      .area()
      .x(d => xScale(d.month))
      .y0(innerHeight)
      .y1(d => yScale(d.sales))
      .curve(d3.curveCardinal);

    g.append('path')
      .datum(data)
      .attr('fill', 'url(#salesGradient)')
      .attr('d', salesArea)
      .style('opacity', 0)
      .transition()
      .duration(1000)
      .style('opacity', 1);

    // Lines
    const salesPath = g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', colorScale('sales'))
      .attr('stroke-width', 3)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', salesLine);

    const expensesPath = g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', colorScale('expenses'))
      .attr('stroke-width', 3)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('stroke-dasharray', '8,4')
      .attr('d', expensesLine);

    // Animate lines
    const salesLength = salesPath.node().getTotalLength();
    const expensesLength = expensesPath.node().getTotalLength();

    salesPath
      .attr('stroke-dasharray', salesLength + ' ' + salesLength)
      .attr('stroke-dashoffset', salesLength)
      .transition()
      .duration(1500)
      .attr('stroke-dashoffset', 0);

    expensesPath
      .attr('stroke-dasharray', expensesLength + ' ' + expensesLength)
      .attr('stroke-dashoffset', expensesLength)
      .transition()
      .duration(1500)
      .delay(300)
      .attr('stroke-dashoffset', 0)
      .on('end', function() {
        d3.select(this).attr('stroke-dasharray', '8,4');
      });

    // Data points
    const salesDots = g.selectAll('.dot-sales')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot-sales')
      .attr('cx', d => xScale(d.month))
      .attr('cy', d => yScale(d.sales))
      .attr('r', 0)
      .attr('fill', colorScale('sales'))
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .transition()
      .duration(500)
      .delay((d, i) => 1500 + i * 100)
      .attr('r', 6);

    const expensesDots = g.selectAll('.dot-expenses')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot-expenses')
      .attr('cx', d => xScale(d.month))
      .attr('cy', d => yScale(d.expenses))
      .attr('r', 0)
      .attr('fill', colorScale('expenses'))
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .transition()
      .duration(500)
      .delay((d, i) => 1800 + i * 100)
      .attr('r', 6);

    // Add interactivity to dots
    g.selectAll('circle')
      .on('mouseover', function(event, d) {
        const isSales = d3.select(this).classed('dot-sales');
        const value = isSales ? d.sales : d.expenses;
        const type = isSales ? 'Sales' : 'Expenses';
        
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 8)
          .style('filter', 'drop-shadow(0 0 8px rgba(0,0,0,0.3))');
        
        Tooltip.show(event, `<strong>${d.month}</strong><br>${type}: $${value.toLocaleString()}`);
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 6)
          .style('filter', 'none');
        Tooltip.hide();
      });

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .style('font-size', '12px');

    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d => `$${d/1000}k`))
      .style('font-size', '12px');

    // Axis labels
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (innerHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Amount ($)');

    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + margin.bottom - 10})`)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Month');

    // Legend
    const legend = g.append('g')
      .attr('transform', `translate(${innerWidth - 80}, 20)`);

    const legendData = [
      { label: 'Sales', color: colorScale('sales'), style: 'solid' },
      { label: 'Expenses', color: colorScale('expenses'), style: 'dashed' }
    ];

    const legendItems = legend.selectAll('.legend-item')
      .data(legendData)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 25})`);

    legendItems.append('line')
      .attr('x1', 0)
      .attr('x2', 20)
      .attr('y1', 9)
      .attr('y2', 9)
      .attr('stroke', d => d.color)
      .attr('stroke-width', 3)
      .attr('stroke-dasharray', d => d.style === 'dashed' ? '6,3' : 'none');

    legendItems.append('text')
      .attr('x', 25)
      .attr('y', 14)
      .text(d => d.label)
      .style('font-size', '13px')
      .style('font-weight', '500');

  }, [data, width, height]);

  return (
    <div className={className}>
      <svg ref={svgRef} width={width} height={height} style={{ background: 'white', borderRadius: '12px' }}></svg>
    </div>
  );
};

// ScatterPlot Component
const ScatterPlot = ({ data, width = 500, height = 350, className = '' }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 30, right: 80, bottom: 50, left: 70 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, d => d.x))
      .range([0, innerWidth])
      .nice();

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(data, d => d.y))
      .range([innerHeight, 0])
      .nice();

    const sizeScale = d3
      .scaleSqrt()
      .domain(d3.extent(data, d => d.size))
      .range([4, 20]);

    const colorScale = d3.scaleOrdinal()
      .domain([0, 1, 2])
      .range(['#3b82f6', '#10b981', '#f59e0b']);

    // Add dots
    const dots = g.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', 0)
      .attr('fill', d => colorScale(d.category))
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .style('opacity', 0.8);

    // Animate dots
    dots.transition()
      .duration(800)
      .delay((d, i) => i * 20)
      .attr('r', d => sizeScale(d.size));

    // Add interactivity
    dots.on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', sizeScale(d.size) * 1.5)
          .style('opacity', 1)
          .style('filter', 'drop-shadow(0 0 8px rgba(0,0,0,0.4))');
        
        Tooltip.show(event, `<strong>Data Point</strong><br>X: ${d.x.toFixed(2)}<br>Y: ${d.y.toFixed(2)}<br>Size: ${d.size.toFixed(2)}<br>Category: ${d.category + 1}`);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', sizeScale(d.size))
          .style('opacity', 0.8)
          .style('filter', 'none');
        Tooltip.hide();
      });

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .style('font-size', '12px');

    g.append('g')
      .call(d3.axisLeft(yScale))
      .style('font-size', '12px');

    // Axis labels
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (innerHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Y Value');

    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + margin.bottom - 10})`)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('X Value');

    // Legend
    const legend = g.append('g')
      .attr('transform', `translate(${innerWidth - 80}, 20)`);

    const legendData = [0, 1, 2].map(cat => ({
      category: cat,
      color: colorScale(cat),
      label: `Category ${cat + 1}`
    }));

    const legendItems = legend.selectAll('.legend-item')
      .data(legendData)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 25})`);

    legendItems.append('circle')
      .attr('r', 8)
      .attr('fill', d => d.color)
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    legendItems.append('text')
      .attr('x', 15)
      .attr('y', 5)
      .text(d => d.label)
      .style('font-size', '12px')
      .style('font-weight', '500');

  }, [data, width, height]);

  return (
    <div className={className}>
      <svg ref={svgRef} width={width} height={height} style={{ background: 'white', borderRadius: '12px' }}></svg>
    </div>
  );
};

// StatCard Component
const StatCard = ({ title, value, color, icon, trend }) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <p className={`text-3xl font-bold ${color === 'bg-red-500' ? 'text-red-300' : color === 'bg-green-500' ? 'text-green-300' : 'text-blue-300'}`}>
        {value}
      </p>
      {trend && (
        <p className="text-sm text-gray-300 mt-2">{trend}</p>
      )}
    </div>
  );
};

// ChartSelector Component
const ChartSelector = ({ activeChart, onChartChange }) => {
  const chartTypes = [
    { key: 'bar', label: 'Bar Chart', color: 'bg-blue-500', icon: '📊' },
    { key: 'pie', label: 'Pie Chart', color: 'bg-green-500', icon: '🥧' },
    { key: 'line', label: 'Line Chart', color: 'bg-purple-500', icon: '📈' },
    { key: 'scatter', label: 'Scatter Plot', color: 'bg-orange-500', icon: '🔵' },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 mb-8">
      {chartTypes.map(({ key, label, color, icon }) => (
        <button
          key={key}
          onClick={() => onChartChange(key)}
          className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
            activeChart === key
              ? `${color} text-white shadow-xl scale-105`
              : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
          }`}
        >
          <span className="text-xl">{icon}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
};

// DataControls Component
const DataControls = ({ onDataRefresh, isAnimating, onToggleAnimation }) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mb-6">
      <button
        onClick={onDataRefresh}
        className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300 border border-white/20"
      >
        <span>🔄</span>
        Refresh Data
      </button>
      <button
        onClick={onToggleAnimation}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 border border-white/20 ${
          isAnimating
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-green-500 text-white hover:bg-green-600'
        }`}
      >
        <span>{isAnimating ? '⏸️' : '▶️'}</span>
        {isAnimating ? 'Stop Animation' : 'Start Animation'}
      </button>
    </div>
  );
};

// FeatureList Component
const FeatureList = () => {
  const features = [
    { icon: '🎯', text: 'Interactive hover tooltips with detailed information' },
    { icon: '🎨', text: 'Smooth animations and micro-interactions' },
    { icon: '⚡', text: 'Real-time data updates and live charts' },
    { icon: '📱', text: 'Fully responsive design for all devices' },
    { icon: '🔄', text: 'Multiple chart types with D3.js integration' },
    { icon: '✨', text: 'Modern glassmorphism UI with gradient effects' },
    { icon: '🎭', text: 'Advanced SVG animations and transitions' },
    { icon: '📊', text: 'Data-driven visualizations with custom scales' },
  ];

  return (
    <div className="mt-8 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
      <h3 className="text-xl font-semibold text-white mb-6 text-center">Interactive Features</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex items-center gap-3 text-blue-100 p-3 rounded-lg hover:bg-white/10 transition-all duration-300"
          >
            <span className="text-xl">{feature.icon}</span>
            <span className="text-sm">{feature.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const [activeChart, setActiveChart] = useState('bar');
  const [salesData, setSalesData] = useState(generateSalesData());
  const [pieData, setPieData] = useState(generatePieData());
  const [scatterData, setScatterData] = useState(generateScatterData());
  const [isAnimating, setIsAnimating] = useState(true);

  // Auto-refresh data
  useEffect(() => {
    if (!isAnimating) return;

    const interval = setInterval(() => {
      setSalesData(prevData => 
        prevData.map(item => ({
          ...item,
          sales: Math.max(1000, item.sales + (Math.random() - 0.5) * 800),
          expenses: Math.max(800, item.expenses + (Math.random() - 0.5) * 600),
        }))
      );

      setPieData(prevData => {
        const total = 100;
        const randomValues = prevData.map(() => Math.random());
        const sum = randomValues.reduce((a, b) => a + b, 0);
        return prevData.map((item, index) => ({
          ...item,
          value: Math.round((randomValues[index] / sum) * total)
        }));
      });

      setScatterData(generateScatterData());
    }, 3000);

    return () => clearInterval(interval);
  }, [isAnimating]);

  const handleDataRefresh = () => {
    setSalesData(generateSalesData());
    setPieData(generatePieData());
    setScatterData(generateScatterData());
  };

  const handleToggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  const renderChart = () => {
    const chartProps = {
      width: window.innerWidth < 768 ? 350 : 600,
      height: window.innerWidth < 768 ? 300 : 400,
      className: "flex justify-center"
    };

    switch (activeChart) {
      case 'bar':
        return <BarChart data={salesData} {...chartProps} />;
      case 'pie':
        return <PieChart data={pieData} width={400} height={400} className="flex justify-center" />;
      case 'line':
        return <LineChart data={salesData} {...chartProps} />;
      case 'scatter':
        return <ScatterPlot data={scatterData} {...chartProps} />;
      default:
        return <BarChart data={salesData} {...chartProps} />;
    }
  };

  const calculateStats = () => {
    const totalSales = salesData.reduce((sum, d) => sum + d.sales, 0);
    const totalExpenses = salesData.reduce((sum, d) => sum + d.expenses, 0);
    const netProfit = totalSales - totalExpenses;
    
    return { totalSales, totalExpenses, netProfit };
  };

  const { totalSales, totalExpenses, netProfit } = calculateStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-500 to-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Interactive D3 Dashboard
          </h1>
          <p className="text-blue-200 text-lg">
            Explore dynamic data visualizations with advanced D3.js components
          </p>
        </div>

        {/* Chart Controls */}
        <ChartSelector activeChart={activeChart} onChartChange={setActiveChart} />
        <DataControls 
          onDataRefresh={handleDataRefresh}
          isAnimating={isAnimating}
          onToggleAnimation={handleToggleAnimation}
        />

        {/* Main Chart Area */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-2xl border border-white/20 mb-8">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-white text-center">
              {activeChart === 'bar' && 'Sales vs Expenses Analysis'}
              {activeChart === 'pie' && 'Market Share Distribution'}
              {activeChart === 'line' && 'Performance Trends Over Time'}
              {activeChart === 'scatter' && 'Multi-Dimensional Data Exploration'}
            </h2>
          </div>
          {renderChart()}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Sales"
            value={`${totalSales.toLocaleString()}`}
            color="bg-blue-500"
            icon={<span className="text-white text-xl">💰</span>}
            trend={isAnimating ? "Live updating..." : "Static view"}
          />
          <StatCard
            title="Total Expenses"
            value={`${totalExpenses.toLocaleString()}`}
            color="bg-red-500"
            icon={<span className="text-white text-xl">💸</span>}
            trend={isAnimating ? "Live updating..." : "Static view"}
          />
          <StatCard
            title="Net Profit"
            value={`${netProfit.toLocaleString()}`}
            color="bg-green-500"
            icon={<span className="text-white text-xl">📈</span>}
            trend={netProfit > 0 ? "Profitable" : "Loss"}
          />
        </div>

        {/* Feature List */}
        <FeatureList />

        {/* Footer */}
        <div className="text-center mt-8 text-blue-200">
          <p>Built with React, D3.js, and Tailwind CSS</p>
          <p className="text-sm mt-2">
            {isAnimating && "🔴 Live Mode: Data updates every 3 seconds"}
            {!isAnimating && "⏸️ Paused: Click 'Start Animation' to enable live updates"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;