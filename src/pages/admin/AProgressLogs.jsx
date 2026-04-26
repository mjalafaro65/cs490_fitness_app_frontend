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
    new_users_last_7_days: 0
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
          new_users_last_7_days: data.new_users_last_7_days || 0
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
        
        console.log("Active report response:", response);
        console.log("Active report data:", response.data);
        
        let reportData = response.data;
        
        if (reportData && reportData.data && Array.isArray(reportData.data)) {
          reportData = reportData.data;
        }
        else if (Array.isArray(reportData)) {
          reportData = reportData;
        }
        else if (reportData && reportData.results && Array.isArray(reportData.results)) {
          reportData = reportData.results;
        }
        else if (!Array.isArray(reportData)) {
          console.warn("Unexpected data format:", reportData);
          reportData = [];
        }
        
        setActiveReport(reportData);
        
      } catch (err) {
        console.error("Failed to fetch active report:", err);
        console.error("Error response:", err.response?.data);
        console.error("Error status:", err.response?.status);
        console.error("Error headers:", err.response?.headers);
        
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
              <button
                onClick={() => {
                  setReportError(null);
                  setSelectedPeriod(prev => prev === "daily" ? "weekly" : "daily");
                  setTimeout(() => setSelectedPeriod(prev => prev === "daily" ? "weekly" : "daily"), 100);
                }}
                className="mt-3 text-sm text-primary hover:opacity-80 font-medium"
              >
                Try again →
              </button>
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
      labelKey = null;
    }
    
    const maxCount = Math.max(...activeReport.map(item => item[countKey] || 0));
    
    return (
      <div className="mt-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold opacity-70">
            Active Users ({selectedPeriod === "daily" ? "Daily" : selectedPeriod === "weekly" ? "Weekly" : "Monthly"} Trend)
          </h4>
          <div className="text-xs opacity-50">
            Total: {activeReport.reduce((sum, item) => sum + (item[countKey] || 0), 0)}
          </div>
        </div>
        
        <div className="flex items-end space-x-2 overflow-x-auto pb-4">
          {activeReport.map((item, index) => {
            const count = item[countKey] || 0;
            const height = maxCount > 0 ? (count / maxCount) * 150 : 0;
            const label = labelKey ? item[labelKey] : `Period ${index + 1}`;
            
            return (
              <div key={index} className="flex flex-col items-center min-w-[60px]">
                <div className="relative w-full flex justify-center">
                  <div 
                    className="w-8 bg-primary rounded-t hover:opacity-80 transition-all duration-300 cursor-pointer group relative"
                    style={{ height: `${height}px`, minHeight: count > 0 ? '4px' : '0px' }}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-base-300 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      {count} users
                    </div>
                  </div>
                </div>
                <span className="text-xs opacity-60 mt-2 transform -rotate-45 origin-top-left whitespace-nowrap max-w-[80px] overflow-hidden text-ellipsis">
                  {String(label).length > 15 ? String(label).substring(0, 15) + '...' : label}
                </span>
              </div>
            );
          })}
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-xs opacity-50">
            <summary>Debug: Data Structure</summary>
            <pre className="mt-2 p-2 bg-base-200 rounded overflow-auto">
              {JSON.stringify(activeReport[0], null, 2)}
            </pre>
          </details>
        )}
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
                <div className="card bg-base-300 rounded-box p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold opacity-60 uppercase tracking-wide">Total Users</p>
                      <p className="text-3xl font-bold mt-2">{stats.total_users}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="card bg-base-300 rounded-box p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold opacity-60 uppercase tracking-wide">Active Users</p>
                      <p className="text-3xl font-bold mt-2">{stats.active_users}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-success/10">
                      <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="card bg-base-300 rounded-box p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold opacity-60 uppercase tracking-wide">Inactive Users</p>
                      <p className="text-3xl font-bold mt-2">{stats.inactive_users}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-warning/10">
                      <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="card bg-base-300 rounded-box p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold opacity-60 uppercase tracking-wide">New Users (7 days)</p>
                      <p className="text-3xl font-bold mt-2">{stats.new_users_last_7_days}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-info/10">
                      <svg className="w-5 h-5 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 card bg-base-300 rounded-box p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-base font-bold">Active User Trends</div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedPeriod("daily")}
                      className={`btn btn-sm ${selectedPeriod === "daily" ? "btn-primary" : "btn-ghost"}`}
                    >
                      Daily
                    </button>
                    <button
                      onClick={() => setSelectedPeriod("weekly")}
                      className={`btn btn-sm ${selectedPeriod === "weekly" ? "btn-primary" : "btn-ghost"}`}
                    >
                      Weekly
                    </button>
                    <button
                      onClick={() => setSelectedPeriod("monthly")}
                      className={`btn btn-sm ${selectedPeriod === "monthly" ? "btn-primary" : "btn-ghost"}`}
                    >
                      Monthly
                    </button>
                  </div>
                </div>
                
                {renderActivityChart()}
              </div>

              {stats.total_users > 0 && (
                <div className="mt-8 card bg-base-300 rounded-box p-6">
                  <div className="text-base font-bold mb-4">Activity Overview</div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="opacity-60">Active Users</span>
                        <span className="font-semibold">
                          {((stats.active_users / stats.total_users) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-base-100 rounded-full h-2">
                        <div 
                          className="bg-success h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${(stats.active_users / stats.total_users) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="opacity-60">Inactive Users</span>
                        <span className="font-semibold">
                          {((stats.inactive_users / stats.total_users) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-base-100 rounded-full h-2">
                        <div 
                          className="bg-warning h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${(stats.inactive_users / stats.total_users) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-base-100 grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">
                        {((stats.active_users / stats.total_users) * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs opacity-60 mt-1">Engagement Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">
                        +{stats.new_users_last_7_days}
                      </p>
                      <p className="text-xs opacity-60 mt-1">New this week</p>
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