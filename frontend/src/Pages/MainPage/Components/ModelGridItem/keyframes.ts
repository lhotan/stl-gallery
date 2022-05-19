const getSlideKeyframes = ({
	itemCoordinates: { x, y },
	itemDimensions: { width, height },
	color,
}) => [
	{
		transform: `translate(${x}px, ${y}px)`,
		width: `${width}px`,
		height: `${height}px`,
		backgroundColor: "white",
	},
	{
		transform: "translate(0,0)",
	},
	{
		width: "100vw",
		height: "100%",
		backdropFilter: "blur(5px)",
	},
];

const getContentKeyframes = () => [
	{
		opacity: 0,
	},
	{
		opacity: 1,
	},
];

export { getSlideKeyframes, getContentKeyframes };
