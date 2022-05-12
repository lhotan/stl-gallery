import { debounce, times } from "lodash";
import { useEffect, useMemo, useRef, useState } from "react";
import { ModelGridItem } from "../ModelGridItem";
import { StyledList } from "./styled";

type GalleryItem = {
	id: string;
	title: string;
	thumbnail: string;
	color: string;
};

export const ModelGrid = () => {
	const gridRef = useRef<HTMLUListElement | undefined>();
	const [gridItemCount, setGridItemCount] = useState(0);
	const [openedDesignId, setOpenedDesignId] = useState<string>();

	const [isResizing, setIsResizing] = useState(false);
	const [data, setData] = useState<GalleryItem[]>([]);

	useEffect(() => {
		fetch("http://localhost:4444/models").then((res) =>
			res.json().then((data) => setData(data))
		);
	}, []);

	useEffect(() => {
		if (gridRef.current) {
			const gridResizeObserver = new ResizeObserver(() => {
				setIsResizing(true);
				handleGridResize(gridRef.current as HTMLUListElement);
			});

			const root = document.querySelector("#root");

			if (root) {
				gridResizeObserver.observe(root);
			}

			return () => {
				gridResizeObserver.disconnect();
			};
		}
	}, [gridRef.current]);

	const handleGridResize = debounce((grid: HTMLUListElement) => {
		const gridComputedStyle = window.getComputedStyle(grid);

		const gridRowCount = gridComputedStyle
			.getPropertyValue("grid-template-rows")
			.split(" ").length;
		const gridColumnCount = gridComputedStyle
			.getPropertyValue("grid-template-columns")
			.split(" ").length;

		// subtract 3 items to make big tile fit
		const gridItemCount = gridRowCount * gridColumnCount - 3;
		setGridItemCount(gridItemCount);
		setIsResizing(false);
	}, 250);

	const gridItems = useMemo(
		() =>
			times(gridItemCount, (i) => {
				const item = data?.[i];
				if (!item) {
					return <div key={`${i}`} />;
				}

				const { id } = item;

				return <ModelGridItem key={id} data={item} />;
			}),
		[gridItemCount]
	);

	return <StyledList ref={gridRef}>{!isResizing && gridItems}</StyledList>;
};

export default ModelGrid;
