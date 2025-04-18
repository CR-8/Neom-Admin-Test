import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  position: "relative",
  "&:hover": {
    boxShadow: theme.shadows[4],
    transform: "translateY(-4px)",
    transition: "all 0.3s",
  },
}));

const StatCard = ({
  title,
  value,
  icon: Icon,
  color = "primary",
  loading = false,
  trend,
  trendLabel,
}) => {
  return (
    <StyledCard>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          {Icon && (
            <Box
              sx={{
                backgroundColor: `${color}.light`,
                borderRadius: 1,
                p: 1,
                mr: 2,
              }}
            >
              <Icon color={color} />
            </Box>
          )}
          <Typography variant="h6" color="textSecondary">
            {title}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "baseline" }}>
          {loading ? (
            <CircularProgress size={20} />
          ) : (
            <>
              <Typography variant="h4" component="div">
                {value}
              </Typography>
              {trend && (
                <Typography
                  variant="body2"
                  sx={{
                    ml: 1,
                    color: trend >= 0 ? "success.main" : "error.main",
                  }}
                >
                  {trend > 0 ? "+" : ""}
                  {trend}%
                  {trendLabel && (
                    <Typography
                      component="span"
                      variant="caption"
                      color="textSecondary"
                      sx={{ ml: 0.5 }}
                    >
                      {trendLabel}
                    </Typography>
                  )}
                </Typography>
              )}
            </>
          )}
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default StatCard;
