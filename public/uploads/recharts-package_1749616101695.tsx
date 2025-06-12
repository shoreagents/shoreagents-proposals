import React, { useState } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ScatterChart, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart, Treemap, FunnelChart, Funnel, LabelList, Sankey,
  XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine, ReferenceArea, ReferenceDot, Brush, ErrorBar,
  RadialBarChart, RadialBar, Surface, Symbols
} from 'recharts';

// Sample data for different charts
const salesData = [
  { month: 'Jan', sales: 4000, profit: 2400, expenses: 1600, error: 200 },
  { month: 'Feb', sales: 3000, profit: 1398, expenses: 1602, error: 150 },
  { month: 'Mar', sales: 2000, profit: 9800, expenses: 800, error: 300 },
  { month: 'Apr', sales: 2780, profit: 3908, expenses: 1200, error: 180 },
  { month: 'May', sales: 1890, profit: 4800, expenses: 1100, error: 220 },
  { month: 'Jun', sales: 2390, profit: 3800, expenses: 1300, error: 160 }
];

const pieData = [
  { name: 'Desktop', value: 45, color: '#0088FE' },
  { name: 'Mobile', value: 30, color: '#00C49F' },
  { name: 'Tablet', value: 20, color: '#FFBB28' },
  { name: 'Other', value: 5, color: '#FF8042' }
];

const scatterData = [
  { x: 100, y: 200, z: 200 },
  { x: 120, y: 100, z: 260 },
  { x: 170, y: 300, z: 400 },
  { x: 140, y: 250, z: 280 },
  { x: 150, y: 400, z: 500 },
  { x: 110, y: 280, z: 200 }
];

const radarData = [
  { subject: 'Math', A: 120, B: 110, fullMark: 150 },
  { subject: 'Chinese', A: 98, B: 130, fullMark: 150 },
  { subject: 'English', A: 86, B: 130, fullMark: 150 },
  { subject: 'Geography', A: 99, B: 100, fullMark: 150 },
  { subject: 'Physics', A: 85, B: 90, fullMark: 150 },
  { subject: 'History', A: 65, B: 85, fullMark: 150 }
];

const treemapData = [
  { name: 'A', size: 24, color: '#8884d8' },
  { name: 'B', size: 18, color: '#83a6ed' },
  { name: 'C', size: 22, color: '#8dd1e1' },
  { name: 'D', size: 12, color: '#82ca9d' },
  { name: 'E', size: 16, color: '#a4de6c' },
  { name: 'F', size: 8, color: '#ffc658' }
];

const funnelData = [
  { name: 'Sent', value: 100, fill: '#8884d8' },
  { name: 'Viewed', value: 80, fill: '#83a6ed' },
  { name: 'Clicked', value: 50, fill: '#8dd1e1' },
  { name: 'Add to Cart', value: 30, fill: '#82ca9d' },
  { name: 'Purchased', value: 15, fill: '#a4de6c' }
];

const radialBarData = [
  { name: 'A', value: 31, fill: '#8884d8' },
  { name: 'B', value: 26, fill: '#83a6ed' },
  { name: 'C', value: 19, fill: '#8dd1e1' },
  { name: 'D', value: 24, fill: '#82ca9d' }
];

const sankeyData = {
  nodes: [
    { name: 'Source A' },
    { name: 'Source B' },
    { name: 'Middle 1' },
    { name: 'Middle 2' },
    { name: 'Target X' },
    { name: 'Target Y' }
  ],
  links: [
    { source: 0, target: 2, value: 10 },
    { source: 1, target: 2, value: 15 },
    { source: 2, target: 4, value: 12 },
    { source: 2, target: 5, value: 13 },
    { source: 1, target: 3, value: 8 },
    { source: 3, target: 4, value: 4 },
    { source: 3, target: 5, value: 4 }
  ]
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ChartCard = ({ title, children }) => (
  <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
    <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
    <div className="h-80">
      {children}
    </div>
  </div>
);

const SmallChartCard = ({ title, children }) => (
  <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
    <h4 className="text-lg font-semibold mb-3 text-gray-800">{title}</h4>
    <div className="h-40">
      {children}
    </div>
  </div>
);

export default function RechartsProject() {
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const CustomizedDot = (props) => {
    const { cx, cy, fill } = props;
    return <Symbols cx={cx} cy={cy} type="star" size={64} fill={fill} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Complete Recharts Component Library
          </h1>
          <p className="text-gray-600">
            Comprehensive showcase of ALL Recharts components and features
          </p>
        </header>

        {/* Main Chart Types */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          {/* Line Chart with Reference Components */}
          <ChartCard title="Line Chart with Reference Components">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <ReferenceLine y={3000} stroke="red" strokeDasharray="8 8" label="Target" />
                <ReferenceDot x="Mar" y={9800} r={8} fill="red" stroke="none" />
                <ReferenceArea x1="Feb" x2="Apr" y1={1000} y2={5000} fill="#8884d8" fillOpacity={0.1} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Area Chart with Brush */}
          <ChartCard title="Area Chart with Brush Navigation">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stackId="1" 
                  stroke="#ff7300" 
                  fill="#ff7300" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  stackId="1" 
                  stroke="#387908" 
                  fill="#387908" 
                  fillOpacity={0.6}
                />
                <Brush dataKey="month" height={30} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Bar Chart with Error Bars */}
          <ChartCard title="Bar Chart with Error Bars">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#8884d8">
                  <ErrorBar dataKey="error" width={4} stroke="red" />
                </Bar>
                <Bar dataKey="expenses" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Pie Chart with Interactive Features */}
          <ChartCard title="Interactive Pie Chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke={index === activeIndex ? '#333' : 'none'}
                      strokeWidth={index === activeIndex ? 2 : 0}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Scatter Chart with Custom Dots */}
          <ChartCard title="Scatter Chart with Custom Symbols">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={scatterData}>
                <CartesianGrid />
                <XAxis type="number" dataKey="x" name="X Value" />
                <YAxis type="number" dataKey="y" name="Y Value" />
                <ZAxis type="number" dataKey="z" range={[64, 144]} name="Size" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Custom Dots" dataKey="z" fill="#8884d8" shape={<CustomizedDot />} />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Radar Chart */}
          <ChartCard title="Skills Comparison - Radar Chart">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 150]} />
                <Radar
                  name="Student A"
                  dataKey="A"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Student B"
                  dataKey="B"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.3}
                />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Composed Chart */}
          <ChartCard title="Composed Chart - Multiple Chart Types">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={salesData}>
                <CartesianGrid stroke="#f5f5f5" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="expenses" 
                  fill="#8884d8" 
                  fillOpacity={0.3} 
                  stroke="#8884d8" 
                />
                <Bar yAxisId="left" dataKey="profit" fill="#413ea0" />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#ff7300" 
                  strokeWidth={2} 
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Radial Bar Chart */}
          <ChartCard title="Radial Bar Chart">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={radialBarData}>
                <RadialBar
                  minAngle={15}
                  label={{ position: 'insideStart', fill: '#fff' }}
                  background
                  clockWise
                  dataKey="value"
                />
                <Legend iconSize={18} width={120} height={140} layout="vertical" verticalAlign="middle" />
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Additional Chart Types */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          {/* Treemap with Custom Content */}
          <ChartCard title="Treemap with Custom Content">
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={treemapData}
                dataKey="size"
                ratio={4/3}
                stroke="#fff"
                content={({ x, y, width, height, name, size, color }) => (
                  <g>
                    <rect x={x} y={y} width={width} height={height} fill={color} stroke="#fff" strokeWidth={2} />
                    <text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="#fff" fontSize="14">
                      {name}
                    </text>
                    <text x={x + width / 2} y={y + height / 2 + 20} textAnchor="middle" fill="#fff" fontSize="12">
                      {size}
                    </text>
                  </g>
                )}
              />
            </ResponsiveContainer>
          </ChartCard>

          {/* Funnel Chart */}
          <ChartCard title="Conversion Funnel Chart">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip />
                <Funnel
                  dataKey="value"
                  data={funnelData}
                  isAnimationActive
                >
                  <LabelList position="center" fill="#fff" stroke="none" />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Full Width Sankey Chart */}
        <div className="mb-8">
          <ChartCard title="Sankey Diagram - Flow Visualization">
            <ResponsiveContainer width="100%" height="100%">
              <Sankey
                data={sankeyData}
                nodePadding={50}
                margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                link={{ stroke: '#77c878' }}
              >
                <Tooltip />
              </Sankey>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Small Components Demo */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Surface Component & Other Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <SmallChartCard title="Surface with Custom SVG">
              <Surface width={200} height={150}>
                <circle cx="100" cy="60" r="25" fill="#8884d8" />
                <text x="100" y="65" textAnchor="middle" fill="white" fontSize="14">
                  Surface
                </text>
                <rect x="60" y="100" width="80" height="20" fill="#82ca9d" rx="10" />
                <text x="100" y="113" textAnchor="middle" fill="white" fontSize="12">
                  Custom SVG
                </text>
              </Surface>
            </SmallChartCard>

            <SmallChartCard title="Symbols Showcase">
              <Surface width={200} height={150}>
                <Symbols cx={40} cy={40} type="circle" size={24} fill="#8884d8" />
                <Symbols cx={80} cy={40} type="cross" size={24} fill="#82ca9d" />
                <Symbols cx={120} cy={40} type="diamond" size={24} fill="#ffc658" />
                <Symbols cx={160} cy={40} type="square" size={24} fill="#ff7c7c" />
                <Symbols cx={40} cy={80} type="star" size={24} fill="#8dd1e1" />
                <Symbols cx={80} cy={80} type="triangle" size={24} fill="#d084d0" />
                <Symbols cx={120} cy={80} type="wye" size={24} fill="#ffb347" />
                <text x="100" y="120" textAnchor="middle" fill="#666" fontSize="12">
                  Symbol Types: ●+◆■★▲Y
                </text>
              </Surface>
            </SmallChartCard>

            <SmallChartCard title="CartesianGrid Variants">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData.slice(0, 4)}>
                  <CartesianGrid 
                    strokeDasharray="5 5" 
                    stroke="#8884d8" 
                    horizontal={true} 
                    vertical={true} 
                  />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Line type="monotone" dataKey="sales" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </SmallChartCard>
          </div>
        </div>

        {/* Axis Components Demo */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Advanced Axis Features</h2>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
            <div>
              <h4 className="text-lg font-semibold mb-3 text-gray-800">Multiple Y-Axes</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="sales" stroke="#8884d8" />
                    <Line yAxisId="right" type="monotone" dataKey="profit" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-3 text-gray-800">Custom Axis Labels</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      angle={-45} 
                      textAnchor="end" 
                      height={60}
                      label={{ value: 'Months', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <footer className="text-center mt-8 text-gray-600">
          <p className="mb-2">✅ Complete Recharts Component Library Showcase</p>
          <p className="text-sm">
            <strong>Included:</strong> All chart types, Reference components (Line/Area/Dot), 
            Error Bars, Brush, Custom Symbols, Surface, Multiple Axes, Sankey, and more!
          </p>
        </footer>
      </div>
    </div>
  );
}