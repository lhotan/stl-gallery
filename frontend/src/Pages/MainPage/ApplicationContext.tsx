import {
	createContext,
	FC,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { createPortal } from "react-dom";
import { ModelWindow } from "./Components/ModelWindow";

type GalleryItem = {
	id: string;
	title: string;
	thumbnail: string;
	color: string;
};

type ShowModelWindowArgs = {
	itemElement: HTMLLIElement;
	item: GalleryItem;
};

type ContextType = {
	showModelWindow: (args: ShowModelWindowArgs) => Promise<void>;
	openedItem: GalleryItem;
	galleryItems: GalleryItem[];
};

const ApplicationContext = createContext<ContextType>({
	showModelWindow: undefined,
	openedItem: undefined,
	galleryItems: [],
});

const ApplicationContextProvider: FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [openedItem, setOpenedItem] = useState<GalleryItem>();

	const [openedItemCoordinates, setOpenedItemCoordinates] = useState<{
		x: number;
		y: number;
	}>({ x: 0, y: 0 });

	const [openedItemDimensions, setOpenedItemDimensions] = useState<{
		width: number;
		height: number;
	}>({ width: 0, height: 0 });

	const [galleryItems, setGalleryItems] = useState<GalleryItem[] | undefined>();

	useEffect(() => {
		fetch("http://localhost:8080/models").then((res) =>
			res.json().then((data) => setGalleryItems(data))
		);
	}, []);

	const handleWindowShow = ({ itemElement, item }: ShowModelWindowArgs) =>
		new Promise<void>((resolve) => {
			const { x, y, width, height } = itemElement.getBoundingClientRect();
			setOpenedItemCoordinates({ x, y });
			setOpenedItemDimensions({ width, height });
			setOpenedItem(item);
		});

	const handleWindowClose = () => {
		setOpenedItem(undefined);
	};

	return (
		<ApplicationContext.Provider
			value={{
				showModelWindow: handleWindowShow,
				openedItem,
				galleryItems,
			}}
		>
			{children}
			{Boolean(openedItem) &&
				createPortal(
					<ModelWindow
						onWindowClose={handleWindowClose}
						itemCoordinates={openedItemCoordinates}
						itemDimensions={openedItemDimensions}
					/>,
					document.querySelector("#portal")
				)}
		</ApplicationContext.Provider>
	);
};

const useApplicationContext = () => useContext(ApplicationContext);

export { ApplicationContextProvider, useApplicationContext };
