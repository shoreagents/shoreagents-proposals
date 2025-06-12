import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as Chart from 'chart.js';

// Register all Chart.js components
Chart.Chart.register(
  Chart.CategoryScale,
  Chart.LinearScale,
  Chart.PointElement,
  Chart.LineElement,
  Chart.BarElement,
  Chart.ArcElement,
  Chart.RadialLinearScale,
  Chart.Title,
  Chart.Tooltip,
  Chart.Legend,
  Chart.Filler,
  Chart.SubTitle
);

// Base Chart Component (reusable wrapper)
const BaseChart = ({ type, data, options, onDataPointClick, className = "" }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart.Chart(ctx, {
      type: type,
      data: data,
      options: {
        ...options,
        onClick: (event, elements) => {
          if (elements.length > 0 && onDataPointClick) {
            const element = elements[0];
            onDataPointClick(element.datasetIndex, element.index, event);
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [type, data, options, onDataPointClick]);

  return (
    <div className={className}>
      <canvas ref={chartRef} className="max-w-full"></canvas>
    </div>
  );
};

// Line Chart Component
const LineChart = ({ data, options, onDataPointClick, className }) => (
  <BaseChart 
    type="line" 
    data={data} 
    options={options} 
    onDataPointClick={onDataPointClick}
    className={className}
  />
);

// Bar Chart Component
const BarChart = ({ data, options, onDataPointClick, className }) => (
  <BaseChart 
    type="bar" 
    data={data} 
    options={options} 
    onDataPointClick={onDataPointClick}
    className={className}
  />
);

// Horizontal Bar Chart Component
const HorizontalBarChart = ({ data, options, onDataPointClick, className }) => (
  <BaseChart 
    type="bar" 
    data={data} 
    options={{
      ...options,
      indexAxis: 'y'
    }} 
    onDataPointClick={onDataPointClick}
    className={className}
  />
);

// Doughnut Chart Component
const DoughnutChart = ({ data, options, onDataPointClick, className }) => (
  <BaseChart 
    type="doughnut" 
    data={data} 
    options={options} 
    onDataPointClick={onDataPointClick}
    className={className}
  />
);

// Pie Chart Component
const PieChart = ({ data, options, onDataPointClick, className }) => (
  <BaseChart 
    type="pie" 
    data={data} 
    options={options} 
    onDataPointClick={onDataPointClick}
    className={className}
  />
);

// Radar Chart Component
const RadarChart = ({ data, options, onDataPointClick, className }) => (
  <BaseChart 
    type="radar" 
    data={data} 
    options={options} 
    onDataPointClick={onDataPointClick}
    className={className}
  />
);

// Polar Area Chart Component
const PolarAreaChart = ({ data, options, onDataPointClick, className }) => (
  <BaseChart 
    type="polarArea" 
    data={data} 
    options={options} 
    onDataPointClick={onDataPointClick}
    className={className}
  />
);

// Scatter Chart Component
const ScatterChart = ({ data, options, onDataPointClick, className }) => (
  <BaseChart 
    type="scatter" 
    data={data} 
    options={options} 
    onDataPointClick={onDataPointClick}
    className={className}
  />
);

// Bubble Chart Component
const BubbleChart = ({ data, options, onDataPointClick, className }) => (
  <BaseChart 
    type="bubble" 
    data={data} 
    options={options} 
    onDataPointClick={onDataPointClick}
    className={className}
  />
);

// Chart Type Selector Component
const ChartTypeSelector = ({ currentType, onTypeChange }) => {
  const chartTypes = [
    { value: 'line', label: 'Line', icon: '📈' },
    { value: 'bar', label: 'Bar', icon: '📊' },
    { value: 'horizontalBar', label: 'H-Bar', icon: '📋' },
    { value: 'doughnut', label: 'Doughnut', icon: '🍩' },
    { value: 'pie', label: 'Pie', icon: '🥧' },
    { value: 'radar', label: 'Radar', icon: '🎯' },
    { value: 'polarArea', label: 'Polar', icon: '🎨' },
    { value: 'scatter', label: 'Scatter', icon: '⭐' },
    { value: 'bubble', label: 'Bubble', icon: '🫧' }
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Chart Types</h3>
      <div className="grid grid-cols-3 gap-2">
        {chartTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => onTypeChange(type.value)}
            className={`p-2 rounded-lg border-2 transition-all text-center ${
              currentType === type.value
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            <div className="text-lg mb-1">{type.icon}</div>
            <div className="text-xs font-medium">{type.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Data Controls Component
const DataControls = ({ onDataUpdate, currentData, onAddDataset, onRemoveDataset, datasetCount }) => {
  const [inputValue, setInputValue] = useState('');

  const generateRandomData = () => {
    const length = Math.min(currentData.length, 12);
    const newData = Array.from({ length }, () => Math.floor(Math.random() * 100) + 10);
    onDataUpdate(newData);
  };

  const addDataPoint = () => {
    const newValue = inputValue ? parseInt(inputValue) : Math.floor(Math.random() * 100) + 10;
    const newData = [...currentData, newValue];
    onDataUpdate(newData);
    setInputValue('');
  };

  const removeDataPoint = () => {
    if (currentData.length > 1) {
      const newData = currentData.slice(0, -1);
      onDataUpdate(newData);
    }
  };

  const resetData = () => {
    onDataUpdate([65, 59, 80, 81, 56, 55]);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Data Controls</h3>
      
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Custom value"
            className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
          />
          <button
            onClick={addDataPoint}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={generateRandomData}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Random Data
          </button>
          <button
            onClick={removeDataPoint}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Remove Point
          </button>
          <button
            onClick={resetData}
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Reset
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onAddDataset}
            className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Add Dataset
          </button>
          {datasetCount > 1 && (
            <button
              onClick={onRemoveDataset}
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              Remove Dataset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Statistics Display Component
const StatsDisplay = ({ data, selectedPoint, datasets }) => {
  const calculateStats = (dataArray) => {
    const sum = dataArray.reduce((acc, val) => acc + val, 0);
    const average = sum / dataArray.length;
    const max = Math.max(...dataArray);
    const min = Math.min(...dataArray);
    return { sum, average, max, min };
  };

  const allData = datasets ? datasets.flatMap(d => d.data) : data;
  const stats = calculateStats(allData);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Statistics</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.sum}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.average.toFixed(1)}</div>
          <div className="text-sm text-gray-600">Average</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{stats.max}</div>
          <div className="text-sm text-gray-600">Maximum</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.min}</div>
          <div className="text-sm text-gray-600">Minimum</div>
        </div>
      </div>

      {selectedPoint && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
          <div className="text-sm font-medium text-yellow-800">
            Selected: {selectedPoint.label} = {selectedPoint.value}
          </div>
          {selectedPoint.dataset && (
            <div className="text-xs text-yellow-700 mt-1">
              Dataset: {selectedPoint.dataset}
            </div>
          )}
        </div>
      )}

      {datasets && datasets.length > 1 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Dataset Info</h4>
          <div className="space-y-1">
            {datasets.map((dataset, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-600">{dataset.label}:</span>
                <span className="font-medium">{dataset.data.length} points</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Animation Controls Component
const AnimationControls = ({ onAnimationChange, currentAnimation }) => {
  const animationTypes = [
    { value: 'easeInOutQuart', label: 'Smooth' },
    { value: 'easeOutBounce', label: 'Bounce' },
    { value: 'easeInOutElastic', label: 'Elastic' },
    { value: 'linear', label: 'Linear' }
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Animations</h3>
      <div className="grid grid-cols-2 gap-2">
        {animationTypes.map((anim) => (
          <button
            key={anim.value}
            onClick={() => onAnimationChange(anim.value)}
            className={`p-2 rounded border-2 transition-all text-sm ${
              currentAnimation === anim.value
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {anim.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// Color Theme Selector Component
const ColorThemeSelector = ({ onThemeChange, currentTheme }) => {
  const themes = {
    default: {
      name: 'Default',
      colors: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']
    },
    ocean: {
      name: 'Ocean',
      colors: ['#0EA5E9', '#06B6D4', '#0891B2', '#0E7490', '#155E75', '#164E63']
    },
    sunset: {
      name: 'Sunset',
      colors: ['#F97316', '#EA580C', '#DC2626', '#BE123C', '#A21CAF', '#7C3AED']
    },
    nature: {
      name: 'Nature',
      colors: ['#22C55E', '#16A34A', '#15803D', '#166534', '#14532D', '#052E16']
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Color Themes</h3>
      <div className="space-y-2">
        {Object.entries(themes).map(([key, theme]) => (
          <button
            key={key}
            onClick={() => onThemeChange(key)}
            className={`w-full p-2 rounded border-2 transition-all ${
              currentTheme === key
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {theme.colors.slice(0, 4).map((color, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{theme.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Export Controls Component
const ExportControls = ({ chartRef }) => {
  const downloadChart = (format) => {
    if (chartRef?.current) {
      const url = chartRef.current.toBase64Image();
      const link = document.createElement('a');
      link.download = `chart.${format}`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Export Chart</h3>
      <div className="flex gap-2">
        <button
          onClick={() => downloadChart('png')}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-sm transition-colors"
        >
          PNG
        </button>
        <button
          onClick={() => downloadChart('jpg')}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-sm transition-colors"
        >
          JPG
        </button>
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const [chartType, setChartType] = useState('line');
  const [mainData, setMainData] = useState([65, 59, 80, 81, 56, 55]);
  const [datasets, setDatasets] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [animationType, setAnimationType] = useState('easeInOutQuart');
  const [colorTheme, setColorTheme] = useState('default');

  const colorThemes = {
    default: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'],
    ocean: ['#0EA5E9', '#06B6D4', '#0891B2', '#0E7490', '#155E75', '#164E63'],
    sunset: ['#F97316', '#EA580C', '#DC2626', '#BE123C', '#A21CAF', '#7C3AED'],
    nature: ['#22C55E', '#16A34A', '#15803D', '#166534', '#14532D', '#052E16']
  };

  const generateLabels = (dataLength) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return Array.from({ length: dataLength }, (_, i) => months[i] || `Point ${i + 1}`);
  };

  const handleDataPointClick = useCallback((datasetIndex, pointIndex, event) => {
    const labels = generateLabels(mainData.length);
    const dataset = datasets.length > 0 ? datasets[datasetIndex] : { data: mainData, label: 'Main Dataset' };
    
    setSelectedPoint({
      label: labels[pointIndex],
      value: dataset.data[pointIndex],
      dataset: dataset.label
    });
  }, [mainData, datasets]);

  const addDataset = () => {
    const newDataset = {
      label: `Dataset ${datasets.length + 2}`,
      data: Array.from({ length: mainData.length }, () => Math.floor(Math.random() * 100) + 10),
      borderColor: colorThemes[colorTheme][datasets.length % colorThemes[colorTheme].length],
      backgroundColor: colorThemes[colorTheme][datasets.length % colorThemes[colorTheme].length] + '20'
    };
    setDatasets([...datasets, newDataset]);
  };

  const removeDataset = () => {
    if (datasets.length > 0) {
      setDatasets(datasets.slice(0, -1));
    }
  };

  const prepareChartData = () => {
    const labels = generateLabels(mainData.length);
    const colors = colorThemes[colorTheme];

    if (chartType === 'scatter' || chartType === 'bubble') {
      return {
        datasets: [
          {
            label: 'Scatter Data',
            data: mainData.map((y, x) => ({ x, y })),
            backgroundColor: colors[0] + '80',
            borderColor: colors[0]
          }
        ]
      };
    }

    const baseDataset = {
      label: 'Main Dataset',
      data: mainData,
      borderColor: colors[0],
      backgroundColor: ['doughnut', 'pie', 'polarArea'].includes(chartType) 
        ? colors.slice(0, mainData.length).map(color => color + '80')
        : colors[0] + '20',
      fill: chartType === 'line',
      tension: 0.4
    };

    return {
      labels,
      datasets: [baseDataset, ...datasets.map((dataset, index) => ({
        ...dataset,
        borderColor: colors[(index + 1) % colors.length],
        backgroundColor: colors[(index + 1) % colors.length] + '20'
      }))]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: animationType
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: true,
        text: `Interactive ${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: colorThemes[colorTheme][0],
        borderWidth: 1
      }
    },
    scales: !['doughnut', 'pie', 'radar', 'polarArea'].includes(chartType) ? {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: '#6B7280'
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: '#6B7280'
        }
      }
    } : chartType === 'radar' ? {
      r: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: '#6B7280'
        }
      }
    } : undefined,
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  const renderChart = () => {
    const chartData = prepareChartData();
    const commonProps = {
      data: chartData,
      options: chartOptions,
      onDataPointClick: handleDataPointClick,
      className: "h-full"
    };

    switch (chartType) {
      case 'line':
        return <LineChart {...commonProps} />;
      case 'bar':
        return <BarChart {...commonProps} />;
      case 'horizontalBar':
        return <HorizontalBarChart {...commonProps} />;
      case 'doughnut':
        return <DoughnutChart {...commonProps} />;
      case 'pie':
        return <PieChart {...commonProps} />;
      case 'radar':
        return <RadarChart {...commonProps} />;
      case 'polarArea':
        return <PolarAreaChart {...commonProps} />;
      case 'scatter':
        return <ScatterChart {...commonProps} />;
      case 'bubble':
        return <BubbleChart {...commonProps} />;
      default:
        return <LineChart {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Complete Chart.js Dashboard
          </h1>
          <p className="text-gray-600">
            All chart types • Interactive controls • Multiple datasets • Animations & themes
          </p>
        </header>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
          <ChartTypeSelector 
            currentType={chartType} 
            onTypeChange={setChartType} 
          />
          <DataControls 
            onDataUpdate={setMainData} 
            currentData={mainData}
            onAddDataset={addDataset}
            onRemoveDataset={removeDataset}
            datasetCount={datasets.length + 1}
          />
          <StatsDisplay 
            data={mainData} 
            datasets={datasets.length > 0 ? [{ label: 'Main Dataset', data: mainData }, ...datasets] : null}
            selectedPoint={selectedPoint} 
          />
          <AnimationControls 
            onAnimationChange={setAnimationType}
            currentAnimation={animationType}
          />
          <ColorThemeSelector 
            onThemeChange={setColorTheme}
            currentTheme={colorTheme}
          />
        </div>

        {/* Main Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <div className="h-96">
            {renderChart()}
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-semibold text-gray-800 text-sm">9 Chart Types</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <div className="text-2xl mb-2">🖱️</div>
            <div className="font-semibold text-gray-800 text-sm">Click Interactions</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <div className="text-2xl mb-2">🎨</div>
            <div className="font-semibold text-gray-800 text-sm">Color Themes</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <div className="text-2xl mb-2">🎭</div>
            <div className="font-semibold text-gray-800 text-sm">Animations</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <div className="text-2xl mb-2">📈</div>
            <div className="font-semibold text-gray-800 text-sm">Multiple Datasets</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <div className="text-2xl mb-2">📱</div>
            <div className="font-semibold text-gray-800 text-sm">Responsive</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;