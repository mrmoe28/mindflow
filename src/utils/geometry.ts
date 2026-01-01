export interface Position {
  x: number;
  y: number;
}

export interface NodeGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Calculates the intersection point between a line segment (from center to target)
 * and the rectangular boundary of a node.
 */
function getNodeIntersection(node: NodeGeometry, targetPoint: Position): Position {
  const { width: w, height: h, x, y } = node;

  const cx = x + w / 2;
  const cy = y + h / 2;

  const dx = targetPoint.x - cx;
  const dy = targetPoint.y - cy;

  if (dx === 0 && dy === 0) return { x: cx, y: cy };

  const slope = dy / dx;
  const absSlope = Math.abs(slope);
  const rectSlope = h / w;

  let ix, iy;

  // Check if the line intersects the vertical sides (left/right) or horizontal sides (top/bottom)
  // based on the slope comparison.
  if (absSlope <= rectSlope) {
    // Intersects Left or Right side
    ix = dx > 0 ? w / 2 : -w / 2;
    iy = ix * slope;
  } else {
    // Intersects Top or Bottom side
    iy = dy > 0 ? h / 2 : -h / 2;
    ix = iy / slope;
  }

  return { x: cx + ix, y: cy + iy };
}

/**
 * Determines the optimal start and end points for an edge connecting two nodes.
 * The connection points are calculated to be the intersection of the line 
 * connecting the two node centers with the respective node borders.
 */
export function calculateDynamicConnection(source: NodeGeometry, target: NodeGeometry) {
  const sourceCenter = {
    x: source.x + source.width / 2,
    y: source.y + source.height / 2,
  };

  const targetCenter = {
    x: target.x + target.width / 2,
    y: target.y + target.height / 2,
  };

  // Calculate intersection on Source Node (ray from Source Center to Target Center)
  const start = getNodeIntersection(source, targetCenter);

  // Calculate intersection on Target Node (ray from Target Center to Source Center)
  const end = getNodeIntersection(target, sourceCenter);

  return { start, end };
}