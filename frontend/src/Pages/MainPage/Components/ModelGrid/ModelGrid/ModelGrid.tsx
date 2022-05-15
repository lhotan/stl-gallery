import { debounce, times } from "lodash";
import { useEffect, useMemo, useRef, useState } from "react";
import { useApplicationContext } from "../../../ApplicationContext";
import { ModelGridItem } from "../ModelGridItem";
import { StyledList } from "./styled";

export const ModelGrid = () => {
	const gridRef = useRef<HTMLUListElement | undefined>();
	const [gridItemCount, setGridItemCount] = useState(0);

	const [isResizing, setIsResizing] = useState(false);

	const { galleryItems } = useApplicationContext();

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
				const item = galleryItems?.[i];
				if (!item) {
					return <div key={`${i}`} />;
				}

				const { id } = item;

				return <ModelGridItem key={id} data={item} />;
			}),
		[gridItemCount, galleryItems]
	);

	return <StyledList ref={gridRef}>{!isResizing && gridItems}</StyledList>;
};

export default ModelGrid;
