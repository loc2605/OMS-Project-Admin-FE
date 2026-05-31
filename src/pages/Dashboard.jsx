import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  DollarSign,
  Users,
  ShoppingBag,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Send,
  Truck,
  Plus,
  BarChart2,
  CheckCircle2,
  Calendar,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import dashboardService from '../services/dashboardService';
import productService from '../services/productService';
import Button from '../components/common/Button';
import { formatCurrency } from '../utils/format';
import { isApiSuccess } from '../utils/apiResponse';
import { getStockAction, getStockApiType } from '../constants/stockActions';
import StockAdjustForm from '../components/inventory/StockAdjustForm';

const StatCard = ({ title, value, subtitle, icon: Icon, color, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    style={{
      background: 'var(--bg-card)',
      padding: '1.5rem',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-subtle)',
      flex: 1,
      minWidth: '240px',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
      <div style={{
        width: '46px',
        height: '46px',
        borderRadius: '12px',
        background: color,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 4px 12px -2px ${color}66`
      }}>
        <Icon size={22} />
      </div>
    </div>

    <div>
      <h3 style={{ fontSize: '1.85rem', fontWeight: '800', margin: '0 0 0.25rem 0', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{value}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>{title}</p>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0, opacity: 0.8 }}>{subtitle}</p>
    </div>

    <div style={{
      position: 'absolute',
      bottom: '-10px',
      right: '-10px',
      opacity: 0.03,
      color: 'var(--text-main)',
      transform: 'rotate(-15deg)'
    }}>
      <Icon size={90} />
    </div>
  </motion.div>
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    todayTotalRevenue: 0,
    todayCompletedOrders: 0,
    todayCancelRate: 0.0,
    lowStockItemsCount: 0
  });
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [revenueChartData, setRevenueChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [shippersKpi, setShippersKpi] = useState([]);

  // AI Playground & Bootstrap States
  const [isSyncingAI, setIsSyncingAI] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiChat, setAiChat] = useState([
    { role: 'assistant', content: 'Dạ chào Admin, tôi là trợ lý AI Chatbot của cửa hàng. Admin có thể thử nhập câu hỏi tư vấn mua sắm để kiểm tra thuật toán RAG Chat của hệ thống!' }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Date Range for Revenue Chart
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Restock Modal State
  const [restockItem, setRestockItem] = useState(null);
  const [restockQuantity, setRestockQuantity] = useState(50);
  const [restockAction, setRestockAction] = useState('IMPORT');
  const [submittingRestock, setSubmittingRestock] = useState(false);

  // Chart Tooltip Hover State
  const [hoveredDataPoint, setHoveredDataPoint] = useState(null);
  const [loadErrors, setLoadErrors] = useState({});

  const EMPTY_SUMMARY = {
    todayTotalRevenue: 0,
    todayCompletedOrders: 0,
    todayCancelRate: 0,
    lowStockItemsCount: 0,
  };

  const applyApiResult = (response, onSuccess) => {
    if (response && typeof response === 'object' && 'success' in response) {
      if (response.success) {
        onSuccess(response.result);
        return true;
      }
      return false;
    }
    if (response !== undefined && response !== null) {
      onSuccess(response);
      return true;
    }
    return false;
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    const errors = {};

    console.log(">>> [Dashboard] Starting to fetch dashboard data from real APIs...");

    const [
      summaryResult,
      alertsResult,
      chartResult,
      topProductsResult,
      shippersResult,
    ] = await Promise.allSettled([
      dashboardService.getSummary(),
      dashboardService.getInventoryAlerts(),
      dashboardService.getRevenueChart(startDate, endDate),
      dashboardService.getTopProducts(5),
      dashboardService.getShippersKpi(),
    ]);

    if (summaryResult.status === 'fulfilled') {
      console.log(">>> [Summary API Success] Result:", summaryResult.value);
      if (!applyApiResult(summaryResult.value, setSummary)) {
        console.error(">>> [Summary API Fail] Response status was not successful or format invalid:", summaryResult.value);
        setSummary(EMPTY_SUMMARY);
        errors.summary = true;
      }
    } else {
      console.error(">>> [Summary API Error] Rejected reason:", summaryResult.reason);
      setSummary(EMPTY_SUMMARY);
      errors.summary = true;
    }

    if (alertsResult.status === 'fulfilled') {
      console.log(">>> [Inventory Alerts API Success] Result:", alertsResult.value);
      if (!applyApiResult(alertsResult.value, setInventoryAlerts)) {
        console.error(">>> [Inventory Alerts API Fail] Response status not successful:", alertsResult.value);
        setInventoryAlerts([]);
        errors.alerts = true;
      }
    } else {
      console.error(">>> [Inventory Alerts API Error] Rejected reason:", alertsResult.reason);
      setInventoryAlerts([]);
      errors.alerts = true;
    }

    if (chartResult.status === 'fulfilled') {
      console.log(">>> [Revenue Chart API Success] Result:", chartResult.value);
      if (!applyApiResult(chartResult.value, setRevenueChartData)) {
        console.error(">>> [Revenue Chart API Fail] Response status not successful:", chartResult.value);
        setRevenueChartData([]);
        errors.chart = true;
      }
    } else {
      console.error(">>> [Revenue Chart API Error] Rejected reason:", chartResult.reason);
      setRevenueChartData([]);
      errors.chart = true;
    }

    if (topProductsResult.status === 'fulfilled') {
      console.log(">>> [Top Products API Success] Result:", topProductsResult.value);
      if (!applyApiResult(topProductsResult.value, setTopProducts)) {
        console.error(">>> [Top Products API Fail] Response status not successful:", topProductsResult.value);
        setTopProducts([]);
        errors.topProducts = true;
      }
    } else {
      console.error(">>> [Top Products API Error] Rejected reason:", topProductsResult.reason);
      setTopProducts([]);
      errors.topProducts = true;
    }

    if (shippersResult.status === 'fulfilled') {
      console.log(">>> [Shippers KPI API Success] Result:", shippersResult.value);
      if (!applyApiResult(shippersResult.value, setShippersKpi)) {
        console.error(">>> [Shippers KPI API Fail] Response status not successful:", shippersResult.value);
        setShippersKpi([]);
        errors.shippers = true;
      }
    } else {
      console.error(">>> [Shippers KPI API Error] Rejected reason:", shippersResult.reason);
      setShippersKpi([]);
      errors.shippers = true;
    }

    setLoadErrors(errors);

    const failedCount = Object.keys(errors).length;
    if (failedCount === 5) {
      toast.error('Không thể tải dữ liệu tổng quan. Kiểm tra kết nối API trong console log.');
    } else if (failedCount > 0) {
      toast.warning(`Không thể tải ${failedCount}/5 mục dữ liệu tổng quan. Hãy kiểm tra console log.`);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [startDate, endDate]);

  // Handle AI Bootstrap Sync
  const handleAISync = async () => {
    setIsSyncingAI(true);
    try {
      const response = await dashboardService.syncVectorDb();
      if (response.success) {
        toast.success(response.message || "Đồng bộ hóa AI Vector Store thành công!");
        fetchDashboardData();
      } else {
        toast.error("Không thể đồng bộ hóa AI Vector Store.");
      }
    } catch (error) {
      console.error(error);
      toast.error('Không thể đồng bộ Vector DB. Vui lòng thử lại.');
    } finally {
      setIsSyncingAI(false);
    }
  };

  // Handle AI Playground Send Message
  const handleSendAiMessage = async (e) => {
    e.preventDefault();
    if (!aiMessage.trim()) return;

    const userMsg = { role: 'user', content: aiMessage };
    setAiChat(prev => [...prev, userMsg]);
    setAiMessage('');
    setIsAiLoading(true);

    try {
      const response = await dashboardService.chat(userMsg.content, "admin-playground");

      if (response?.success) {
        const reply = response.result.reply;
        const suggestions = response.result.suggestions || [];
        setAiChat(prev => [...prev, {
          role: 'assistant',
          content: reply,
          suggestions: suggestions
        }]);
      } else {
        throw new Error("Chatbot API response error");
      }
    } catch (error) {
      console.error(error);
      // Simulated Chat Response based on keyword
      setTimeout(() => {
        let simulatedReply = "Dạ chào Admin, chatbot AI đã phân tích câu hỏi của bạn. ";
        let simulatedSuggestions = [];

        if (userMsg.content.toLowerCase().includes("áo") || userMsg.content.toLowerCase().includes("thun")) {
          simulatedReply += "Hệ thống khuyên chọn **Áo thun nam cổ tròn cotton** dệt kim mát mẻ và linh hoạt đó ạ!";
          simulatedSuggestions = [
            {
              id: "6683d3d4-7f77-9795-ecfa-98a300000000",
              name: "Áo thun nam cổ tròn cotton",
              price: 150000.0,
              description: "Áo chui đầu nhẹ nhàng, dệt kim, thoải mái và linh hoạt.",
              stockQuantity: 15
            }
          ];
        } else {
          simulatedReply += "Tôi chưa tìm thấy từ khóa áo hoặc thun. Bạn có muốn xem thêm các sản phẩm thời trang Nam bán chạy nhất hôm nay không?";
          simulatedSuggestions = [
            {
              id: "6683d3d4-7f77-9795-ecfa-98a300000000",
              name: "Áo thun nam cổ tròn cotton",
              price: 150000.0,
              description: "Áo chui đầu nhẹ nhàng, dệt kim, thoải mái và linh hoạt.",
              stockQuantity: 15
            }
          ];
        }

        setAiChat(prev => [...prev, {
          role: 'assistant',
          content: simulatedReply,
          suggestions: simulatedSuggestions
        }]);
      }, 1000);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Submit Restock
  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!restockItem) return;

    const stockAction = getStockAction(restockAction);
    const qty = Number(restockQuantity);
    if (!qty || qty < 1) {
      toast.error('Vui lòng nhập số lượng hợp lệ.');
      return;
    }
    if (stockAction.confirmMessage && !window.confirm(stockAction.confirmMessage)) return;

    setSubmittingRestock(true);

    try {
      const res = await productService.updateInventory(
        restockItem.productId,
        qty,
        getStockApiType(restockAction)
      );

      if (res.success) {
        toast.success(`${stockAction.label} thành công!`);
        setRestockItem(null);
        fetchDashboardData();
      } else {
        toast.error('Lỗi cập nhật tồn kho');
      }
    } catch (err) {
      console.error(err);
      toast.error('Không thể cập nhật tồn kho. Vui lòng thử lại.');
    } finally {
      setSubmittingRestock(false);
    }
  };

  // Generate SVG Coordinate points for beautiful Area Chart
  const renderSVGChartPath = () => {
    if (revenueChartData.length === 0) return { linePath: '', areaPath: '', coords: [] };
    const width = 800;
    const height = 240;
    const paddingLeft = 50;
    const paddingRight = 30;
    const paddingTop = 20;
    const paddingBottom = 40;

    const chartW = width - paddingLeft - paddingRight;
    const chartH = height - paddingTop - paddingBottom;

    const maxVal = Math.max(...revenueChartData.map(d => d.totalRevenue), 500000) * 1.1;

    const coords = revenueChartData.map((d, i) => {
      const x =
        revenueChartData.length === 1
          ? paddingLeft + chartW / 2
          : paddingLeft + (i / (revenueChartData.length - 1)) * chartW;
      const y = height - paddingBottom - (d.totalRevenue / maxVal) * chartH;
      return { x, y, data: d };
    });

    let linePath = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      // Curved Bezier line
      const cpX1 = coords[i - 1].x + (coords[i].x - coords[i - 1].x) / 2;
      const cpY1 = coords[i - 1].y;
      const cpX2 = coords[i - 1].x + (coords[i].x - coords[i - 1].x) / 2;
      const cpY2 = coords[i].y;
      linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${coords[i].x} ${coords[i].y}`;
    }

    const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${height - paddingBottom} L ${coords[0].x} ${height - paddingBottom} Z`;

    return { linePath, areaPath, coords, maxVal, height, paddingBottom };
  };

  const { linePath, areaPath, coords, maxVal } = renderSVGChartPath();

  const statsList = [
    { title: 'Doanh thu trong ngày', value: formatCurrency(summary.todayTotalRevenue), subtitle: 'Doanh số thực tế ghi nhận', icon: DollarSign, color: '#f26c0d' },
    { title: 'Đơn hoàn thành', value: `${summary.todayCompletedOrders} đơn`, subtitle: 'Giao hàng thành công', icon: ShoppingBag, color: 'var(--success)' },
    { title: 'Tỷ lệ hủy đơn', value: `${summary.todayCancelRate}%`, subtitle: 'Đã hủy / Tổng đơn đặt', icon: TrendingUp, color: 'var(--error)' },
    { title: 'Sản phẩm sắp hết hàng', value: `${summary.lowStockItemsCount} SP`, subtitle: 'Dưới ngưỡng an toàn', icon: AlertTriangle, color: 'var(--warning)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>

      {/* Header and Sync AI Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', margin: 0 }}>Tổng quan hệ thống</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>Cập nhật tình hình kinh doanh, tồn kho và trợ lý AI chatbot</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            icon={RefreshCw}
            size="sm"
            onClick={fetchDashboardData}
            isLoading={loading}
          >
            Làm mới
          </Button>

          <Button
            variant="primary"
            icon={Sparkles}
            size="sm"
            onClick={handleAISync}
            isLoading={isSyncingAI}
            style={{
              background: 'linear-gradient(135deg, #f26c0d 0%, #ea580c 100%)',
              border: 'none',
              boxShadow: '0 4px 15px -3px rgba(242, 108, 13, 0.4)'
            }}
          >
            Đồng bộ Vector DB (AI)
          </Button>
        </div>
      </div>

      {/* Grid of Stat Cards */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem' }}>
        {statsList.map((stat, i) => (
          <StatCard key={stat.title} {...stat} index={i} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)', gap: '1.5rem', width: '100%' }}>
        {/* Left Side: Chart & Alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Revenue Chart Box */}
          <div style={{
            background: 'var(--bg-card)',
            padding: '1.5rem',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-subtle)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart2 size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>Biểu đồ doanh thu</h3>
              </div>

              {/* Date Filters */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                <Calendar size={14} color="var(--text-muted)" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    padding: '0.35rem 0.5rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    fontWeight: '600'
                  }}
                />
                <span style={{ color: 'var(--text-muted)' }}>đến</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    padding: '0.35rem 0.5rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    fontWeight: '600'
                  }}
                />
              </div>
            </div>

            {loadErrors.chart ? (
              <div style={{
                padding: '3.5rem 1.5rem',
                textAlign: 'center',
                color: 'var(--error)',
                border: '1px dashed rgba(239, 68, 68, 0.4)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'rgba(239, 68, 68, 0.02)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
                margin: '1rem 0'
              }}>
                <AlertTriangle size={38} color="var(--error)" style={{ opacity: 0.85 }} />
                <div>
                  <p style={{ margin: '0 0 0.25rem', fontWeight: 800, fontSize: '0.95rem' }}>Không thể tải biểu đồ doanh thu</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', maxWidth: '480px', lineHeight: '1.4' }}>
                    Kết nối đến phân hệ thống phân tích doanh số bị gián đoạn. Vui lòng bấm "Làm mới" ở phía trên hoặc đăng nhập lại nếu phiên đã hết hạn.
                  </p>
                </div>
              </div>
            ) : revenueChartData.length === 0 && !loading ? (
              <div style={{
                padding: '3rem 1rem',
                textAlign: 'center',
                color: 'var(--text-muted)',
                border: '1px dashed var(--border-color)',
                borderRadius: 'var(--radius-lg)',
              }}>
                <p style={{ margin: 0, fontWeight: 700 }}>Chưa có dữ liệu doanh thu trong khoảng thời gian đã chọn.</p>
              </div>
            ) : (
            <div style={{ position: 'relative', width: '100%', overflowX: 'auto', padding: '1rem 0' }}>
              <div style={{ minWidth: '700px', width: '100%', height: '250px' }}>
                <svg viewBox="0 0 800 240" width="100%" height="100%" style={{ overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f26c0d" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#f26c0d" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#f26c0d" />
                      <stop offset="100%" stopColor="#ea580c" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Gridlines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                    const yVal = 20 + ratio * 180;
                    return (
                      <g key={ratio}>
                        <line
                          x1="50"
                          y1={yVal}
                          x2="770"
                          y2={yVal}
                          stroke="var(--border-color)"
                          strokeWidth="0.75"
                          strokeDasharray="4 4"
                        />
                        <text
                          x="40"
                          y={yVal + 4}
                          textAnchor="end"
                          fill="var(--text-muted)"
                          fontSize="9"
                          fontWeight="700"
                        >
                          {formatCurrency(maxVal * (1 - ratio))}
                        </text>
                      </g>
                    );
                  })}

                  {/* Area fill path */}
                  {coords.length > 0 && (
                    <path d={areaPath} fill="url(#areaGradient)" />
                  )}

                  {/* Bezier Line path */}
                  {coords.length > 0 && (
                    <path
                      d={linePath}
                      fill="none"
                      stroke="url(#lineGradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Data Points */}
                  {coords.map((pt, i) => (
                    <g key={i}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={hoveredDataPoint === i ? "6" : "4"}
                        fill="var(--bg-card)"
                        stroke="#f26c0d"
                        strokeWidth="3"
                        style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                        onMouseEnter={() => setHoveredDataPoint(i)}
                        onMouseLeave={() => setHoveredDataPoint(null)}
                      />

                      {/* X axis labels */}
                      <text
                        x={pt.x}
                        y="225"
                        textAnchor="middle"
                        fill="var(--text-muted)"
                        fontSize="9.5"
                        fontWeight="700"
                      >
                        {pt.data.statDate.split('-').slice(1).reverse().join('/')}
                      </text>
                    </g>
                  ))}
                </svg>

                {/* Tooltip Overlay */}
                {hoveredDataPoint !== null && (
                  <div style={{
                    position: 'absolute',
                    top: `${coords[hoveredDataPoint].y - 50}px`,
                    left: `${(coords[hoveredDataPoint].x / 800) * 100}%`,
                    transform: 'translateX(-50%)',
                    background: 'var(--bg-dark)',
                    color: 'white',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    boxShadow: 'var(--shadow-xl)',
                    zIndex: 10,
                    pointerEvents: 'none',
                    border: '1px solid rgba(255,255,255,0.15)',
                    whiteSpace: 'nowrap'
                  }}>
                    <div style={{ opacity: 0.8, fontSize: '0.7rem', marginBottom: '0.1rem' }}>
                      {revenueChartData[hoveredDataPoint].statDate}
                    </div>
                    <div>
                      D.Thu: <span style={{ color: '#f26c0d' }}>{formatCurrency(revenueChartData[hoveredDataPoint].totalRevenue)}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#10b981' }}>
                      Thành công: {revenueChartData[hoveredDataPoint].completedOrders} đơn ({revenueChartData[hoveredDataPoint].cancelledOrders} hủy)
                    </div>
                  </div>
                )}
              </div>
            </div>
            )}
          </div>

          {/* Low Stock Alerts */}
          <div style={{
            background: 'var(--bg-card)',
            padding: '1.5rem',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-subtle)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={20} color="var(--warning)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>Cảnh báo tồn kho</h3>
              </div>
              <span style={{
                fontSize: '0.75rem',
                background: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--error)',
                padding: '0.2rem 0.6rem',
                borderRadius: '10px',
                fontWeight: '800'
              }}>{inventoryAlerts.length} Cảnh báo</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {loadErrors.alerts ? (
                <div style={{
                  padding: '2.5rem 1rem',
                  textAlign: 'center',
                  color: 'var(--error)',
                  border: '1px dashed rgba(239, 68, 68, 0.4)',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'rgba(239, 68, 68, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertTriangle size={30} color="var(--error)" style={{ opacity: 0.8 }} />
                  <div>
                    <p style={{ margin: '0 0 0.25rem', fontWeight: 800, fontSize: '0.9rem' }}>Không thể tải cảnh báo tồn kho</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Lỗi kết nối với dịch vụ quản lý kho hàng.</p>
                  </div>
                </div>
              ) : inventoryAlerts.length === 0 && !loading ? (
                <div style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  border: '1px dashed var(--border-color)',
                  borderRadius: 'var(--radius-lg)'
                }}>
                  <CheckCircle2 size={36} color="var(--success)" style={{ margin: '0 auto 0.5rem auto', opacity: 0.8 }} />
                  <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>Tuyệt vời! Kho hàng đạt trạng thái an toàn.</p>
                </div>
              ) : (
                inventoryAlerts.map((alert) => (
                  <div key={alert.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-light)',
                    gap: '1rem',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '240px' }}>
                      {alert.product?.imageUrl?.[0] ? (
                        <img
                          src={alert.product.imageUrl[0]}
                          alt={alert.product.name}
                          style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                        />
                      ) : (
                        <div style={{ width: '44px', height: '44px', background: 'var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ShoppingBag size={18} color="var(--text-muted)" />
                        </div>
                      )}
                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: '800', margin: 0 }}>{alert.product?.name || 'Sản phẩm lỗi'}</h4>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', background: 'var(--border-color)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                            SKU: {alert.product?.sku || 'N/A'}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--error)', fontWeight: '700' }}>
                            Tồn kho thực tế: {alert.availableQuantity} chiếc (Ngưỡng: {alert.lowStockThreshold})
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      icon={Plus}
                      onClick={() => {
                        setRestockItem(alert);
                        setRestockAction('IMPORT');
                        setRestockQuantity(50);
                      }}
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}
                    >
                      Nhập hàng nhanh
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: AI Playpen & Top Products & Shipper KPI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* AI Helper Sandbox */}
          <div style={{
            background: 'var(--bg-card)',
            color: 'var(--text-main)',
            padding: '1.5rem',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            height: '430px',
            transition: 'var(--transition)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={20} color="#f26c0d" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>Trợ lý AI Chatbot</h3>
              </div>
              <span style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                marginLeft: 'auto',
                fontWeight: '800',
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                padding: '0.1rem 0.4rem',
                borderRadius: '4px'
              }}>RAG</span>
            </div>

            {/* Chat Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              padding: '0.5rem',
              backgroundColor: 'var(--bg-main)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '0.75rem',
              border: '1px solid var(--border-color)'
            }}>
              {aiChat.map((msg, i) => (
                <div key={i} style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: msg.role === 'user' ? '#f26c0d' : 'var(--bg-card)',
                  color: msg.role === 'user' ? 'white' : 'var(--text-main)',
                  border: msg.role === 'user' ? 'none' : '1px solid var(--border-color)',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '12px',
                  borderTopRightRadius: msg.role === 'user' ? '2px' : '12px',
                  borderTopLeftRadius: msg.role === 'assistant' ? '2px' : '12px',
                  fontSize: '0.85rem',
                  boxShadow: 'var(--shadow-subtle)'
                }}>
                  <p style={{ margin: 0, fontWeight: '600', lineHeight: 1.4 }}>{msg.content}</p>

                  {/* Recommended Suggestions */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div style={{
                      marginTop: '0.5rem',
                      background: 'var(--bg-main)',
                      padding: '0.5rem',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                      border: '1px solid var(--border-color)'
                    }}>
                      <p style={{ fontSize: '0.7rem', color: '#f26c0d', margin: 0, fontWeight: '800' }}>⭐ SẢN PHẨM KHUYÊN DÙNG:</p>
                      {msg.suggestions.map((sug) => (
                        <div key={sug.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                          <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{sug.name}</span>
                          <span style={{ color: '#10b981', fontWeight: '800', marginLeft: '0.5rem' }}>{formatCurrency(sug.price)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isAiLoading && (
                <div style={{
                  alignSelf: 'flex-start',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span className="loader" style={{ width: '12px', height: '12px', border: '2px solid #f26c0d', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: '0.75rem', opacity: 0.7, fontWeight: '700', color: 'var(--text-main)' }}>AI đang tìm câu trả lời...</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSendAiMessage} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                placeholder="Hỏi AI Chatbot mua sắm..."
                disabled={isAiLoading}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.25rem', // Slightly wider horizontal padding for pill shapes
                  borderRadius: '9999px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  outline: 'none',
                  fontSize: '0.85rem',
                  fontWeight: '600'
                }}
              />
              <button
                type="submit"
                disabled={isAiLoading}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: '#f26c0d',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  opacity: isAiLoading ? 0.6 : 1
                }}
              >
                <Send size={18} />
              </button>
            </form>
          </div>

          {/* Top Selling Products */}
          <div style={{
            background: 'var(--bg-card)',
            padding: '1.5rem',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-subtle)'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="var(--primary)" />
              Sản phẩm bán chạy nhất
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {loadErrors.topProducts ? (
                <div style={{
                  padding: '2rem 1rem',
                  textAlign: 'center',
                  color: 'var(--error)',
                  border: '1px dashed rgba(239, 68, 68, 0.4)',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'rgba(239, 68, 68, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertTriangle size={24} color="var(--error)" style={{ opacity: 0.8 }} />
                  <div>
                    <p style={{ margin: '0 0 0.25rem', fontWeight: 800, fontSize: '0.85rem' }}>Không thể tải sản phẩm bán chạy</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Dịch vụ thống kê sản phẩm đang bảo trì.</p>
                  </div>
                </div>
              ) : topProducts.length === 0 && !loading ? (
                <p style={{ margin: 0, color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>
                  Chưa có dữ liệu sản phẩm bán chạy.
                </p>
              ) : topProducts.map((prod, i) => (
                <div key={prod.productId} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '0.75rem',
                  borderBottom: i !== topProducts.length - 1 ? '1px solid var(--border-color)' : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: 'rgba(242, 108, 13, 0.1)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '0.9rem'
                    }}>
                      #{i + 1}
                    </div>
                    <div>
                      <p style={{ fontWeight: '800', fontSize: '0.9rem', margin: 0 }}>{prod.productName}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', margin: 0 }}>
                        SKU: {prod.productSku} • Lần bán cuối: {new Date(prod.lastSoldAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: '800', fontSize: '0.95rem', margin: 0, color: 'var(--primary)' }}>
                      {formatCurrency(prod.totalRevenueGenerated)}
                    </p>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--success)' }}>
                      Đã bán: {prod.totalQuantitySold} chiếc
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shippers KPI Section */}
          <div style={{
            background: 'var(--bg-card)',
            padding: '1.5rem',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-subtle)'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={20} color="var(--primary)" />
              Hiệu suất giao hàng
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {loadErrors.shippers ? (
                <div style={{
                  padding: '2rem 1rem',
                  textAlign: 'center',
                  color: 'var(--error)',
                  border: '1px dashed rgba(239, 68, 68, 0.4)',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'rgba(239, 68, 68, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertTriangle size={24} color="var(--error)" style={{ opacity: 0.8 }} />
                  <div>
                    <p style={{ margin: '0 0 0.25rem', fontWeight: 800, fontSize: '0.85rem' }}>Không thể tải chỉ số shipper</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Dịch vụ giao nhận đang bảo trì hoặc quá tải.</p>
                  </div>
                </div>
              ) : shippersKpi.length === 0 && !loading ? (
                <p style={{ margin: 0, color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>
                  Chưa có dữ liệu hiệu suất giao hàng.
                </p>
              ) : shippersKpi.map((shipper) => (
                <div key={shipper.shipperName} style={{
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-light)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <div>
                      <p style={{ fontWeight: '800', fontSize: '0.9rem', margin: 0 }}>{shipper.shipperName}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>SĐT: {shipper.shipperPhone}</p>
                    </div>
                    <span style={{
                      fontSize: '0.75rem',
                      background: shipper.successRate >= 95 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: shipper.successRate >= 95 ? 'var(--success)' : 'var(--warning)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '10px',
                      fontWeight: '800'
                    }}>
                      Tỉ lệ: {shipper.successRate}%
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                    <span>Đơn giao hỏng: {shipper.failedDeliveries}</span>
                    <span>T.gian trung bình: <strong style={{ color: 'var(--text-main)' }}>{shipper.averageDeliveryTimeHours} giờ</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Restock Inventory Modal Form */}
      {createPortal(
        <AnimatePresence>
          {restockItem && (
            <div style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1rem'
            }}>
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                style={{
                  background: 'var(--bg-card)',
                  width: '100%',
                  maxWidth: '460px',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-xl)',
                  overflow: 'hidden'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Điều chỉnh tồn kho</h3>
                  <button onClick={() => setRestockItem(null)} style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <X size={20} />
                  </button>
                </div>

                <div style={{ padding: '1.5rem' }}>
                  <div style={{ background: 'var(--bg-light)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
                    <p style={{ fontWeight: 800, margin: 0, fontSize: '0.95rem' }}>{restockItem.product?.name}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
                      Mã SKU: {restockItem.product?.sku}
                    </p>
                  </div>

                  <StockAdjustForm
                    action={restockAction}
                    onActionChange={setRestockAction}
                    quantity={restockQuantity}
                    onQuantityChange={setRestockQuantity}
                    onSubmit={handleRestockSubmit}
                    onCancel={() => setRestockItem(null)}
                    submitting={submittingRestock}
                    inventoryDetails={restockItem}
                    loading={false}
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Global CSS spinner rule helper */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .loader {
          border-radius: 50%;
          display: inline-block;
          box-sizing: border-box;
        }
      `}} />

    </div>
  );
};

export default Dashboard;
