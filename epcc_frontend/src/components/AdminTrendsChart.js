import React from "react";

/**
 * Simple SVG Bar Chart - expects {labels:[], values:[], colors:[]} as props.
 * Example: <BarChart labels={["Pending","Approved"]} values={[5,7]} />
 */

// PUBLIC_INTERFACE
export function BarChart({ labels, values, colors, height = 110, width = 310 }) {
  // Defensive: avoid div0 and empty
  const max = Math.max(1, ...values);
  const barW = Math.max(23, Math.floor((width - 30) / values.length) - 9);
  return (
    <svg width={width} height={height} style={{ background: "#fff" }}>
      {values.map((v, i) => {
        const h = Math.round((v / max) * (height - 50));
        return (
          <g key={labels[i] || i}>
            <rect
              x={25 + i * (barW + 9)}
              y={height - h - 26}
              width={barW}
              height={h}
              fill={colors?.[i] || "#1976d2"}
              rx={4}
            />
            <text
              x={25 + i * (barW + 9) + barW / 2}
              y={height - 9}
              fontSize="12"
              fill="#1e2a38"
              textAnchor="middle"
            >
              {(labels[i] || "").substring(0, 9)}
            </text>
            <text
              x={25 + i * (barW + 9) + barW / 2}
              y={height - h - 33}
              fontSize="13"
              fill="#1e2a38"
              textAnchor="middle"
              fontWeight="bold"
            >
              {v}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/**
 * Simple SVG Pie Chart - expects labels, values, colors.
 * Example: <PieChart labels={["Pending","Approved"]} values={[5,5]} />
 */
// PUBLIC_INTERFACE
export function PieChart({ labels, values, colors, radius = 44 }) {
  const total = Math.max(1, values.reduce((a, b) => a + b, 0));
  let acc = 0;
  const cx = radius + 8;
  const cy = radius + 8;
  const strokeW = 24;
  return (
    <svg width={2 * (radius + 8)} height={2 * (radius + 8)} style={{ background: "#fff" }}>
      {values.map((v, i) => {
        const startAngle = (acc / total) * 2 * Math.PI;
        acc += v;
        const endAngle = (acc / total) * 2 * Math.PI;
        const x1 = cx + radius * Math.sin(startAngle);
        const y1 = cy - radius * Math.cos(startAngle);
        const x2 = cx + radius * Math.sin(endAngle);
        const y2 = cy - radius * Math.cos(endAngle);
        const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
        const path = [
          `M${cx},${cy}`,
          `L${x1},${y1}`,
          `A${radius},${radius} 0 ${largeArc},1 ${x2},${y2}`,
          "Z",
        ].join(" ");
        return (
          <path key={labels[i] || i} d={path} fill={colors?.[i] || "#1976d2"} opacity={0.92} />
        );
      })}
      {/* Center text (total) */}
      <text
        x={cx}
        y={cy + 6}
        fontSize="18"
        fill="#1E2A38"
        textAnchor="middle"
        fontWeight="bold"
      >
        {total}
      </text>
    </svg>
  );
}
