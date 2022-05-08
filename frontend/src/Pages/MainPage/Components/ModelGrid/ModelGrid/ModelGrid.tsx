import { debounce, reverse, times, uniqueId } from "lodash";
import { FC, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import styled, { css } from "styled-components";
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

	const handleItemClick = (identifier: string) => () => {
		if (identifier === openedDesignId) {
			setOpenedDesignId(undefined);
		} else {
			setOpenedDesignId(identifier);
		}
	};

	return (
		<StyledList ref={gridRef}>
			{!isResizing &&
				times(gridItemCount, (i) => {
					const item = data?.[i];

					if (!item) {
						return <div />;
					}

					const { id } = item;

					return (
						<AutoGridItem
							key={id}
							onClick={handleItemClick(id)}
							data={item}
							isOpen={openedDesignId === id}
						/>
					);
				})}
		</StyledList>
	);
};

export default ModelGrid;
