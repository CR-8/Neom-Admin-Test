import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, Typography, Box, CircularProgress } from "@mui/material";
import { useSnackbar } from "notistack";

const ChartComponent = ({
  type = "line",
  data = [],
  title,
  xKey = "name",
  series = [],
  height = 300,
  colors = ["#2196f3", "#4caf50", "#f44336", "#ff9800"],
  apiEndpoint,
  timeRange = "weekly",
  transformData,
}) => {
  const [chartData, setChartData] = useState(data);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchData = async () => {
      if (!apiEndpoint) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams();
        params.append('period', timeRange);
        
        const response = await fetch(`${apiEndpoint}?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const transformedData = transformData ? transformData(result.data) : result.data;
        setChartData(transformedData);
      } catch (error) {
        console.error('Error fetching chart data:', error);
        setError(error.message);
        enqueueSnackbar('Failed to fetch chart data', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiEndpoint, timeRange, transformData, enqueueSnackbar]);

  const renderChart = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error || !chartData?.length) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Typography color="error">
            {error || 'No data available'}
          </Typography>
        </Box>
      );
    }

    switch (type) {
      case "line":
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {series.map((item, index) => (
              <Line
                key={item.dataKey}
                type="monotone"
                dataKey={item.dataKey}
                name={item.name}
                stroke={colors[index % colors.length]}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
            ))}
          </LineChart>
        );

      case "bar":
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {series.map((item, index) => (
              <Bar
                key={item.dataKey}
                dataKey={item.dataKey}
                name={item.name}
                fill={colors[index % colors.length]}
              />
            ))}
          </BarChart>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent>
        {title && (
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
        )}
        <Box sx={{ width: "100%", height }}>
          <ResponsiveContainer>{renderChart()}</ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ChartComponent;
