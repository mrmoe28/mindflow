import { ConnectionLineComponentProps, getSmoothStepPath } from 'reactflow';

const CustomConnectionLine = ({
  fromX,
  fromY,
  fromPosition,
  toX,
  toY,
  toPosition,
  connectionLineStyle,
}: ConnectionLineComponentProps) => {
  const [edgePath] = getSmoothStepPath({
    sourceX: fromX,
    sourceY: fromY,
    sourcePosition: fromPosition,
    targetX: toX,
    targetY: toY,
    targetPosition: toPosition,
    borderRadius: 24,
    offset: 30, // Match the edge offset to prevent visual jumping on release
  });

  return (
    <g>
      <path
        fill="none"
        strokeWidth={2.5}
        stroke="#6366f1"
        d={edgePath}
        style={connectionLineStyle}
      />
      <circle 
        cx={toX} 
        cy={toY} 
        fill="#fff" 
        r={4} 
        stroke="#6366f1" 
        strokeWidth={2} 
      />
    </g>
  );
};

export default CustomConnectionLine;