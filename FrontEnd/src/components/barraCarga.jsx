// src/components/ProgressCircle.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

/**
 * Componente circular con etiqueta de porcentaje al centro.
 */
function CircularProgressWithLabel({ value, size = 60, color = 'primary' }) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        variant="determinate"
        value={value}
        size={size}
        color={color}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }}>
          {`${Math.round(value)}%`}
        </Typography>
      </Box>
    </Box>
  );
}

CircularProgressWithLabel.propTypes = {
  value: PropTypes.number.isRequired,
  size: PropTypes.number,
  color: PropTypes.string,
};

/**
 * Componente con animación automática de progreso (loop)
 */
export default function ProgressCircle({ size = 60, color = 'primary', speed = 800, step = 10 }) {
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + step));
    }, speed);
    return () => clearInterval(timer);
  }, [speed, step]);

  return <CircularProgressWithLabel value={progress} size={size} color={color} />;
}

ProgressCircle.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
  speed: PropTypes.number,
  step: PropTypes.number,
};
