import React, { memo } from 'react';
import {
  Card,
  Box,
  Typography,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

const StatsCard = memo(({ 
  title, 
  value, 
  icon: Icon, 
  color = 'primary', 
  percentChange = 0,
  period
}) => {
  const theme = useTheme();
  const isPositive = percentChange >= 0;

  return (
    <Card
      sx={{
        p: 3,
        height: '100%',
        borderRadius: 2,
        background: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(10px)',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8]
        }
      }}
      elevation={0}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: alpha(color, 0.1),
            color: color,
          }}
        >
          {Icon}
        </Box>
        <Chip
          icon={isPositive ? <TrendingUp /> : <TrendingDown />}
          label={`${isPositive ? '+' : ''}${percentChange.toFixed(1)}%`}
          color={isPositive ? 'success' : 'error'}
          size="small"
          sx={{ 
            fontWeight: 'medium',
            '& .MuiChip-label': {
              px: 1
            }
          }}
        />
      </Box>
      
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 1,
          fontWeight: 'bold',
          backgroundImage: `linear-gradient(45deg, ${color}, ${theme.palette.primary.main})`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: `0 2px 4px ${alpha(color, 0.2)}`
        }}
      >
        {value}
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography 
          variant="subtitle1" 
          color="text.primary"
          fontWeight="medium"
        >
          {title}
        </Typography>
        {period && (
          <Typography 
            variant="caption" 
            color="text.secondary"
          >
            {period}
          </Typography>
        )}
      </Box>
    </Card>
  );
});

StatsCard.displayName = 'StatsCard';

export default StatsCard;