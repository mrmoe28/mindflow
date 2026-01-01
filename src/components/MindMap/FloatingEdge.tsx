import { EdgeProps, getSmoothStepPath, BaseEdge } from 'reactflow';

const FloatingEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  interactionWidth = 20,
}: EdgeProps) => {
  // We use a significant offset (30px) to create a "trunk" coming out of the node
  // before the line splits to different targets. This creates the branching effect
  // when multiple edges originate from the same handle.
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 24, // Increased border radius for smoother, more modern turns
    offset: 30,       // This creates the shared "stem" coming out of the source
  });

  return (
    <BaseEdge 
      path={edgePath} 
      markerEnd={markerEnd} 
      style={style} 
      id={id}
      interactionWidth={interactionWidth}
    />
  );
};

export default FloatingEdge;