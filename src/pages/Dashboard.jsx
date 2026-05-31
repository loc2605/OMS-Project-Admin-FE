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
  X,
  Bot,
  MessageCircle
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
      padding: '1.15rem',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-subtle)',
      flex: 1,
      minWidth: '220px',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
      <div style={{
        width: '38px',
        height: '38px',
        borderRadius: '10px',
        background: color,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 4px 10px -2px ${color}55`
      }}>
        <Icon size={18} />
      </div>
    </div>

    <div>
      <h3 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '0 0 0.15rem 0', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{value}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700', margin: '0 0 0.15rem 0' }}>{title}</p>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', margin: 0, opacity: 0.8 }}>{subtitle}</p>
    </div>

    <div style={{
      position: 'absolute',
      bottom: '-10px',
      right: '-10px',
      opacity: 0.03,
      color: 'var(--text-main)',
      transform: 'rotate(-15deg)'
    }}>
      <Icon size={76} />
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
  const [isChatOpen, setIsChatOpen] = useState(false);

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
    if (revenueChartData.length === 0) return { linePath: '', areaPath: '', coords: [], maxVal: 0, height: 360, paddingBottom: 40, paddingTop: 20, chartH: 300, paddingLeft: 85 };
    const width = 800;
    const height = 360;
    const paddingLeft = 85;
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

    return { linePath, areaPath, coords, maxVal, height, paddingBottom, paddingTop, chartH, paddingLeft };
  };

  const { linePath, areaPath, coords, maxVal, height, paddingBottom, paddingTop, chartH, paddingLeft } = renderSVGChartPath();

  const statsList = [
    { title: 'Doanh thu trong ngày', value: formatCurrency(summary.todayTotalRevenue), subtitle: 'Doanh số thực tế ghi nhận', icon: DollarSign, color: '#f26c0d' },
    { title: 'Đơn hoàn thành', value: `${summary.todayCompletedOrders} đơn`, subtitle: 'Giao hàng thành công', icon: ShoppingBag, color: 'var(--success)' },
    { title: 'Tỷ lệ hủy đơn', value: `${Number(summary.todayCancelRate || 0).toFixed(1)}%`, subtitle: 'Đã hủy / Tổng đơn đặt', icon: TrendingUp, color: 'var(--error)' },
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

      {/* Revenue Chart Box - Full Width */}

      {/* Revenue Chart Box */}
      <div style={{
        background: 'var(--bg-card)',
        padding: '1.5rem',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-subtle)',
        marginTop: '-0.35rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
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
            <div style={{ minWidth: '700px', width: '100%', height: '380px' }}>
              <svg viewBox="0 0 800 360" width="100%" height="100%" style={{ overflow: 'visible' }}>
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
                  const yVal = (paddingTop !== undefined ? paddingTop : 20) + ratio * (chartH !== undefined ? chartH : 300);
                  return (
                    <g key={ratio}>
                      <line
                        x1={paddingLeft !== undefined ? paddingLeft : 85}
                        y1={yVal}
                        x2={800 - 30}
                        y2={yVal}
                        stroke="var(--border-color)"
                        strokeWidth="0.75"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={paddingLeft !== undefined ? paddingLeft - 10 : 75}
                        y={yVal + 4}
                        textAnchor="end"
                        fill="var(--text-main)"
                        fontSize="11"
                        fontWeight="800"
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
                      y={height !== undefined ? height - 15 : 345}
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

      {/* Vertical Layout below the Chart - Each component takes a full-width row */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        width: '100%',
        marginTop: '-0.35rem'
      }}>

        {/* Left Column: Sản phẩm bán chạy */}
        <div style={{
          background: 'var(--bg-card)',
          padding: '1.5rem',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} color="var(--primary)" />
            Sản phẩm bán chạy nhất
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
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
                      SKU: {prod.productSku || (prod.productId ? prod.productId.substring(0, 8).toUpperCase() : 'N/A')}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: '800', fontSize: '0.95rem', margin: 0, color: 'var(--primary)' }}>
                    {formatCurrency(prod.totalRevenue !== undefined ? prod.totalRevenue : prod.totalRevenueGenerated)}
                  </p>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--success)' }}>
                    Đã bán: {prod.totalSoldQuantity !== undefined ? prod.totalSoldQuantity : prod.totalQuantitySold} chiếc
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2: Cảnh báo tồn kho */}
          <div style={{
            background: 'var(--bg-card)',
            padding: '1.5rem',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CheckCircle2 size={36} color="var(--success)" style={{ margin: '0 auto 0.5rem auto', opacity: 0.8 }} />
                  <p style={{ fontWeight: '700', fontSize: '0.9rem', margin: 0 }}>Kho hàng đạt trạng thái an toàn.</p>
                </div>
              ) : (
                inventoryAlerts.map((alert) => (
                  <div key={alert.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-light)',
                    gap: '0.75rem',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '180px' }}>
                      {alert.product?.imageUrl?.[0] ? (
                        <img
                          src={alert.product.imageUrl[0]}
                          alt={alert.product.name}
                          style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                        />
                      ) : (
                        <div style={{ width: '38px', height: '38px', background: 'var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ShoppingBag size={16} color="var(--text-muted)" />
                        </div>
                      )}
                      <div>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '800', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {alert.product?.name || 'Sản phẩm lỗi'}
                        </h4>
                        <span style={{ fontSize: '0.7rem', color: 'var(--error)', fontWeight: '700' }}>
                          Tồn: {alert.availableQuantity} chiếc
                        </span>
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
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                    >
                      Nhập hàng
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 3: Hiệu suất giao hàng */}
          <div style={{
            background: 'var(--bg-card)',
            padding: '1.5rem',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                      Tỉ lệ: {Number(shipper.successRate || 0).toFixed(1)}%
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                    <span>Đơn hỏng: {shipper.failedDeliveries}</span>
                    <span>TB: <strong style={{ color: 'var(--text-main)' }}>{Number(shipper.averageDeliveryTimeHours || 0).toFixed(2)} giờ</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

      </div>

      {/* Floating AI Chatbot Button & Widget Panel (Rendered directly in body via Portal for perfect fixed viewport alignment) */}
      {createPortal(
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000 }}>
          <AnimatePresence>
            {isChatOpen && (
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                transition={{ type: 'spring', damping: 22, stiffness: 220 }}
                style={{
                  position: 'absolute',
                  bottom: '4.8rem',
                  right: 0,
                  width: '380px',
                  height: '520px',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-xl)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.18)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}
              >
                {/* Header */}
                <div style={{
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'linear-gradient(135deg, var(--primary) 0%, #ea580c 100%)',
                  color: 'white'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Bot size={22} style={{ animation: 'bounce 2s infinite' }} />
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: 0, letterSpacing: '-0.01em' }}>Trợ lý AI Chatbot</h3>
                      <span style={{ fontSize: '0.7rem', opacity: 0.9, fontWeight: '600' }}>RAG Smart Search Engine</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsChatOpen(false)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Chat Messages */}
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  padding: '1.25rem',
                  backgroundColor: 'var(--bg-main)'
                }}>
                  {aiChat.map((msg, i) => (
                    <div key={i} style={{
                      alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      padding: '0.75rem 1rem',
                      borderRadius: msg.role === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
                      background: msg.role === 'user' ? 'var(--primary)' : 'var(--bg-card)',
                      color: msg.role === 'user' ? 'white' : 'var(--text-main)',
                      boxShadow: msg.role === 'user' ? 'none' : 'var(--shadow-subtle)',
                      border: msg.role === 'user' ? 'none' : '1px solid var(--border-color)',
                      fontSize: '0.85rem',
                      lineHeight: '1.45',
                      fontWeight: msg.role === 'user' ? '600' : '500'
                    }}>
                      <p style={{ margin: 0 }}>{msg.content}</p>

                      {/* Recommended Suggestions */}
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div style={{
                          marginTop: '0.65rem',
                          background: 'var(--bg-main)',
                          padding: '0.5rem 0.65rem',
                          borderRadius: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.35rem',
                          border: '1px solid var(--border-color)'
                        }}>
                          <p style={{ fontSize: '0.7rem', color: '#f26c0d', margin: 0, fontWeight: '800' }}>⭐ SẢN PHẨM KHUYÊN DÙNG:</p>
                          {msg.suggestions.map((sug) => (
                            <div key={sug.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem' }}>
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
                      padding: '0.75rem 1rem',
                      borderRadius: '16px 16px 16px 0',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      gap: '0.35rem',
                      alignItems: 'center'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
                      <span style={{ fontSize: '0.75rem', opacity: 0.7, fontWeight: '700', color: 'var(--text-main)' }}>AI đang phân tích...</span>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendAiMessage} style={{
                  padding: '0.75rem 1rem',
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  gap: '0.5rem',
                  backgroundColor: 'var(--bg-card)'
                }}>
                  <input
                    type="text"
                    placeholder="Hỏi AI Chatbot mua sắm..."
                    value={aiMessage}
                    onChange={(e) => setAiMessage(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.6rem 1rem',
                      borderRadius: '20px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-light)',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      outline: 'none',
                      fontWeight: '600'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isAiLoading}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      cursor: 'pointer',
                      opacity: isAiLoading ? 0.6 : 1
                    }}
                  >
                    <Send size={16} />
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pulse Floating Circle Button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              y: [0, -16, 0]
            }}
            transition={{
              y: {
                repeat: Infinity,
                duration: 1.4,
                ease: "easeInOut"
              }
            }}
            onClick={() => setIsChatOpen(!isChatOpen)}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary) 0%, #ea580c 100%)',
              color: 'white',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(242, 108, 13, 0.4)',
              outline: 'none'
            }}
          >
            <Bot size={28} />
          </motion.button>
        </div>,
        document.body
      )}

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
