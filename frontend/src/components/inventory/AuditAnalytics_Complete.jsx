import React, { useState, useEffect, useMemo } from "react";
import { inventoryApi } from "../../api/inventory";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import "./MonthlyInventoryAudit.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AuditAnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [discrepancyReasons, setDiscrepancyReasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState(6);
  const [chartType, setChartType] = useState("line");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        
        // Fetch analytics data
        const analyticsRes = await inventoryApi.getAuditAnalytics(months);
        setAnalyticsData(analyticsRes.data || []);
        
        // Fetch discrepancy reasons
        const reasonsRes = await inventoryApi.getDiscrepancyReasons();
        setDiscrepancyReasons(reasonsRes.data || []);
        
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [months]);

  // Prepare chart data
  const chartData = useMemo(() => ({
    labels: analyticsData.map(item => {
      const date = new Date(item.month + '-01');
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }),
    datasets: [
      {
        label: 'Total Items',
        data: analyticsData.map(item => item.total_items),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
      {
        label: 'Checked Items',
        data: analyticsData.map(item => item.checked),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.1,
      },
      {
        label: 'Matched Items',
        data: analyticsData.map(item => item.matched),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        tension: 0.1,
      },
      {
        label: 'Discrepancies',
        data: analyticsData.map(item => item.discrepancies),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.1,
      },
      {
        label: 'Total Variance',
        data: analyticsData.map(item => Math.abs(item.variance)),
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        tension: 0.1,
      },
    ],
  }), [analyticsData]);

  // Pie chart data for status distribution
  const pieChartData = useMemo(() => {
    const totalMatched = analyticsData.reduce((sum, item) => sum + item.matched, 0);
    const totalDiscrepancies = analyticsData.reduce((sum, item) => sum + item.discrepancies, 0);
    
    return {
      labels: ['Matched Items', 'Discrepancies'],
      datasets: [{
        data: [totalMatched, totalDiscrepancies],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 1
      }]
    };
  }, [analyticsData]);

  // Reasons chart data
  const reasonsChartData = useMemo(() => ({
    labels: discrepancyReasons.map(reason => reason.reason),
    datasets: [{
      label: 'Frequency',
      data: discrepancyReasons.map(reason => reason.count),
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
      ],
      borderWidth: 1
    }]
  }), [discrepancyReasons]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (analyticsData.length === 0) return {
      totalItems: 0,
      totalChecked: 0,
      totalMatched: 0,
      totalDiscrepancies: 0,
      totalVariance: 0,
      accuracyRate: 0
    };

    return analyticsData.reduce((acc, item) => ({
      totalItems: acc.totalItems + item.total_items,
      totalChecked: acc.totalChecked + item.checked,
      totalMatched: acc.totalMatched + item.matched,
      totalDiscrepancies: acc.totalDiscrepancies + item.discrepancies,
      totalVariance: acc.totalVariance + item.variance,
      accuracyRate: acc.totalChecked > 0 ? 
        ((acc.totalMatched + item.matched) / (acc.totalChecked + item.checked)) * 100 : 0
    }), {
      totalItems: 0,
      totalChecked: 0,
      totalMatched: 0,
      totalDiscrepancies: 0,
      totalVariance: 0,
      accuracyRate: 0
    });
  }, [analyticsData]);

  // Export analytics data
  const exportAnalyticsCSV = () => {
    const csvData = analyticsData.map(item => ({
      Month: item.month,
      'Total Items': item.total_items,
      'Checked Items': item.checked,
      'Matched Items': item.matched,
      Discrepancies: item.discrepancies,
      Variance: item.variance,
      'Accuracy Rate': `${item.accuracy_rate.toFixed(2)}%`
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit_analytics_${months}_months.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="monthly-audit-page">
        <div className="audit-loading-card">
          <div className="spinner"></div>
          <p>Loading audit analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="monthly-audit-page">
      <div className="monthly-audit-hero">
        <div>
          <h2>Audit Analytics Dashboard</h2>
          <p>Visualize inventory audit trends and performance metrics.</p>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="audit-stats-grid">
        <div className="audit-stat-card">
          <span>Total Items</span>
          <strong>{summaryStats.totalItems}</strong>
        </div>
        <div className="audit-stat-card">
          <span>Total Checked</span>
          <strong>{summaryStats.totalChecked}</strong>
        </div>
        <div className="audit-stat-card good">
          <span>Total Matched</span>
          <strong>{summaryStats.totalMatched}</strong>
        </div>
        <div className="audit-stat-card warning">
          <span>Total Discrepancies</span>
          <strong>{summaryStats.totalDiscrepancies}</strong>
        </div>
        <div className="audit-stat-card">
          <span>Total Variance</span>
          <strong>{summaryStats.totalVariance}</strong>
        </div>
        <div className="audit-stat-card good">
          <span>Accuracy Rate</span>
          <strong>{summaryStats.accuracyRate.toFixed(2)}%</strong>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="chart-controls">
        <div className="period-selector">
          <label>Period:</label>
          <select 
            value={months} 
            onChange={(e) => setMonths(Number(e.target.value))}
          >
            <option value={3}>Last 3 Months</option>
            <option value={6}>Last 6 Months</option>
            <option value={12}>Last 12 Months</option>
          </select>
        </div>
        
        <div className="chart-type-selector">
          <button 
            className={chartType === 'line' ? 'active' : ''}
            onClick={() => setChartType('line')}
          >
            📈 Line Chart
          </button>
          <button 
            className={chartType === 'bar' ? 'active' : ''}
            onClick={() => setChartType('bar')}
          >
            📊 Bar Chart
          </button>
          <button 
            className={chartType === 'pie' ? 'active' : ''}
            onClick={() => setChartType('pie')}
          >
            🥧 Pie Chart
          </button>
        </div>

        <button onClick={exportAnalyticsCSV} className="btn-export-csv">
          📥 Export Analytics
        </button>
      </div>

      {/* Main Chart */}
      <div className="chart-container">
        {chartType === 'line' && (
          <Line 
            data={chartData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Audit Trends Over Time' }
              },
              scales: { y: { beginAtZero: true } }
            }} 
          />
        )}
        
        {chartType === 'bar' && (
          <Bar 
            data={chartData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Monthly Audit Comparison' }
              },
              scales: { y: { beginAtZero: true } }
            }} 
          />
        )}
        
        {chartType === 'pie' && (
          <Pie 
            data={pieChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'right' },
                title: { display: true, text: 'Audit Status Distribution' }
              }
            }} 
          />
        )}
      </div>

      {/* Discrepancy Reasons Chart */}
      {discrepancyReasons.length > 0 && (
        <div className="chart-container">
          <h3>Discrepancy Reasons Breakdown</h3>
          <Bar 
            data={reasonsChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                title: { display: true, text: 'Common Discrepancy Reasons' }
              },
              scales: { y: { beginAtZero: true } }
            }}
          />
        </div>
      )}

      {/* Data Table */}
      <div className="audit-table-card">
        <div className="audit-table-header">
          <h3>Audit History</h3>
        </div>
        <div className="audit-table-scroll">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Total Items</th>
                <th>Checked</th>
                <th>Matched</th>
                <th>Discrepancies</th>
                <th>Variance</th>
                <th>Accuracy Rate</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.map((item, index) => (
                <tr key={index}>
                  <td>{item.month}</td>
                  <td>{item.total_items}</td>
                  <td>{item.checked}</td>
                  <td className="good">{item.matched}</td>
                  <td className="warning">{item.discrepancies}</td>
                  <td>{item.variance}</td>
                  <td>{item.accuracy_rate.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditAnalyticsDashboard;
