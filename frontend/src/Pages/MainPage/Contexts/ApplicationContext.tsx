import {
	createContext,
	FC,
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { createPortal } from "react-dom";
import { BACKEND_URL } from "../../../config";
import { ModelWindow } from "../Components/ModelWindow";

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
	loadGalleryItems: () => Promise<void>;
	openedItem: GalleryItem;
	galleryItems: GalleryItem[];
};

const ApplicationContext = createContext<ContextType>({
	showModelWindow: undefined,
	openedItem: undefined,
	galleryItems: [],
	loadGalleryItems: undefined,
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
	const loadItems = useCallback(async () => {
		const res = await fetch(`${BACKEND_URL}/models`);
		const items = (await res.json()) as GalleryItem[];
		console.log(items);
		setGalleryItems(() => items);
	}, []);

	useEffect(() => {
		loadItems();
		// eslint-disable-next-line react-hooks/exhaustive-deps
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
				loadGalleryItems: loadItems,
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
