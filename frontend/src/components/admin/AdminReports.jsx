import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocation } from "react-router-dom";
import {
  faChartBar,
  faMoneyBillWave,
  faBox,
  faCalendarCheck,
  faStethoscope,
  faUsers,
  faRefresh,
  faBuilding,
  faCalendarAlt,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import "./AdminReports.css";

const AdminReports = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [filterAccount, setFilterAccount] = useState("all");
  const [filterDate, setFilterDate] = useState("month");

  // Simple mock data
  const mockData = {
    overview: {
      totalRevenue: 125750.50,
      totalExpenses: 45320.75,
      netProfit: 80429.75,
      totalTransactions: 1247,
      totalCustomers: 892,
      monthlyTrend: [
        { month: "Jan", revenue: 45000, expenses: 18000 },
        { month: "Feb", revenue: 52000, expenses: 20000 },
        { month: "Mar", revenue: 48500, expenses: 17320 },
        { month: "Apr", revenue: 61000, expenses: 22000 },
      ]
    },
    cashier: {
      totalSales: 98500.50,
      totalRefunds: 3250.00,
      netRevenue: 95250.50,
      topProducts: [
        { name: "Premium Dog Food", sales: 156, revenue: 3900.00 },
        { name: "Cat Food Premium", sales: 142, revenue: 2840.00 },
        { name: "Pet Toys Bundle", sales: 89, revenue: 2670.00 },
      ],
    },
    inventory: {
      totalItems: 1247,
      lowStockItems: 23,
      outOfStockItems: 5,
      categories: [
        { name: "Pet Food", items: 234, value: 12340.50 },
        { name: "Medications", items: 156, value: 15670.75 },
        { name: "Toys & Accessories", items: 189, value: 8920.00 },
      ],
    },
    reception: {
      totalAppointments: 1456,
      completedAppointments: 1234,
      cancelledAppointments: 156,
      staffPerformance: [
        { name: "Dr. Sarah Johnson", appointments: 156, completionRate: 92.3, avgRating: 4.8 },
        { name: "Dr. James Wilson", appointments: 142, completionRate: 89.1, avgRating: 4.7 },
        { name: "Dr. Emily Davis", appointments: 134, completionRate: 87.3, avgRating: 4.6 },
        { name: "Dr. Mike Chen", appointments: 128, completionRate: 85.9, avgRating: 4.5 },
      ]
    },
    veterinary: {
      totalPatients: 892,
      newPatients: 156,
      totalTreatments: 2345,
      totalSurgeries: 89,
      totalVaccinations: 456,
    },
    customers: {
      totalCustomers: 892,
      newCustomers: 156,
      returningCustomers: 736,
      customerRetentionRate: 82.5,
      topCustomers: [
        { name: "John Smith", visits: 23, spent: 3450.75 },
        { name: "Sarah Johnson", visits: 19, spent: 2890.50 },
        { name: "Mike Chen", visits: 17, spent: 2567.25 },
      ],
    }
  };

  // Update active tab when route changes
  useEffect(() => {
    const path = location.pathname;
    if (path === "/admin" || path === "/admin/reports") {
      setActiveTab("overview");
    }
  }, [location.pathname]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  // Simple render functions
  const renderOverview = () => (
    <div className="simple-reports">
      <h3>Overview</h3>
      <div className="simple-stats">
        <div className="simple-stat">
          <strong>Total Revenue:</strong> {formatCurrency(mockData.overview.totalRevenue)}
        </div>
        <div className="simple-stat">
          <strong>Total Expenses:</strong> {formatCurrency(mockData.overview.totalExpenses)}
        </div>
        <div className="simple-stat">
          <strong>Net Profit:</strong> {formatCurrency(mockData.overview.netProfit)}
        </div>
        <div className="simple-stat">
          <strong>Total Transactions:</strong> {mockData.overview.totalTransactions}
        </div>
        <div className="simple-stat">
          <strong>Total Customers:</strong> {mockData.overview.totalCustomers}
        </div>
      </div>
      
      <h4>Monthly Revenue Trend</h4>
      <div className="column-line-chart">
        <div className="chart-container">
          <svg width="100%" height="200" viewBox="0 0 400 200">
            {/* Grid lines */}
            {[0, 50, 100, 150, 200].map((y) => (
              <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#e9ecef" strokeWidth="1" />
            ))}
            
            {/* Line path */}
            <polyline
              fill="none"
              stroke="#007bff"
              strokeWidth="2"
              points={mockData.overview.monthlyTrend.map((month, index) => {
                const x = (index * 100) + 50;
                const y = 200 - (month.revenue / 61000) * 150;
                return `${x},${y}`;
              }).join(' ')}
            />
            
            {/* Data points and columns */}
            {mockData.overview.monthlyTrend.map((month, index) => {
              const x = (index * 100) + 50;
              const height = (month.revenue / 61000) * 150;
              const y = 200 - height;
              return (
                <g key={index}>
                  {/* Column */}
                  <rect
                    x={x - 20}
                    y={y}
                    width="40"
                    height={height}
                    fill="rgba(0, 123, 255, 0.3)"
                    stroke="#007bff"
                    strokeWidth="1"
                  />
                  {/* Data point */}
                  <circle cx={x} cy={y} r="4" fill="#007bff" />
                  {/* Value label */}
                  <text x={x} y={y - 10} textAnchor="middle" fontSize="12" fill="#333">
                    {formatCurrency(month.revenue)}
                  </text>
                  {/* Month label */}
                  <text x={x} y="195" textAnchor="middle" fontSize="12" fill="#555">
                    {month.month}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );

  const renderCashier = () => (
    <div className="simple-reports">
      <h3>Cashier Reports</h3>
      <div className="simple-stats">
        <div className="simple-stat">
          <strong>Total Sales:</strong> {formatCurrency(mockData.cashier.totalSales)}
        </div>
        <div className="simple-stat">
          <strong>Total Refunds:</strong> {formatCurrency(mockData.cashier.totalRefunds)}
        </div>
        <div className="simple-stat">
          <strong>Net Revenue:</strong> {formatCurrency(mockData.cashier.netRevenue)}
        </div>
      </div>
      
      <h4>Sales Distribution</h4>
      <div className="column-line-chart">
        <div className="chart-container">
          <svg width="100%" height="200" viewBox="0 0 400 200">
            {/* Grid lines */}
            {[0, 50, 100, 150, 200].map((y) => (
              <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#e9ecef" strokeWidth="1" />
            ))}
            
            {/* Line path */}
            <polyline
              fill="none"
              stroke="#007bff"
              strokeWidth="2"
              points={mockData.cashier.topProducts.map((product, index) => {
                const x = (index * 120) + 50;
                const y = 200 - (product.revenue / 3900) * 150;
                return `${x},${y}`;
              }).join(' ')}
            />
            
            {/* Data points and columns */}
            {mockData.cashier.topProducts.map((product, index) => {
              const x = (index * 120) + 50;
              const height = (product.revenue / 3900) * 150;
              const y = 200 - height;
              return (
                <g key={index}>
                  {/* Column */}
                  <rect
                    x={x - 20}
                    y={y}
                    width="40"
                    height={height}
                    fill="rgba(0, 123, 255, 0.3)"
                    stroke="#007bff"
                    strokeWidth="1"
                  />
                  {/* Data point */}
                  <circle cx={x} cy={y} r="4" fill="#007bff" />
                  {/* Value label */}
                  <text x={x} y={y - 10} textAnchor="middle" fontSize="12" fill="#333">
                    {formatCurrency(product.revenue)}
                  </text>
                  {/* Product label */}
                  <text x={x} y="195" textAnchor="middle" fontSize="12" fill="#555">
                    {product.name.length > 10 ? product.name.substring(0, 10) + '...' : product.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
      
      <h4>Top Products</h4>
      <table className="simple-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Sales</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {mockData.cashier.topProducts.map((product, index) => (
            <tr key={index}>
              <td>{product.name}</td>
              <td>{product.sales}</td>
              <td>{formatCurrency(product.revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderInventory = () => (
    <div className="simple-reports">
      <h3>Inventory Reports</h3>
      <div className="simple-stats">
        <div className="simple-stat">
          <strong>Total Items:</strong> {mockData.inventory.totalItems}
        </div>
        <div className="simple-stat">
          <strong>Low Stock Items:</strong> {mockData.inventory.lowStockItems}
        </div>
        <div className="simple-stat">
          <strong>Out of Stock:</strong> {mockData.inventory.outOfStockItems}
        </div>
      </div>
      
      <h4>Category Distribution</h4>
      <div className="column-line-chart">
        <div className="chart-container">
          <svg width="100%" height="200" viewBox="0 0 400 200">
            {/* Grid lines */}
            {[0, 50, 100, 150, 200].map((y) => (
              <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#e9ecef" strokeWidth="1" />
            ))}
            
            {/* Line path */}
            <polyline
              fill="none"
              stroke="#007bff"
              strokeWidth="2"
              points={mockData.inventory.categories.map((category, index) => {
                const x = (index * 120) + 50;
                const y = 200 - (category.value / 15670.75) * 150;
                return `${x},${y}`;
              }).join(' ')}
            />
            
            {/* Data points and columns */}
            {mockData.inventory.categories.map((category, index) => {
              const x = (index * 120) + 50;
              const height = (category.value / 15670.75) * 150;
              const y = 200 - height;
              return (
                <g key={index}>
                  {/* Column */}
                  <rect
                    x={x - 20}
                    y={y}
                    width="40"
                    height={height}
                    fill="rgba(0, 123, 255, 0.3)"
                    stroke="#007bff"
                    strokeWidth="1"
                  />
                  {/* Data point */}
                  <circle cx={x} cy={y} r="4" fill="#007bff" />
                  {/* Value label */}
                  <text x={x} y={y - 10} textAnchor="middle" fontSize="12" fill="#333">
                    {formatCurrency(category.value)}
                  </text>
                  {/* Category label */}
                  <text x={x} y="195" textAnchor="middle" fontSize="12" fill="#555">
                    {category.name.length > 10 ? category.name.substring(0, 10) + '...' : category.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
      
      <h4>Categories</h4>
      <table className="simple-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Items</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {mockData.inventory.categories.map((category, index) => (
            <tr key={index}>
              <td>{category.name}</td>
              <td>{category.items}</td>
              <td>{formatCurrency(category.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderReception = () => (
    <div className="simple-reports">
      <h3>Reception Reports</h3>
      <div className="simple-stats">
        <div className="simple-stat">
          <strong>Total Appointments:</strong> {mockData.reception.totalAppointments}
        </div>
        <div className="simple-stat">
          <strong>Completed:</strong> {mockData.reception.completedAppointments}
        </div>
        <div className="simple-stat">
          <strong>Cancelled:</strong> {mockData.reception.cancelledAppointments}
        </div>
      </div>
      
      <h4>Appointment Status</h4>
      <div className="column-line-chart">
        <div className="chart-container">
          <svg width="100%" height="200" viewBox="0 0 400 200">
            {/* Grid lines */}
            {[0, 50, 100, 150, 200].map((y) => (
              <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#e9ecef" strokeWidth="1" />
            ))}
            
            {/* Line path */}
            <polyline
              fill="none"
              stroke="#007bff"
              strokeWidth="2"
              points={[
                `${50},${200 - (mockData.reception.completedAppointments / 1456) * 150}`,
                `${150},${200 - (mockData.reception.cancelledAppointments / 1456) * 150}`
              ].join(' ')}
            />
            
            {/* Data points and columns */}
            <g>
              {/* Completed */}
              <rect
                x={30}
                y={200 - (mockData.reception.completedAppointments / 1456) * 150}
                width="40"
                height={(mockData.reception.completedAppointments / 1456) * 150}
                fill="rgba(0, 123, 255, 0.3)"
                stroke="#007bff"
                strokeWidth="1"
              />
              <circle cx={50} cy={200 - (mockData.reception.completedAppointments / 1456) * 150} r="4" fill="#007bff" />
              <text x={50} y={200 - (mockData.reception.completedAppointments / 1456) * 150 - 10} textAnchor="middle" fontSize="12" fill="#333">
                {mockData.reception.completedAppointments}
              </text>
              <text x={50} y="195" textAnchor="middle" fontSize="12" fill="#555">Completed</text>
              
              {/* Cancelled */}
              <rect
                x={130}
                y={200 - (mockData.reception.cancelledAppointments / 1456) * 150}
                width="40"
                height={(mockData.reception.cancelledAppointments / 1456) * 150}
                fill="rgba(0, 123, 255, 0.3)"
                stroke="#007bff"
                strokeWidth="1"
              />
              <circle cx={150} cy={200 - (mockData.reception.cancelledAppointments / 1456) * 150} r="4" fill="#007bff" />
              <text x={150} y={200 - (mockData.reception.cancelledAppointments / 1456) * 150 - 10} textAnchor="middle" fontSize="12" fill="#333">
                {mockData.reception.cancelledAppointments}
              </text>
              <text x={150} y="195" textAnchor="middle" fontSize="12" fill="#555">Cancelled</text>
            </g>
          </svg>
        </div>
      </div>
      
      <h4>Staff Performance</h4>
      <table className="simple-table">
        <thead>
          <tr>
            <th>Staff Name</th>
            <th>Appointments</th>
            <th>Completion Rate</th>
            <th>Avg Rating</th>
          </tr>
        </thead>
        <tbody>
          {mockData.reception.staffPerformance.map((staff, index) => (
            <tr key={index}>
              <td>{staff.name}</td>
              <td>{staff.appointments}</td>
              <td>{formatPercentage(staff.completionRate)}</td>
              <td>
                <FontAwesomeIcon icon={faStar} /> {staff.avgRating}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderVeterinary = () => (
    <div className="simple-reports">
      <h3>Veterinary Reports</h3>
      <div className="simple-stats">
        <div className="simple-stat">
          <strong>Total Patients:</strong> {mockData.veterinary.totalPatients}
        </div>
        <div className="simple-stat">
          <strong>New Patients:</strong> {mockData.veterinary.newPatients}
        </div>
        <div className="simple-stat">
          <strong>Total Treatments:</strong> {mockData.veterinary.totalTreatments}
        </div>
        <div className="simple-stat">
          <strong>Total Surgeries:</strong> {mockData.veterinary.totalSurgeries}
        </div>
        <div className="simple-stat">
          <strong>Total Vaccinations:</strong> {mockData.veterinary.totalVaccinations}
        </div>
      </div>
      
      <h4>Service Distribution</h4>
      <div className="column-line-chart">
        <div className="chart-container">
          <svg width="100%" height="200" viewBox="0 0 400 200">
            {/* Grid lines */}
            {[0, 50, 100, 150, 200].map((y) => (
              <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#e9ecef" strokeWidth="1" />
            ))}
            
            {/* Line path */}
            <polyline
              fill="none"
              stroke="#007bff"
              strokeWidth="2"
              points={[
                `${50},${200 - (mockData.veterinary.totalTreatments / 2345) * 150}`,
                `${150},${200 - (mockData.veterinary.totalSurgeries / 2345) * 150}`,
                `${250},${200 - (mockData.veterinary.totalVaccinations / 2345) * 150}`
              ].join(' ')}
            />
            
            {/* Data points and columns */}
            <g>
              {/* Treatments */}
              <rect
                x={30}
                y={200 - (mockData.veterinary.totalTreatments / 2345) * 150}
                width="40"
                height={(mockData.veterinary.totalTreatments / 2345) * 150}
                fill="rgba(0, 123, 255, 0.3)"
                stroke="#007bff"
                strokeWidth="1"
              />
              <circle cx={50} cy={200 - (mockData.veterinary.totalTreatments / 2345) * 150} r="4" fill="#007bff" />
              <text x={50} y={200 - (mockData.veterinary.totalTreatments / 2345) * 150 - 10} textAnchor="middle" fontSize="12" fill="#333">
                {mockData.veterinary.totalTreatments}
              </text>
              <text x={50} y="195" textAnchor="middle" fontSize="12" fill="#555">Treatments</text>
              
              {/* Surgeries */}
              <rect
                x={130}
                y={200 - (mockData.veterinary.totalSurgeries / 2345) * 150}
                width="40"
                height={(mockData.veterinary.totalSurgeries / 2345) * 150}
                fill="rgba(0, 123, 255, 0.3)"
                stroke="#007bff"
                strokeWidth="1"
              />
              <circle cx={150} cy={200 - (mockData.veterinary.totalSurgeries / 2345) * 150} r="4" fill="#007bff" />
              <text x={150} y={200 - (mockData.veterinary.totalSurgeries / 2345) * 150 - 10} textAnchor="middle" fontSize="12" fill="#333">
                {mockData.veterinary.totalSurgeries}
              </text>
              <text x={150} y="195" textAnchor="middle" fontSize="12" fill="#555">Surgeries</text>
              
              {/* Vaccinations */}
              <rect
                x={230}
                y={200 - (mockData.veterinary.totalVaccinations / 2345) * 150}
                width="40"
                height={(mockData.veterinary.totalVaccinations / 2345) * 150}
                fill="rgba(0, 123, 255, 0.3)"
                stroke="#007bff"
                strokeWidth="1"
              />
              <circle cx={250} cy={200 - (mockData.veterinary.totalVaccinations / 2345) * 150} r="4" fill="#007bff" />
              <text x={250} y={200 - (mockData.veterinary.totalVaccinations / 2345) * 150 - 10} textAnchor="middle" fontSize="12" fill="#333">
                {mockData.veterinary.totalVaccinations}
              </text>
              <text x={250} y="195" textAnchor="middle" fontSize="12" fill="#555">Vaccinations</text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );

  const renderCustomers = () => (
    <div className="simple-reports">
      <h3>Customer Reports</h3>
      <div className="simple-stats">
        <div className="simple-stat">
          <strong>Total Customers:</strong> {mockData.customers.totalCustomers}
        </div>
        <div className="simple-stat">
          <strong>New Customers:</strong> {mockData.customers.newCustomers}
        </div>
        <div className="simple-stat">
          <strong>Returning Customers:</strong> {mockData.customers.returningCustomers}
        </div>
        <div className="simple-stat">
          <strong>Retention Rate:</strong> {formatPercentage(mockData.customers.customerRetentionRate)}
        </div>
      </div>
      
      <h4>Customer Distribution</h4>
      <div className="column-line-chart">
        <div className="chart-container">
          <svg width="100%" height="200" viewBox="0 0 400 200">
            {/* Grid lines */}
            {[0, 50, 100, 150, 200].map((y) => (
              <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#e9ecef" strokeWidth="1" />
            ))}
            
            {/* Line path */}
            <polyline
              fill="none"
              stroke="#007bff"
              strokeWidth="2"
              points={[
                `${100},${200 - (mockData.customers.newCustomers / 892) * 150}`,
                `${300},${200 - (mockData.customers.returningCustomers / 892) * 150}`
              ].join(' ')}
            />
            
            {/* Data points and columns */}
            <g>
              {/* New Customers */}
              <rect
                x={80}
                y={200 - (mockData.customers.newCustomers / 892) * 150}
                width="40"
                height={(mockData.customers.newCustomers / 892) * 150}
                fill="rgba(0, 123, 255, 0.3)"
                stroke="#007bff"
                strokeWidth="1"
              />
              <circle cx={100} cy={200 - (mockData.customers.newCustomers / 892) * 150} r="4" fill="#007bff" />
              <text x={100} y={200 - (mockData.customers.newCustomers / 892) * 150 - 10} textAnchor="middle" fontSize="12" fill="#333">
                {mockData.customers.newCustomers}
              </text>
              <text x={100} y="195" textAnchor="middle" fontSize="12" fill="#555">New</text>
              
              {/* Returning Customers */}
              <rect
                x={280}
                y={200 - (mockData.customers.returningCustomers / 892) * 150}
                width="40"
                height={(mockData.customers.returningCustomers / 892) * 150}
                fill="rgba(0, 123, 255, 0.3)"
                stroke="#007bff"
                strokeWidth="1"
              />
              <circle cx={300} cy={200 - (mockData.customers.returningCustomers / 892) * 150} r="4" fill="#007bff" />
              <text x={300} y={200 - (mockData.customers.returningCustomers / 892) * 150 - 10} textAnchor="middle" fontSize="12" fill="#333">
                {mockData.customers.returningCustomers}
              </text>
              <text x={300} y="195" textAnchor="middle" fontSize="12" fill="#555">Returning</text>
            </g>
          </svg>
        </div>
      </div>
      
      <h4>Top Customers</h4>
      <table className="simple-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Visits</th>
            <th>Total Spent</th>
          </tr>
        </thead>
        <tbody>
          {mockData.customers.topCustomers.map((customer, index) => (
            <tr key={index}>
              <td>{customer.name}</td>
              <td>{customer.visits}</td>
              <td>{formatCurrency(customer.spent)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview": return renderOverview();
      case "cashier": return renderCashier();
      case "inventory": return renderInventory();
      case "reception": return renderReception();
      case "veterinary": return renderVeterinary();
      case "customers": return renderCustomers();
      default: return renderOverview();
    }
  };

  return (
    <div className="admin-reports">
      <div className="simple-header">
        <h2>Reports</h2>
        <div className="simple-filters">
          <select value={filterAccount} onChange={(e) => setFilterAccount(e.target.value)}>
            <option value="all">All Accounts</option>
            <option value="main">Main Clinic</option>
            <option value="branch">Branch Office</option>
          </select>
          <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)}>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="simple-btn" onClick={() => window.location.reload()}>
            <FontAwesomeIcon icon={faRefresh} /> Refresh
          </button>
        </div>
      </div>

      <div className="simple-tabs">
        {[
          { id: "overview", label: "Overview", icon: faChartBar },
          { id: "cashier", label: "Cashier", icon: faMoneyBillWave },
          { id: "inventory", label: "Inventory", icon: faBox },
          { id: "reception", label: "Reception", icon: faCalendarCheck },
          { id: "veterinary", label: "Veterinary", icon: faStethoscope },
          { id: "customers", label: "Customers", icon: faUsers },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`simple-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <FontAwesomeIcon icon={tab.icon} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="simple-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminReports;
