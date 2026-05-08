import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import PopUp from "../../components/PopUp";
import api from "../../axios";
import Alert from "../../components/Alert.jsx";

function AProgressLogs() {
  const navigate = useNavigate();
  const [popOpen, setPopOpen] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeReportLoading, setActiveReportLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("daily");
  const [activeReport, setActiveReport] = useState([]);
  const [reportError, setReportError] = useState(null);
  const [alert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('success');
  
  const [stats, setStats] = useState({
    total_users: 0,
    active_users: 0,
    inactive_users: 0,
    new_client_users_last_7: 0
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  
  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    phone_number: ""
  });

  const showAlert = (message, type = 'success') => {
    setAlertMsg(message);
    setAlertType(type);
    setShowAlert(true);
  };

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const response = await api.get("/admin/users/stats");
        
        const data = response.data;
        console.log("Stats Data:", data);
        
        setStats({
          total_users: data.total_users || 0,
          active_users: data.active_users || 0,
          inactive_users: data.inactive_users || 0,
          new_client_users_last_7: data.new_client_users_last_7 || 0
        });
        
      } catch (err) {
        console.error("Failed to fetch stats:", err.response?.data || err);
        showAlert(err.response?.data?.message || "Failed to load statistics", "error");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  useEffect(() => {
    async function fetchActiveReport() {
      try {
        setActiveReportLoading(true);
        setReportError(null);
        
        console.log(`Fetching active report for period: ${selectedPeriod}`);

        const response = await api.get("/admin/users/active-report", {
          params: {
            period: selectedPeriod
          }
        });
        
        console.log("Active report response:", response.data);
        
        const reportData = response.data;
        const transformedData = [];
        
        if (selectedPeriod === "daily") {
          transformedData.push({ period: "Total Active", count: reportData.total_active_users });
          transformedData.push({ period: "Clients", count: reportData.client_active_users });
          transformedData.push({ period: "Coaches", count: reportData.coach_active_users });
        } else if (selectedPeriod === "weekly") {
          transformedData.push({ period: "Last 7 Days", count: reportData.total_active_users });
          transformedData.push({ period: "Clients", count: reportData.client_active_users });
          transformedData.push({ period: "Coaches", count: reportData.coach_active_users });
        } else if (selectedPeriod === "monthly") {
          transformedData.push({ period: "Last 30 Days", count: reportData.total_active_users });
          transformedData.push({ period: "Clients", count: reportData.client_active_users });
          transformedData.push({ period: "Coaches", count: reportData.coach_active_users });
        }
            
        setActiveReport(transformedData);
        
      } catch (err) {
        console.error("Failed to fetch active report:", err);
        setReportError({
          message: err.response?.data?.message || err.message || "Failed to load activity report",
          status: err.response?.status,
          details: err.response?.data
        });
        setActiveReport([]);
      } finally {
        setActiveReportLoading(false);
      }
    }

    fetchActiveReport();
  }, [selectedPeriod]);

  const closePopUp = () => {
    setPopOpen(null);
    setSelectedUser(null);
    setUser({ first_name: "", last_name: "", phone_number: "" });
  };

  const renderActivityChart = () => {
  if (activeReportLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm opacity-70 mt-2">Loading activity data...</p>
      </div>
    );
  }

  if (reportError) {
    return (
      <div className="bg-error/10 border border-error rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium">Error loading activity report</h3>
            <div className="mt-2 text-sm opacity-70">
              <p>{reportError.message}</p>
              {reportError.status && <p className="text-xs mt-1">Status: {reportError.status}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!activeReport || activeReport.length === 0) {
    return (
      <div className="text-center py-8 opacity-50">
        <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="mt-2 text-sm">No activity data available for {selectedPeriod} period</p>
      </div>
    );
  }

  // Find count and label keys dynamically
  const sampleItem = activeReport[0];
  let countKey = null;
  let labelKey = null;
  
  const possibleCountKeys = ['count', 'active_count', 'total', 'value', 'user_count'];
  for (const key of possibleCountKeys) {
    if (sampleItem.hasOwnProperty(key) && typeof sampleItem[key] === 'number') {
      countKey = key;
      break;
    }
  }
  
  if (!countKey) {
    for (const key in sampleItem) {
      if (typeof sampleItem[key] === 'number') {
        countKey = key;
        break;
      }
    }
  }
  
  const possibleLabelKeys = ['period', 'date', 'week', 'month', 'day', 'label', 'name'];
  for (const key of possibleLabelKeys) {
    if (sampleItem.hasOwnProperty(key)) {
      labelKey = key;
      break;
    }
  }
  
  if (!labelKey) {
    labelKey = Object.keys(sampleItem).find(key => typeof sampleItem[key] !== 'number') || 'period';
  }
  
  const maxCount = Math.max(...activeReport.map(item => item[countKey] || 0));
  
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold opacity-70">
          Active Users ({selectedPeriod === "daily" ? "Today" : selectedPeriod === "weekly" ? "Last 7 Days" : "Last 30 Days"})
        </h4>
        <div className="text-xs opacity-50">
          Total Active: {activeReport.reduce((sum, item) => sum + (item[countKey] || 0), 0)}
        </div>
      </div>
      
      <div className="flex items-end justify-center space-x-8 pb-4">
        {activeReport.map((item, index) => {
          const count = item[countKey] || 0;
          const maxBarHeight = 200;
          const height = maxCount > 0 ? (count / maxCount) * maxBarHeight : 0;
          const label = item[labelKey] || `Category ${index + 1}`;

          let barColor = "bg-primary";
          if (label.toLowerCase().includes("client")) barColor = "bg-blue-300";
          else if (label.toLowerCase().includes("coach")) barColor = "bg-blue-500";
          else if (label.toLowerCase().includes("total")) barColor = "bg-primary";
          
          return (
            <div key={index} className="flex flex-col items-center">
              <div className="relative w-full flex justify-center">
                <div 
                  className={`${barColor} rounded-t hover:opacity-80 transition-all duration-300 cursor-pointer group relative`}
                  style={{ width: "60px", height: `${height}px`, minHeight: count > 0 ? '4px' : '0px' }}
                >
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-base-300 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {count.toLocaleString()} users
                  </div>
                </div>
              </div>
              <span className="text-xs font-medium mt-2 text-center">
                {label}
              </span>
              <span className="text-xs opacity-60 mt-1">
                {count}
              </span>
            </div>
          );
        })}
      </div>

    </div>
  );
};

  return (
    <div className="drawer lg:drawer-open">
      <div className="drawer-content">
        <div className="p-6">
          <div className="text-2xl font-bold mb-6">User Statistics</div>
          
          {loading ? (
            <div className="text-center py-8 opacity-50">Loading stats...</div>
          ) : (
            <>
              <div className="grid grid-cols-4 lg:grid-cols-4 gap-3">
                <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold opacity-60 uppercase tracking-wide">Total Users</p>
                      <p className="text-3xl font-bold mt-2">{stats.total_users}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold opacity-60 uppercase tracking-wide">Active Users</p>
                      <p className="text-3xl font-bold mt-2">{stats.active_users}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold opacity-60 uppercase tracking-wide">Inactive Users</p>
                      <p className="text-3xl font-bold mt-2">{stats.inactive_users}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="card bg-base-200 shadow-lg border border-base-500 rounded-box p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold opacity-60 uppercase tracking-wide">New Users (7 days)</p>
                      <p className="text-3xl font-bold mt-2">{stats.new_client_users_last_7}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 card bg-base-200 shadow-lg border border-base-500 rounded-box p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-base font-bold">Active User Trends</div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedPeriod("daily")}
                      className={`btn btn-sm ${selectedPeriod === "daily" ? "btn bg-blue-800 text-white" : "btn-ghost"}`}
                    >
                      Daily
                    </button>
                    <button
                      onClick={() => setSelectedPeriod("weekly")}
                      className={`btn btn-sm ${selectedPeriod === "weekly" ? "btn bg-blue-800 text-white" : "btn-ghost"}`}
                    >
                      Weekly
                    </button>
                    <button
                      onClick={() => setSelectedPeriod("monthly")}
                      className={`btn btn-sm ${selectedPeriod === "monthly" ? "btn bg-blue-800 text-white" : "btn-ghost"}`}
                    >
                      Monthly
                    </button>
                  </div>
                </div>
                
                {renderActivityChart()}
              </div>
              {stats.total_users > 0 && (
  <div className="mt-8 card bg-base-200 shadow-lg border border-base-500 rounded-box p-6">
    <div className="text-base font-bold mb-6">Activity Overview</div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Donut Chart - User Distribution */}
      <div>
        <h4 className="text-sm font-semibold opacity-70 mb-3 text-center">User Distribution</h4>
        <div className="relative flex justify-center items-center">
          <svg viewBox="0 0 200 200" className="w-48 h-48">
            {/* Calculate percentages */}
            {(() => {
              const activePercent = (stats.active_users / stats.total_users) * 100;
              const inactivePercent = (stats.inactive_users / stats.total_users) * 100;
              const activeAngle = (activePercent / 100) * 360;
              const inactiveAngle = (inactivePercent / 100) * 360;
              
              // Active users arc
              const activeStart = 0;
              const activeEnd = activeAngle;
              const activeLargeArc = activeAngle > 180 ? 1 : 0;
              const activeStartX = 100 + 80 * Math.cos((activeStart - 90) * Math.PI / 180);
              const activeStartY = 100 + 80 * Math.sin((activeStart - 90) * Math.PI / 180);
              const activeEndX = 100 + 80 * Math.cos((activeEnd - 90) * Math.PI / 180);
              const activeEndY = 100 + 80 * Math.sin((activeEnd - 90) * Math.PI / 180);
              
              // Inactive users arc
              const inactiveStart = activeAngle;
              const inactiveEnd = 360;
              const inactiveLargeArc = inactiveAngle > 180 ? 1 : 0;
              const inactiveStartX = 100 + 80 * Math.cos((inactiveStart - 90) * Math.PI / 180);
              const inactiveStartY = 100 + 80 * Math.sin((inactiveStart - 90) * Math.PI / 180);
              const inactiveEndX = 100 + 80 * Math.cos((inactiveEnd - 90) * Math.PI / 180);
              const inactiveEndY = 100 + 80 * Math.sin((inactiveEnd - 90) * Math.PI / 180);
              
              return (
                <>
                  <path
                    d={`M 100 100 L ${activeStartX} ${activeStartY} A 80 80 0 ${activeLargeArc} 1 ${activeEndX} ${activeEndY} Z`}
                    fill="#16325f"
                    className="transition-all duration-500"
                  />
                  <path
                    d={`M 100 100 L ${inactiveStartX} ${inactiveStartY} A 80 80 0 ${inactiveLargeArc} 1 ${inactiveEndX} ${inactiveEndY} Z`}
                    fill="#93c5fd"
                    className="transition-all duration-500"
                  />
                </>
              );
            })()}
            <circle cx="100" cy="100" r="50" fill="white" />
          </svg>
          <div className="absolute text-center">
            <p className="text-2xl font-bold text-blue-800">{stats.total_users}</p>
            <p className="text-xs opacity-60">Total Users</p>
          </div>
        </div>
        <div className="flex justify-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs">Active ({stats.active_users})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-200"></div>
            <span className="text-xs">Inactive ({stats.inactive_users})</span>
          </div>
        </div>
      </div>

      {/* Horizontal Bar Chart */}
      <div>
        <h4 className="text-sm font-semibold opacity-70 mb-3 text-center">Activity Metrics</h4>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="opacity-60">Active Users</span>
              <span className="font-semibold text-blue-600">{stats.active_users} / {stats.total_users}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-700 h-3 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${(stats.active_users / stats.total_users) * 100}%` }}
              >
                <div className="h-full w-full animate-pulse opacity-30"></div>
              </div>
            </div>
            <p className="text-xs opacity-50 mt-1">
              {((stats.active_users / stats.total_users) * 100).toFixed(1)}% of total users
            </p>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="opacity-60">Inactive Users</span>
              <span className="font-semibold text-gray-500">{stats.inactive_users} / {stats.total_users}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-gray-400 to-gray-500 h-3 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${(stats.inactive_users / stats.total_users) * 100}%` }}
              />
            </div>
            <p className="text-xs opacity-50 mt-1">
              {((stats.inactive_users / stats.total_users) * 100).toFixed(1)}% of total users
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
            </>
          )}
        </div>
      </div>

      <PopUp isOpen={popOpen !== null} onClose={closePopUp}>
      </PopUp>

      <Alert 
        isOpen={alert} 
        message={alertMsg}
        type={alertType}
        onClose={() => setShowAlert(false)}
      />
    </div>
  );
}

export default AProgressLogs;