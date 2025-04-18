// Mock data generation functions for dashboard

/**
 * Generate mock sales data for the specified time range
 * @param {string} timeRange - Time range for the sales data
 * @returns {Array} Array of sales data points
 */
export const generateMockSalesData = (timeRange = "weekly") => {
  let dataPoints = 0;
  let dateFormat = '';
  
  // Determine number of data points and date format based on time range
  switch(timeRange) {
    case 'daily':
      dataPoints = 24; // 24 hours
      dateFormat = 'hour';
      break;
    case 'weekly':
      dataPoints = 7; // 7 days
      dateFormat = 'day';
      break;
    case 'monthly':
      dataPoints = 12; // 12 months
      dateFormat = 'month';
      break;
    case 'yearly':
      dataPoints = 5; // 5 years
      dateFormat = 'year';
      break;
    default:
      dataPoints = 7; // Default to weekly
      dateFormat = 'day';
  }
  
  const salesData = [];
  const now = new Date();
  const baseRevenue = 5000 + Math.random() * 2000;
  const baseOrders = 80 + Math.random() * 40;
  
  // Seasonal factors to add realism (Q4 higher, Q1 lower)
  const currentMonth = now.getMonth();
  const seasonalFactor = [0.8, 0.85, 0.9, 0.95, 1.0, 1.05, 1.1, 1.15, 1.2, 1.3, 1.4, 1.25][currentMonth];
  
  // Generate data points
  for (let i = 0; i < dataPoints; i++) {
    let date;
    const adjustedBaseRevenue = baseRevenue * seasonalFactor * (0.9 + Math.random() * 0.2);
    const adjustedBaseOrders = baseOrders * seasonalFactor * (0.9 + Math.random() * 0.2);
    const growthFactor = 1 + (i * 0.02); // Small growth trend
    
    // Generate date labels based on format
    switch(dateFormat) {
      case 'hour':
        date = `${23 - i}:00`;
        break;
      case 'day':
        const dayDate = new Date(now);
        dayDate.setDate(now.getDate() - (dataPoints - 1 - i));
        date = dayDate.toISOString().split('T')[0];
        break;
      case 'month':
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthIndex = ((currentMonth - dataPoints + 1 + i) + 12) % 12;
        date = months[monthIndex];
        break;
      case 'year':
        date = (now.getFullYear() - (dataPoints - 1 - i)).toString();
        break;
    }
    
    // Calculate values with some randomness
    const noise = 0.85 + Math.random() * 0.3; // Random factor between 0.85 and 1.15
    const revenue = Math.round(adjustedBaseRevenue * growthFactor * noise);
    const orders = Math.round(adjustedBaseOrders * growthFactor * noise);
    
    salesData.push({
      date,
      revenue,
      orders
    });
  }
  
  return salesData;
};

// Calculate dynamic stats based on the sales data
export const generateMockStats = (timeRange = "weekly") => {
  // Get sales data to base calculations on
  const salesData = generateMockSalesData(timeRange);
  
  // Calculate total revenue and orders from sales data
  const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = salesData.reduce((sum, item) => sum + item.orders, 0);
  
  // Calculate trends by comparing last two data points
  const lastIndex = salesData.length - 1;
  const revenueTrend = lastIndex > 0 ? 
    ((salesData[lastIndex].revenue - salesData[lastIndex-1].revenue) / 
     salesData[lastIndex-1].revenue * 100).toFixed(1) : 0;
  
  const ordersTrend = lastIndex > 0 ? 
    ((salesData[lastIndex].orders - salesData[lastIndex-1].orders) / 
     salesData[lastIndex-1].orders * 100).toFixed(1) : 0;
  
  // Fixed product and user numbers
  const fixedUsersCount = 8;
  const fixedProductsCount = 13;
  
  return {
    totalUsers: fixedUsersCount,
    totalOrders: totalOrders,
    totalProducts: fixedProductsCount,
    totalRevenue: Math.round(totalRevenue),
    usersTrend: parseFloat((Math.random() * 10 - 2).toFixed(1)),
    ordersTrend: parseFloat(ordersTrend),
    productsTrend: parseFloat((Math.random() * 8 - 2).toFixed(1)),
    revenueTrend: parseFloat(revenueTrend)
  };
};

// Generate top products with data correlated to overall sales
export const generateMockTopProducts = (timeRange = "weekly") => {
  // Get overall stats to correlate product data
  const stats = generateMockStats(timeRange);
  const totalRevenue = stats.totalRevenue;
  
  // Base products
  const baseProducts = [
    {
      id: "P001",
      name: "Premium Smartphone X",
      category: "Electronics",
      baseShare: 0.25 // 25% of total revenue
    },
    {
      id: "P002",
      name: "Wireless Headphones Pro",
      category: "Electronics",
      baseShare: 0.15
    },
    {
      id: "P003",
      name: "Designer Handbag",
      category: "Fashion",
      baseShare: 0.12
    },
    {
      id: "P004",
      name: "Smart Watch Series 5",
      category: "Electronics",
      baseShare: 0.10
    },
    {
      id: "P005",
      name: "Luxury Perfume Set",
      category: "Beauty",
      baseShare: 0.07
    }
  ];
  
  // Calculate revenue and sales numbers based on market share
  const avgOrderValue = totalRevenue / stats.totalOrders;
  
  return baseProducts.map(product => {
    // Add random variation to base share
    const actualShare = product.baseShare * (0.85 + Math.random() * 0.3);
    const revenue = Math.round(totalRevenue * actualShare);
    const sales = Math.round(revenue / avgOrderValue * (0.8 + Math.random() * 0.4));
    
    return {
      id: product.id,
      name: product.name,
      sales: sales,
      revenue: revenue,
      category: product.category
    };
  }).sort((a, b) => b.revenue - a.revenue); // Sort by revenue
};

// Generate category distribution based on top products
export const generateMockCategoryDistribution = (timeRange = "weekly") => {
  // Get top products to derive category data
  const topProducts = generateMockTopProducts(timeRange);
  
  // Aggregate products by category
  const categories = {};
  let totalRevenue = 0;
  
  topProducts.forEach(product => {
    if (!categories[product.category]) {
      categories[product.category] = {
        name: product.category,
        revenue: 0,
        count: 0
      };
    }
    
    categories[product.category].revenue += product.revenue;
    categories[product.category].count += 1;
    totalRevenue += product.revenue;
  });
  
  // Add a few more categories with smaller values
  const additionalCategories = [
    { name: "Home & Living", baseShare: 0.07 },
    { name: "Sports", baseShare: 0.05 },
    { name: "Books", baseShare: 0.03 },
    { name: "Toys", baseShare: 0.02 }
  ];
  
  additionalCategories.forEach(cat => {
    if (!categories[cat.name]) {
      const actualShare = cat.baseShare * (0.8 + Math.random() * 0.4);
      const revenue = Math.round(totalRevenue * actualShare);
      
      categories[cat.name] = {
        name: cat.name,
        revenue: revenue,
        count: 0
      };
      
      totalRevenue += revenue;
    }
  });
  
  // Convert to array and calculate percentage values
  return Object.values(categories).map(cat => ({
    name: cat.name,
    value: Math.round((cat.revenue / totalRevenue) * 100),
    revenue: cat.revenue
  })).sort((a, b) => b.value - a.value);
};

// Main function to generate comprehensive analytics data
export const generateMockAnalyticsData = (timeRange = "weekly") => {
  // Get base data
  const stats = generateMockStats(timeRange);
  const salesData = generateMockSalesData(timeRange);
  const topProducts = generateMockTopProducts(timeRange);
  const categoryDistribution = generateMockCategoryDistribution(timeRange);
  
  // Calculate seasonal adjustment factor
  const seasonalMonth = new Date().getMonth();
  const seasonalFactor = [0.8, 0.85, 0.9, 0.95, 1, 1.05, 1.1, 1.15, 1.2, 1.3, 1.4, 1.25][seasonalMonth];
  
  // Generate customer segment data
  const customerSegments = [
    { 
      segment: "Premium", 
      count: Math.round(stats.totalUsers * 0.2), 
      revenue: Math.round(stats.totalRevenue * 0.6) 
    },
    { 
      segment: "Regular", 
      count: Math.round(stats.totalUsers * 0.5), 
      revenue: Math.round(stats.totalRevenue * 0.3) 
    },
    { 
      segment: "New", 
      count: Math.round(stats.totalUsers * 0.3), 
      revenue: Math.round(stats.totalRevenue * 0.1) 
    }
  ];
  
  // Generate order status distribution
  const orderStatusDistribution = [
    { 
      status: "Completed", 
      count: Math.round(stats.totalOrders * 0.70 * seasonalFactor), 
      percentage: Math.round(70 * seasonalFactor * 10) / 10 
    },
    { 
      status: "Processing", 
      count: Math.round(stats.totalOrders * 0.20), 
      percentage: Math.round(20 * (2 - seasonalFactor) * 10) / 10 
    },
    { 
      status: "Pending", 
      count: Math.round(stats.totalOrders * 0.10), 
      percentage: Math.round(10 * (2 - seasonalFactor) * 10) / 10 
    }
  ];
  
  // Generate customer retention data
  const retentionRate = 75 + Math.random() * 10;
  const retentionTrend = (Math.random() * 10 - 3) * seasonalFactor;
  
  // Generate retention history with realistic progression
  const retentionHistory = [];
  let baseRate = retentionRate - (retentionTrend * 5);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  for (let i = 0; i < 6; i++) {
    // Progressive improvement with some noise
    baseRate += (retentionTrend/5) + (Math.random() * 2 - 1);
    const monthIndex = (seasonalMonth - 5 + i + 12) % 12;
    
    retentionHistory.push({
      month: months[monthIndex],
      rate: parseFloat(baseRate.toFixed(1))
    });
  }
  
  // Generate sales by region
  const totalSales = stats.totalOrders;
  const salesByRegion = [
    { region: "North", sales: Math.round(totalSales * 0.30 * (0.9 + Math.random() * 0.2)) },
    { region: "South", sales: Math.round(totalSales * 0.25 * (0.9 + Math.random() * 0.2)) },
    { region: "East", sales: Math.round(totalSales * 0.23 * (0.9 + Math.random() * 0.2)) },
    { region: "West", sales: Math.round(totalSales * 0.22 * (0.9 + Math.random() * 0.2)) }
  ];
  
  // Calculate revenue for each region
  salesByRegion.forEach(region => {
    region.revenue = Math.round((region.sales / totalSales) * stats.totalRevenue);
  });
  
  // Generate payment method distribution
  const paymentMethods = [
    { method: "Credit Card", percentage: Math.round(35 + Math.random() * 15) },
    { method: "Debit Card", percentage: Math.round(20 + Math.random() * 15) },
    { method: "UPI", percentage: Math.round(10 + Math.random() * 10) }
  ];
  
  // Ensure percentages add up to 100%
  const currentSum = paymentMethods.reduce((sum, method) => sum + method.percentage, 0);
  paymentMethods.push({ 
    method: "Net Banking", 
    percentage: 100 - currentSum 
  });
  
  return {
    salesTrend: salesData,
    categoryDistribution: categoryDistribution,
    topProducts: topProducts,
    customerSegments: customerSegments,
    revenueByCategory: categoryDistribution,
    orderStatusDistribution: orderStatusDistribution,
    customerRetention: {
      rate: parseFloat(retentionRate.toFixed(1)),
      trend: parseFloat(retentionTrend.toFixed(1)),
      history: retentionHistory
    },
    productPerformance: topProducts.map((product) => ({
      ...product,
      metrics: {
        sales: product.sales,
        revenue: product.revenue,
        rating: (4.0 + Math.random() * 1.0).toFixed(1),
        returns: Math.floor(product.sales * (0.02 + Math.random() * 0.03))
      }
    })),
    salesByRegion: salesByRegion,
    paymentMethods: paymentMethods,
    realTimeMetrics: {
      activeUsers: Math.floor(50 + Math.random() * 100),
      cartAbandonment: (15 + Math.random() * 10).toFixed(1) + '%',
      conversionRate: (3 + Math.random() * 2).toFixed(1) + '%',
      averageOrderValue: Math.floor(stats.totalRevenue / stats.totalOrders)
    }
  };
};

// API Integration - Fetch real data and calculate analytics locally

/**
 * Fetches orders from the API and transforms them for analytics
 * @param {string} timeRange - Time range to filter data
 * @param {Object} customDateRange - Optional custom date range {startDate, endDate}
 * @returns {Promise<Array>} Transformed order data
 */
export const fetchOrdersData = async (timeRange = 'weekly', customDateRange = null) => {
  try {
    // Import API service
    const { orderAPI } = await import('../services/api');
    
    // Use the date range utility
    const { startDate, endDate } = getDateRangeForTimeframe(timeRange, customDateRange);
    
    // Fetch orders with date filters
    const params = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      limit: 1000 // Get a large sample size for analytics
    };
    
    const response = await orderAPI.getAllAdmin(params);
    
    if (response && response.data && response.data.orders) {
      return response.data.orders;
    }
    
    return [];
  } catch (error) {
    console.error("Failed to fetch orders data:", error);
    return [];
  }
};

/**
 * Fetches products from the API for analytics
 * @returns {Promise<Array>} Product data
 */
export const fetchProductsData = async () => {
  try {
    // Import API service
    const { productAPI } = await import('../services/api');
    
    // Fetch products with full details
    const response = await productAPI.getAll({ limit: 1000 });
    
    if (response && response.data && response.data.products) {
      return response.data.products;
    }
    
    return [];
  } catch (error) {
    console.error("Failed to fetch products data:", error);
    return [];
  }
};

/**
 * Fetches user data from the API for analytics
 * @param {string} timeRange - Time range to filter data
 * @param {Object} customDateRange - Optional custom date range
 * @returns {Promise<Array>} User data
 */
export const fetchUsersData = async (timeRange = 'weekly', customDateRange = null) => {
  try {
    // Import API service
    const { userAPI } = await import('../services/api');
    
    // Use the date range utility
    const { startDate, endDate } = getDateRangeForTimeframe(timeRange, customDateRange);
    
    // Handle user authentication data safely
    try {
      const userData = localStorage.getItem('user');
      // Only parse if userData is not null/undefined/empty
      if (userData && userData !== "undefined" && userData !== "null") {
        // Just validate it parses without error
        JSON.parse(userData);
      }
    } catch (parseError) {
      console.error("Failed to parse user data:", parseError);
      // Return mock data when user auth is invalid
      return generateMockUsers(8);
    }
    
    // Fetch users
    const response = await userAPI.getAll({ 
      limit: 1000,
      createdAfter: startDate.toISOString(),
      createdBefore: endDate.toISOString()
    });
    
    if (response && response.data && response.data.users) {
      return response.data.users;
    }
    
    return generateMockUsers(8);
  } catch (error) {
    console.error("Failed to fetch users data:", error);
    return generateMockUsers(8);
  }
};

/**
 * Generate mock user data
 * @param {number} count - Number of mock users to generate
 * @returns {Array} Array of mock user objects
 */
function generateMockUsers(count = 8) {
  const users = [];
  for (let i = 1; i <= count; i++) {
    users.push({
      _id: `mock-user-${i}`,
      name: `User ${i}`,
      email: `user${i}@example.com`,
      role: i === 1 ? 'admin' : 'user'
    });
  }
  return users;
}

/**
 * Calculate sales data from orders
 * @param {Array} orders - Raw orders from API
 * @param {string} timeRange - Time range for grouping
 * @returns {Array} Sales data grouped by date/week/month/year
 */
export const calculateSalesData = (orders = [], timeRange = 'weekly') => {
  if (!orders.length) {
    // Fallback to mock data if no orders
    return generateMockSalesData(timeRange);
  }
  
  // Group orders by date according to timeRange
  const groupedSales = {};
  const dateFormat = {};
  
  // Set date format based on time range
  switch (timeRange) {
    case 'daily':
      // Group by day
      orders.forEach(order => {
        const date = new Date(order.createdAt);
        const dateKey = date.toISOString().split('T')[0];
        
        if (!groupedSales[dateKey]) {
          groupedSales[dateKey] = { revenue: 0, orders: 0 };
        }
        
        groupedSales[dateKey].revenue += order.totalAmount || 0;
        groupedSales[dateKey].orders += 1;
      });
      break;
      
    case 'weekly':
      // Group by week number
      orders.forEach(order => {
        const date = new Date(order.createdAt);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = `Week ${weekStart.getMonth()+1}-${weekStart.getDate()}`;
        
        if (!groupedSales[weekKey]) {
          groupedSales[weekKey] = { revenue: 0, orders: 0 };
        }
        
        groupedSales[weekKey].revenue += order.totalAmount || 0;
        groupedSales[weekKey].orders += 1;
      });
      break;
      
    case 'monthly':
      // Group by month
      orders.forEach(order => {
        const date = new Date(order.createdAt);
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthKey = months[date.getMonth()];
        
        if (!groupedSales[monthKey]) {
          groupedSales[monthKey] = { revenue: 0, orders: 0 };
        }
        
        groupedSales[monthKey].revenue += order.totalAmount || 0;
        groupedSales[monthKey].orders += 1;
      });
      break;
      
    case 'yearly':
      // Group by year
      orders.forEach(order => {
        const date = new Date(order.createdAt);
        const yearKey = date.getFullYear().toString();
        
        if (!groupedSales[yearKey]) {
          groupedSales[yearKey] = { revenue: 0, orders: 0 };
        }
        
        groupedSales[yearKey].revenue += order.totalAmount || 0;
        groupedSales[yearKey].orders += 1;
      });
      break;
      
    default:
      // Default to daily
      return calculateSalesData(orders, 'daily');
  }
  
  // Convert grouped data to array format
  const salesData = Object.keys(groupedSales).map(date => ({
    date,
    revenue: Math.round(groupedSales[date].revenue),
    orders: groupedSales[date].orders
  }));
  
  // Sort by date
  salesData.sort((a, b) => {
    if (timeRange === 'monthly') {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return months.indexOf(a.date) - months.indexOf(b.date);
    }
    return a.date.localeCompare(b.date);
  });
  
  return salesData;
};

/**
 * Calculate top products from orders and products
 * @param {Array} orders - Raw orders from API
 * @param {Array} products - Raw products from API
 * @returns {Array} Top products by sales
 */
export const calculateTopProducts = (orders = [], products = []) => {
  if (!orders.length || !products.length) {
    // Fallback to mock data if no data
    return generateMockTopProducts();
  }
  
  // Create a map of products by ID
  const productsMap = products.reduce((map, product) => {
    map[product._id] = product;
    return map;
  }, {});
  
  // Aggregate sales by product
  const productSales = {};
  
  orders.forEach(order => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        const productId = item.product.toString();
        
        if (!productSales[productId]) {
          const product = productsMap[productId] || { name: 'Unknown Product' };
          productSales[productId] = {
            id: productId,
            name: product.name || 'Unknown Product',
            category: product.category?.name || 'Uncategorized',
            sales: 0,
            revenue: 0
          };
        }
        
        productSales[productId].sales += item.quantity || 1;
        productSales[productId].revenue += (item.price * item.quantity) || 0;
      });
    }
  });
  
  // Convert to array and sort by revenue
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5); // Get top 5
  
  return topProducts;
};

/**
 * Calculate category distribution from orders and products
 * @param {Array} orders - Raw orders from API
 * @param {Array} products - Raw products from API
 * @returns {Array} Category distribution data
 */
export const calculateCategoryDistribution = (orders = [], products = []) => {
  if (!orders.length || !products.length) {
    // Fallback to mock data if no data
    return generateMockCategoryDistribution();
  }
  
  // Create maps for lookup
  const productsMap = products.reduce((map, product) => {
    map[product._id] = product;
    return map;
  }, {});
  
  // Aggregate sales by category
  const categoryData = {};
  let totalRevenue = 0;
  
  orders.forEach(order => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        const productId = item.product.toString();
        const product = productsMap[productId];
        const categoryName = product?.category?.name || 'Uncategorized';
        
        if (!categoryData[categoryName]) {
          categoryData[categoryName] = {
            name: categoryName,
            revenue: 0,
            count: 0
          };
        }
        
        const itemRevenue = (item.price * item.quantity) || 0;
        categoryData[categoryName].revenue += itemRevenue;
        categoryData[categoryName].count += item.quantity || 1;
        totalRevenue += itemRevenue;
      });
    }
  });
  
  // Convert to array and calculate percentages
  const categories = Object.values(categoryData).map(category => ({
    name: category.name,
    value: totalRevenue > 0 ? Math.round((category.revenue / totalRevenue) * 100) : 0,
    revenue: Math.round(category.revenue)
  })).sort((a, b) => b.value - a.value);
  
  return categories;
};

/**
 * Calculate overall stats from sales data
 * @param {Array} salesData - Sales data from calculateSalesData
 * @param {Array} users - Users data from API
 * @param {Array} products - Products data from API
 * @returns {Object} Overall statistics
 */
export const calculateStats = (salesData = [], users = [], products = []) => {
  if (!salesData.length) {
    // Fallback to mock data if no sales data
    return generateMockStats();
  }
  
  // Calculate totals from sales data
  const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = salesData.reduce((sum, item) => sum + item.orders, 0);
  
  // Calculate trends by comparing last periods (if available)
  let revenueTrend = 0;
  let ordersTrend = 0;
  
  if (salesData.length > 1) {
    const currentRevenue = salesData[salesData.length - 1].revenue;
    const previousRevenue = salesData[salesData.length - 2].revenue;
    
    revenueTrend = previousRevenue > 0 ? 
      ((currentRevenue - previousRevenue) / previousRevenue * 100) : 0;
    
    const currentOrders = salesData[salesData.length - 1].orders;
    const previousOrders = salesData[salesData.length - 2].orders;
    
    ordersTrend = previousOrders > 0 ? 
      ((currentOrders - previousOrders) / previousOrders * 100) : 0;
  }
  
  // Use actual counts for users and products
  const totalUsers = users.length  // Default to 8 if no users data
  const totalProducts = products.length  // Default to 13 if no products data
  
  // Calculate trends for users and products (would need historical data)
  // Using random values as placeholders
  const usersTrend = (Math.random() * 10 - 3).toFixed(1);
  const productsTrend = (Math.random() * 8 - 2).toFixed(1);
  
  return {
    totalUsers: totalUsers,
    totalOrders: totalOrders,
    totalProducts: totalProducts,
    totalRevenue: Math.round(totalRevenue),
    usersTrend: parseFloat(usersTrend),
    ordersTrend: parseFloat(revenueTrend.toFixed(1)),
    productsTrend: parseFloat(productsTrend),
    revenueTrend: parseFloat(ordersTrend.toFixed(1))
  };
};

/**
 * Generate analytics data from real API data with fallback to local calculations
 * @param {string} timeRange - Time range for analytics 
 * @param {Object} customDateRange - Optional custom date range
 * @returns {Promise<Object>} Complete analytics data
 */
export const fetchAndCalculateAnalytics = async (timeRange = 'weekly', customDateRange = null, forecastPeriods = 3) => {
  try {
    // Import API service
    const { analyticsAPI } = await import('../services/api');
    
    // First attempt to use the analytics API endpoints
    try {
      // Prepare parameters
      const params = customDateRange ? { 
        startDate: customDateRange.startDate.toISOString(),
        endDate: customDateRange.endDate.toISOString()
      } : {};
      
      // Get all analytics data from API in parallel
      const [
        dashboardOverview,
        salesTrends,
        topProductsData,
        categoryData,
        customerSegmentsData,
        orderStatusData,
        customerRetentionData,
        paymentMethodsData,
        salesRegionData
      ] = await Promise.all([
        analyticsAPI.getDashboardOverview(timeRange, params),
        analyticsAPI.getSalesTrends(timeRange, params),
        analyticsAPI.getTopProducts(timeRange, params),
        analyticsAPI.getCategoryDistribution(timeRange, params),
        analyticsAPI.getCustomerSegments(timeRange, params),
        analyticsAPI.getOrderStatusDistribution(timeRange, params),
        analyticsAPI.getCustomerRetention(timeRange, params),
        analyticsAPI.getPaymentMethods(timeRange, params),
        analyticsAPI.getSalesByRegion(timeRange, params)
      ]);
      
      // Extract data from API responses
      const stats = dashboardOverview.data?.stats || {
        totalUsers: 8,
        totalOrders: 0,
        totalProducts: 13,
        totalRevenue: 0,
        usersTrend: 0,
        ordersTrend: 0,
        productsTrend: 0,
        revenueTrend: 0
      };
      
      const salesData = salesTrends.data?.trends || [];
      const topProducts = topProductsData.data?.products || [];
      const categoryDistribution = categoryData.data?.categories || [];
      const customerSegments = customerSegmentsData.data?.segments || [];
      const orderStatusDistribution = orderStatusData.data?.statuses || [];
      const customerRetention = customerRetentionData.data?.retention || { rate: 0, trend: 0, history: [] };
      const paymentMethods = paymentMethodsData.data?.methods || [];
      const salesByRegion = salesRegionData.data?.regions || [];
      
      // Calculate forecast from API sales data
      const forecast = generateSalesForecast(salesData, forecastPeriods);
      
      // Construct and return data from API
      return {
        stats,
        salesTrend: salesData,
        topProducts,
        categoryDistribution,
        customerSegments,
        revenueByCategory: categoryDistribution,
        orderStatusDistribution,
        customerRetention,
        productPerformance: topProducts.map(product => ({
          ...product,
          metrics: product.metrics || {
            sales: product.sales,
            revenue: product.revenue,
            rating: (4.0 + Math.random() * 1.0).toFixed(1),
            returns: Math.floor(product.sales * (0.02 + Math.random() * 0.03))
          }
        })),
        salesByRegion,
        paymentMethods,
        salesForecast: forecast,
        combinedSalesData: [...salesData, ...forecast],
        realTimeMetrics: dashboardOverview.data?.realTimeMetrics || {
          activeUsers: Math.floor(50 + Math.random() * 100),
          cartAbandonment: (15 + Math.random() * 10).toFixed(1) + '%',
          conversionRate: (3 + Math.random() * 2).toFixed(1) + '%',
          averageOrderValue: stats.totalOrders > 0 ? Math.floor(stats.totalRevenue / stats.totalOrders) : 100
        }
      };
    } catch (apiError) {
      console.warn("API analytics failed, falling back to local calculations:", apiError);
      // If API endpoints failed, proceed with local calculations below
    }
    
    // Fallback to local calculations if API failed
    // Load data from APIs in parallel
    const [orders, products, users] = await Promise.all([
      fetchOrdersData(timeRange, customDateRange),
      fetchProductsData(),
      fetchUsersData(timeRange, customDateRange)
    ]);
    
    // Calculate analytics from raw data
    const salesData = calculateSalesData(orders, timeRange);
    const topProducts = calculateTopProducts(orders, products);
    const categoryDistribution = calculateCategoryDistribution(orders, products);
    
    // Use calculated stats or fallback to fixed values
    const stats = calculateStats(salesData, users.length ? users : [1, 2, 3, 4, 5, 6, 7, 8], products.length ? products : Array(13).fill({}));
    
    // Calculate additional metrics
    const orderStatusCounts = { completed: 0, processing: 0, pending: 0, total: orders.length };
    
    orders.forEach(order => {
      const status = order.orderStatus?.toLowerCase() || 'unknown';
      if (status === 'delivered' || status === 'completed') {
        orderStatusCounts.completed += 1;
      } else if (status === 'processing' || status === 'shipped') {
        orderStatusCounts.processing += 1;
      } else if (status === 'pending' || status === 'created') {
        orderStatusCounts.pending += 1;
      }
    });
    
    // Calculate percentages
    const orderStatusDistribution = [
      { 
        status: "Completed", 
        count: orderStatusCounts.completed,
        percentage: orderStatusCounts.total ? (orderStatusCounts.completed / orderStatusCounts.total * 100).toFixed(1) : 0
      },
      { 
        status: "Processing", 
        count: orderStatusCounts.processing,
        percentage: orderStatusCounts.total ? (orderStatusCounts.processing / orderStatusCounts.total * 100).toFixed(1) : 0
      },
      { 
        status: "Pending", 
        count: orderStatusCounts.pending,
        percentage: orderStatusCounts.total ? (orderStatusCounts.pending / orderStatusCounts.total * 100).toFixed(1) : 0
      }
    ];
    
    // Calculate sales forecast
    const forecast = generateSalesForecast(salesData, forecastPeriods);
    
    // Return comprehensive analytics data
    return {
      stats: stats,
      salesTrend: salesData,
      topProducts: topProducts,
      categoryDistribution: categoryDistribution,
      orderStatusDistribution: orderStatusDistribution,
      customerSegments: [
        { segment: "Premium", count: Math.round(users.length * 0.2), revenue: Math.round(stats.totalRevenue * 0.6) },
        { segment: "Regular", count: Math.round(users.length * 0.5), revenue: Math.round(stats.totalRevenue * 0.3) },
        { segment: "New", count: Math.round(users.length * 0.3), revenue: Math.round(stats.totalRevenue * 0.1) }
      ],
      revenueByCategory: categoryDistribution,
      customerRetention: generateMockAnalyticsData().customerRetention,
      productPerformance: topProducts.map(product => ({
        ...product,
        metrics: {
          sales: product.sales,
          revenue: product.revenue,
          rating: (4.0 + Math.random() * 1.0).toFixed(1),
          returns: Math.floor(product.sales * (0.02 + Math.random() * 0.03))
        }
      })),
      salesByRegion: generateMockAnalyticsData().salesByRegion,
      paymentMethods: generateMockAnalyticsData().paymentMethods,
      realTimeMetrics: {
        activeUsers: Math.floor(50 + Math.random() * 100),
        cartAbandonment: (15 + Math.random() * 10).toFixed(1) + '%',
        conversionRate: (3 + Math.random() * 2).toFixed(1) + '%',
        averageOrderValue: stats.totalOrders > 0 ? Math.floor(stats.totalRevenue / stats.totalOrders) : 100
      },
      salesForecast: forecast,
      combinedSalesData: [...salesData, ...forecast]
    };
  } catch (error) {
    console.error("Error calculating analytics:", error);
    
    // Create full mock data as fallback
    try {
      const mockData = generateMockAnalyticsData(timeRange);
      const salesData = generateMockSalesData(timeRange);
      const forecast = generateSalesForecast(salesData, forecastPeriods);
      
      return {
        ...mockData,
        salesForecast: forecast,
        combinedSalesData: [...mockData.salesTrend, ...forecast]
      };
    } catch (mockError) {
      console.error("Error generating mock data:", mockError);
      
      // Ultra-basic fallback
      return {
        stats: {
          totalUsers: 8,
          totalOrders: 50,
          totalProducts: 13,
          totalRevenue: 25000,
          usersTrend: 5.2,
          ordersTrend: 8.7,
          productsTrend: 3.1,
          revenueTrend: 12.4
        },
        salesTrend: generateMockSalesData(timeRange),
        topProducts: [],
        categoryDistribution: [],
        orderStatusDistribution: [],
        customerSegments: [],
        revenueByCategory: [],
        productPerformance: [],
        salesByRegion: [],
        paymentMethods: [],
        realTimeMetrics: {
          activeUsers: 12,
          cartAbandonment: '18.5%',
          conversionRate: '4.2%',
          averageOrderValue: 500
        }
      };
    }
  }
};

/**
 * Export analytics data in various formats
 * @param {Object} data - Analytics data to export
 * @param {string} format - Export format ('csv', 'pdf', 'json') 
 * @returns {Blob|string|Object} Exported data in requested format
 */
export const exportAnalyticsData = (data, format = 'json') => {
  switch(format.toLowerCase()) {
    case 'csv':
      // Generate CSV string
      let csvContent = 'data:text/csv;charset=utf-8,';
      
      // Add stats section
      csvContent += 'Metric,Value,Trend\n';
      csvContent += `Users,${data.stats.totalUsers},${data.stats.usersTrend}%\n`;
      csvContent += `Orders,${data.stats.totalOrders},${data.stats.ordersTrend}%\n`;
      csvContent += `Products,${data.stats.totalProducts},${data.stats.productsTrend}%\n`;
      csvContent += `Revenue,${data.stats.totalRevenue},${data.stats.revenueTrend}%\n\n`;
      
      // Add sales data
      csvContent += 'Sales Trends\n';
      csvContent += 'Date,Revenue,Orders\n';
      data.salesTrend.forEach(item => {
        csvContent += `${item.date},${item.revenue},${item.orders}\n`;
      });
      
      // Encode and return
      return new Blob([csvContent], { type: 'text/csv' });
      
    case 'pdf':
      // In real implementation, would generate PDF
      // Return a placeholder object
      return { type: 'pdf', data: data };
      
    case 'json':
    default:
      return JSON.stringify(data, null, 2);
  }
};

/**
 * Generate sales forecast data based on historical trends
 * @param {Array} salesData - Historical sales data
 * @param {number} periods - Number of periods to forecast
 * @returns {Array} Forecasted sales data
 */
export const generateSalesForecast = (salesData = [], periods = 3) => {
  if (!salesData || salesData.length < 2) {
    // Not enough data for forecasting
    return [];
  }
  
  // Calculate average growth rate from historical data
  let totalGrowthRate = 0;
  let validPeriods = 0;
  
  for (let i = 1; i < salesData.length; i++) {
    const prevRevenue = salesData[i-1].revenue;
    const currentRevenue = salesData[i].revenue;
    
    if (prevRevenue > 0) {
      const growthRate = (currentRevenue - prevRevenue) / prevRevenue;
      totalGrowthRate += growthRate;
      validPeriods++;
    }
  }
  
  // Calculate average growth rate
  const avgGrowthRate = validPeriods > 0 ? totalGrowthRate / validPeriods : 0.05;
  
  // Apply some randomness to growth rate for realism
  const growthRateWithNoise = avgGrowthRate * (0.8 + Math.random() * 0.4);
  
  // Get the last data point as starting point
  const lastDataPoint = salesData[salesData.length - 1];
  const result = [];
  
  // Define date increment based on last two dates if possible
  let dateIncrement = 1; // Default day increment
  let dateFormat = null;
  
  if (salesData.length >= 2) {
    const lastDate = salesData[salesData.length - 1].date;
    const prevDate = salesData[salesData.length - 2].date;
    
    // Check if date is using Week format (e.g., "Week 1")
    if (lastDate.includes('Week')) {
      dateFormat = 'week';
      const lastWeekNum = parseInt(lastDate.replace('Week ', ''), 10);
      dateIncrement = lastWeekNum - parseInt(prevDate.replace('Week ', ''), 10);
    }
    // Check if date is a month name
    else if (isNaN(Date.parse(lastDate))) {
      dateFormat = 'month';
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      dateIncrement = 1; // Default to 1 month
    }
    // Check if date is a year
    else if (lastDate.length === 4 && !isNaN(parseInt(lastDate, 10))) {
      dateFormat = 'year';
      dateIncrement = parseInt(lastDate, 10) - parseInt(prevDate, 10);
    }
  }
  
  // Generate forecast data points
  let currentRevenue = lastDataPoint.revenue;
  let currentOrders = lastDataPoint.orders;
  
  for (let i = 1; i <= periods; i++) {
    // Apply growth rate with some randomness
    const randomFactor = 0.9 + Math.random() * 0.2;
    currentRevenue = currentRevenue * (1 + growthRateWithNoise * randomFactor);
    currentOrders = Math.round(currentOrders * (1 + growthRateWithNoise * randomFactor));
    
    // Generate next date based on format
    let nextDate;
    if (dateFormat === 'week') {
      const lastWeekNum = parseInt(lastDataPoint.date.replace('Week ', ''), 10);
      nextDate = `Week ${lastWeekNum + (i * dateIncrement)}`;
    }
    else if (dateFormat === 'month') {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const currentIndex = months.indexOf(lastDataPoint.date);
      const nextIndex = (currentIndex + (i * dateIncrement)) % 12;
      nextDate = months[nextIndex];
    }
    else if (dateFormat === 'year') {
      nextDate = (parseInt(lastDataPoint.date, 10) + (i * dateIncrement)).toString();
    }
    else {
      // Default to ISO date with day increment
      const date = new Date();
      date.setDate(date.getDate() + i);
      nextDate = date.toISOString().split('T')[0];
    }
    
    result.push({
      date: nextDate,
      revenue: Math.round(currentRevenue),
      orders: currentOrders,
      isForecast: true
    });
  }
  
  return result;
};

/**
 * Utility function to get date range for a specific timeframe
 * @param {string} timeRange - Predefined timeframe (daily, weekly, monthly, yearly, custom)
 * @param {Object} customDateRange - Optional custom date range {startDate, endDate}
 * @returns {Object} Date range object with startDate and endDate
 */
export const getDateRangeForTimeframe = (timeRange = 'weekly', customDateRange = null) => {
  let endDate = new Date();
  let startDate = new Date();
  
  switch(timeRange.toLowerCase()) {
    case 'today':
      // Just today
      startDate.setHours(0, 0, 0, 0);
      break;
      
    case 'yesterday':
      // Just yesterday
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(endDate.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
      break;
      
    case 'daily':
    case 'last24hours':
      // Last 24 hours
      startDate.setDate(startDate.getDate() - 1);
      break;
      
    case 'weekly':
    case 'last7days':
      // Last 7 days
      startDate.setDate(startDate.getDate() - 7);
      break;
      
    case 'last14days':
      // Last 14 days
      startDate.setDate(startDate.getDate() - 14);
      break;
      
    case 'last30days':
      // Last 30 days
      startDate.setDate(startDate.getDate() - 30);
      break;
      
    case 'monthly':
      // Last month
      startDate.setMonth(startDate.getMonth() - 1);
      break;
      
    case 'quarterly':
    case 'last3months':
      // Last 3 months
      startDate.setMonth(startDate.getMonth() - 3);
      break;
      
    case 'last6months':
      // Last 6 months
      startDate.setMonth(startDate.getMonth() - 6);
      break;
      
    case 'yearly':
    case 'last12months':
      // Last 12 months
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
      
    case 'thismonth':
      // Start of current month
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      break;
      
    case 'thisquarter':
      // Start of current quarter
      const currentMonth = startDate.getMonth();
      const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
      startDate.setMonth(quarterStartMonth);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      break;
      
    case 'thisyear':
      // Start of current year
      startDate.setMonth(0);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      break;
      
    case 'custom':
      // Use custom date range if available
      if (customDateRange && customDateRange.startDate && customDateRange.endDate) {
        // Ensure we're working with Date objects
        startDate = customDateRange.startDate instanceof Date ? 
          customDateRange.startDate : 
          new Date(customDateRange.startDate);
          
        UpdatedendDate = customDateRange.endDate instanceof Date ? 
          customDateRange.endDate : 
          new Date(customDateRange.endDate);
      } else {
        // Default to last 30 days if no custom range
        startDate.setDate(startDate.getDate() - 30);
      }
      break;
      
    default:
      // Default to last 7 days
      startDate.setDate(startDate.getDate() - 7);
  }
  
  return {
    startDate,
    endDate
  };
};

/**
 * Direct API utilities for analytics data retrieval
 * These functions use the API endpoints directly without local fallback calculations
 */
export const analyticsUtils = {
  /**
   * Get dashboard overview data from API
   * @param {string} timeRange - Time range for filtering data
   * @param {Object} customDateRange - Optional custom date range
   * @returns {Promise<Object>} Dashboard overview data
   */
  getDashboardOverview: async (timeRange = 'weekly', customDateRange = null) => {
    try {
      const { analyticsAPI } = await import('../services/api');
      
      const params = customDateRange ? { 
        startDate: customDateRange.startDate.toISOString(),
        endDate: customDateRange.endDate.toISOString()
      } : {};
      
      const response = await analyticsAPI.getDashboardOverview(timeRange, params);
      return response.data || {};
    } catch (error) {
      console.error("Failed to get dashboard overview:", error);
      // Return mock data as fallback
      return {
        stats: generateMockStats(timeRange),
        trends: generateMockSalesData(timeRange)
      };
    }
  },
  
  /**
   * Get product analytics from API
   * @param {string} timeRange - Time range for filtering data
   * @param {Object} customDateRange - Optional custom date range
   * @returns {Promise<Object>} Product analytics data
   */
  getProductAnalytics: async (timeRange = 'weekly', customDateRange = null) => {
    try {
      const { analyticsAPI } = await import('../services/api');
      
      const params = customDateRange ? { 
        startDate: customDateRange.startDate.toISOString(),
        endDate: customDateRange.endDate.toISOString()
      } : {};
      
      const [topProducts, categoryData] = await Promise.all([
        analyticsAPI.getTopProducts(timeRange, params),
        analyticsAPI.getCategoryDistribution(timeRange, params)
      ]);
      
      return {
        topProducts: topProducts.data?.products || [],
        categoryDistribution: categoryData.data?.categories || []
      };
    } catch (error) {
      console.error("Failed to get product analytics:", error);
      // Return mock data as fallback
      return {
        topProducts: generateMockTopProducts(timeRange),
        categoryDistribution: generateMockCategoryDistribution(timeRange)
      };
    }
  },
  
  /**
   * Get sales analytics from API
   * @param {string} timeRange - Time range for filtering data
   * @param {Object} customDateRange - Optional custom date range
   * @returns {Promise<Object>} Sales analytics data
   */
  getSalesAnalytics: async (timeRange = 'weekly', customDateRange = null) => {
    try {
      const { analyticsAPI } = await import('../services/api');
      
      const params = customDateRange ? { 
        startDate: customDateRange.startDate.toISOString(),
        endDate: customDateRange.endDate.toISOString()
      } : {};
      
      const [salesOverview, salesTrends, salesByCategory, salesByRegion] = await Promise.all([
        analyticsAPI.getSalesOverview(timeRange, params),
        analyticsAPI.getSalesTrends(timeRange, params),
        analyticsAPI.getSalesByCategory(timeRange, params),
        analyticsAPI.getSalesByRegion(timeRange, params)
      ]);
      
      // Generate forecast based on API data
      const trends = salesTrends.data?.trends || [];
      const forecast = generateSalesForecast(trends, 3);
      
      return {
        overview: salesOverview.data || {},
        trends: trends,
        forecast: forecast,
        combinedTrends: [...trends, ...forecast],
        byCategory: salesByCategory.data?.categories || [],
        byRegion: salesByRegion.data?.regions || []
      };
    } catch (error) {
      console.error("Failed to get sales analytics:", error);
      // Return mock data as fallback
      const salesData = generateMockSalesData(timeRange);
      const forecast = generateSalesForecast(salesData, 3);
      
      return {
        overview: { 
          totalSales: salesData.reduce((sum, item) => sum + item.revenue, 0),
          totalOrders: salesData.reduce((sum, item) => sum + item.orders, 0)
        },
        trends: salesData,
        forecast: forecast,
        combinedTrends: [...salesData, ...forecast],
        byCategory: generateMockCategoryDistribution(timeRange),
        byRegion: generateMockAnalyticsData(timeRange).salesByRegion
      };
    }
  },
  
  /**
   * Get customer analytics from API
   * @param {string} timeRange - Time range for filtering data
   * @param {Object} customDateRange - Optional custom date range
   * @returns {Promise<Object>} Customer analytics data
   */
  getCustomerAnalytics: async (timeRange = 'weekly', customDateRange = null) => {
    try {
      const { analyticsAPI } = await import('../services/api');
      
      const params = customDateRange ? { 
        startDate: customDateRange.startDate.toISOString(),
        endDate: customDateRange.endDate.toISOString()
      } : {};
      
      const [userAnalytics, customerSegments, customerRetention] = await Promise.all([
        analyticsAPI.getUserAnalytics(timeRange, params),
        analyticsAPI.getCustomerSegments(timeRange, params),
        analyticsAPI.getCustomerRetention(timeRange, params)
      ]);
      
      return {
        overview: userAnalytics.data || {},
        segments: customerSegments.data?.segments || [],
        retention: customerRetention.data?.retention || {}
      };
    } catch (error) {
      console.error("Failed to get customer analytics:", error);
      // Return mock data as fallback
      const mockData = generateMockAnalyticsData(timeRange);
      
      return {
        overview: { 
          totalUsers: 8,
          activeUsers: Math.round(8 * 0.7),
          newUsers: Math.round(8 * 0.2)
        },
        segments: mockData.customerSegments,
        retention: mockData.customerRetention
      };
    }
  },
  
  /**
   * Generate and download analytics report through API
   * @param {string} timeRange - Time range for report data
   * @param {string} format - Export format ('pdf', 'csv', 'excel')
   * @param {Object} customDateRange - Optional custom date range
   * @returns {Promise<Blob>} Report file as blob
   */
  generateReport: async (timeRange = 'weekly', format = 'pdf', customDateRange = null) => {
    try {
      const { analyticsAPI } = await import('../services/api');
      
      const params = customDateRange ? { 
        startDate: customDateRange.startDate.toISOString(),
        endDate: customDateRange.endDate.toISOString()
      } : {};
      
      const response = await analyticsAPI.generateReport(timeRange, format, params);
      return response.data;
    } catch (error) {
      console.error("Failed to generate analytics report:", error);
      // Fallback to local export
      const mockData = generateMockAnalyticsData(timeRange);
      return exportAnalyticsData(mockData, format);
    }
  },
  
  /**
   * Track user activity in analytics system
   * @param {string} actionType - Type of action being tracked
   * @param {Object} actionData - Data associated with the action
   * @returns {Promise<void>}
   */
  trackActivity: async (actionType, actionData = {}) => {
    try {
      const { analyticsAPI } = await import('../services/api');
      
      await analyticsAPI.trackUserActivity({
        type: actionType,
        timestamp: new Date().toISOString(),
        data: actionData
      });
    } catch (error) {
      console.error("Failed to track user activity:", error);
      // Just log the error, no fallback needed
    }
  }
};

/**
 * Real-time metrics data polling utility
 * This helps components set up and manage continuous polling of analytics data
 */
export const realTimeMetricsPoller = {
  pollingIntervals: {},

  /**
   * Start polling for real-time metrics
   * @param {string} componentId - Unique identifier for the component using this poller
   * @param {Function} callback - Function to call with updated metrics
   * @param {number} interval - Polling interval in milliseconds (default: 30000 ms)
   * @returns {Object} Control methods for the polling
   */
  startPolling: (componentId, callback, interval = 30000) => {
    // Clear any existing interval for this component
    if (realTimeMetricsPoller.pollingIntervals[componentId]) {
      clearInterval(realTimeMetricsPoller.pollingIntervals[componentId]);
    }

    // Function to fetch current metrics
    const fetchMetrics = async () => {
      try {
        const { analyticsAPI } = await import('../services/api');
        
        // Get real-time metrics from API
        const response = await analyticsAPI.getDashboardStats('daily');
        const realTimeMetrics = response.data?.realTimeMetrics || {
          activeUsers: Math.floor(50 + Math.random() * 100),
          cartAbandonment: (15 + Math.random() * 10).toFixed(1) + '%',
          conversionRate: (3 + Math.random() * 2).toFixed(1) + '%',
          averageOrderValue: Math.floor(100 + Math.random() * 50)
        };
        
        // Call the provided callback with the data
        callback(realTimeMetrics);
      } catch (error) {
        console.error("Failed to fetch real-time metrics:", error);
        // Call callback with mock data if API fails
        callback({
          activeUsers: Math.floor(50 + Math.random() * 100),
          cartAbandonment: (15 + Math.random() * 10).toFixed(1) + '%',
          conversionRate: (3 + Math.random() * 2).toFixed(1) + '%',
          averageOrderValue: Math.floor(100 + Math.random() * 50)
        });
      }
    };
    
    // Fetch immediately on start
    fetchMetrics();
    
    // Set up the interval
    realTimeMetricsPoller.pollingIntervals[componentId] = setInterval(fetchMetrics, interval);
    
    // Return control methods
    return {
      pause: () => {
        if (realTimeMetricsPoller.pollingIntervals[componentId]) {
          clearInterval(realTimeMetricsPoller.pollingIntervals[componentId]);
        }
      },
      resume: () => {
        if (!realTimeMetricsPoller.pollingIntervals[componentId]) {
          fetchMetrics();
          realTimeMetricsPoller.pollingIntervals[componentId] = setInterval(fetchMetrics, interval);
        }
      },
      updateInterval: (newInterval) => {
        if (realTimeMetricsPoller.pollingIntervals[componentId]) {
          clearInterval(realTimeMetricsPoller.pollingIntervals[componentId]);
          realTimeMetricsPoller.pollingIntervals[componentId] = setInterval(fetchMetrics, newInterval);
        }
      },
      getLatestMetrics: fetchMetrics
    };
  },
  
  /**
   * Stop polling for a specific component
   * @param {string} componentId - Component identifier to stop polling for
   */
  stopPolling: (componentId) => {
    if (realTimeMetricsPoller.pollingIntervals[componentId]) {
      clearInterval(realTimeMetricsPoller.pollingIntervals[componentId]);
      delete realTimeMetricsPoller.pollingIntervals[componentId];
    }
  },
  
  /**
   * Stop all polling intervals
   */
  stopAllPolling: () => {
    Object.keys(realTimeMetricsPoller.pollingIntervals).forEach(id => {
      clearInterval(realTimeMetricsPoller.pollingIntervals[id]);
    });
    
    realTimeMetricsPoller.pollingIntervals = {};
  }
};
