type Props = {
  fillColor: string;
  titleText: string;
};

export const SVGTextTitle = ({ fillColor, titleText }: Props) => {
  return (
    <g>
      <rect
        x={`calc(30%-10px)`}
        y="90%"
        width="10px"
        height="10px"
        textAnchor="middle"
        dominantBaseline="central"
        fill={`${fillColor}`}
        rx={4}
        ry={4}
      />
      <text
        x="30%"
        y="90%"
        fontSize="10px"
        fontWeight={500}
        textAnchor="middle"
        dominantBaseline="central"
        fill={`var(--color-text-title)`}
      >
        {titleText}
      </text>
    </g>
  );
};
