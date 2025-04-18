import React, { memo, useMemo, Suspense } from "react";
import {
  Grid,
  Paper,
  Box,
  Typography,
  Skeleton,
  useTheme,
  alpha,
} from "@mui/material";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatCurrency } from "../../utils/formatters";

// Colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const ChartSkeleton = () => (
  <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <Paper sx={{ p: 1.5 }}>
      <Typography variant="subtitle2">{label}</Typography>
      {payload.map((entry, index) => (
        <Typography key={index} variant="body2" sx={{ color: entry.color }}>
          {entry.name}: {entry.value.toLocaleString()}
        </Typography>
      ))}
    </Paper>
  );
};

const DashboardCharts = memo(
  ({ salesData, categoryData, loading, timeRange }) => {
    const theme = useTheme();

    // Memoize chart configurations
    const salesChartConfig = useMemo(
      () => ({
        data: salesData || [],
        margin: { top: 5, right: 30, left: 20, bottom: 5 },
        lines: [
          {
            dataKey: "revenue",
            name: "Revenue",
            stroke: theme.palette.primary.main,
            type: "monotone",
          },
          {
            dataKey: "orders",
            name: "Orders",
            stroke: theme.palette.secondary.main,
            type: "monotone",
          },
        ],
      }),
      [salesData, theme]
    );

    const categoryChartConfig = useMemo(
      () => ({
        data: categoryData || [],
        innerRadius: "60%",
        outerRadius: "80%",
        paddingAngle: 2,
      }),
      [categoryData]
    );

    if (loading) {
      return (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <ChartSkeleton />
          </Grid>
          <Grid item xs={12} md={4}>
            <ChartSkeleton />
          </Grid>
        </Grid>
      );
    }

    return (
      <Grid container spacing={3}>
        {/* Sales Trend Chart */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 3,
              height: "400px",
              borderRadius: 2,
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: "blur(10px)",
            }}
            elevation={0}
          >
            <Typography variant="h6" gutterBottom>
              Sales & Orders Trend
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={salesChartConfig.data}
                margin={salesChartConfig.margin}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={theme.palette.divider}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: theme.palette.text.secondary }}
                  stroke={theme.palette.divider}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: theme.palette.text.secondary }}
                  stroke={theme.palette.divider}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: theme.palette.text.secondary }}
                  stroke={theme.palette.divider}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {salesChartConfig.lines.map((line, index) => (
                  <Line
                    key={line.dataKey}
                    type={line.type}
                    dataKey={line.dataKey}
                    name={line.name}
                    stroke={line.stroke}
                    yAxisId={index === 0 ? "left" : "right"}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Category Distribution Chart */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              height: "400px",
              borderRadius: 2,
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: "blur(10px)",
            }}
            elevation={0}
          >
            <Typography variant="h6" gutterBottom>
              Category Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartConfig.data}
                  innerRadius={categoryChartConfig.innerRadius}
                  outerRadius={categoryChartConfig.outerRadius}
                  paddingAngle={categoryChartConfig.paddingAngle}
                  dataKey="value"
                  nameKey="name"
                >
                  {categoryChartConfig.data.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => value.toLocaleString()}
                  content={<CustomTooltip />}
                />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    );
  }
);

DashboardCharts.displayName = "DashboardCharts";

export default DashboardCharts;
