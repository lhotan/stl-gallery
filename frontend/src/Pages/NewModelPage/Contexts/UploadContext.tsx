import FileSaver from "file-saver";
import { createContext, useContext, useState } from "react";
import { BufferGeometry } from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { useRenderer } from "./RendererContext";

type ContextType = {
	model: BufferGeometry;
	uploadModel: () => void;
	prepareCanvas: boolean;
	onCanvasReady: () => void;
	renderModel: () => void;
	color: number;
	setColor: (color: number) => void;
};

const UploadContext = createContext<ContextType>({
	model: undefined,
	uploadModel: undefined,
	onCanvasReady: undefined,
	prepareCanvas: undefined,
	renderModel: undefined,
	color: undefined,
	setColor: undefined,
});

const UploadContextProvider = ({ children }) => {
	const [thumbnail, setThumbnail] = useState<Uint8Array>();
	const [videoThumbnail, setVideoThumbnail] = useState<Uint8Array>();
	const [title, setTitle] = useState<string>();
	const [color, setColor] = useState<number>();
	const [model, setModel] = useState<BufferGeometry>();
	const [prepareCanvas, setPrepareCanvas] = useState(false);

	const { renderThumbnails } = useRenderer();

	const handleModelUpload = () => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".stl";

		input.onchange = (event: any) => {
			const file = event.target.files[0];
			const loader = new STLLoader();
			const filePath = URL.createObjectURL(file);

			loader.load(filePath, (model) => {
				setModel(model);
			});
		};

		input.click();
	};

	const handleVideoThumbnailRender = async () => {
		const { thumbnail, videoThumbnail } = await renderThumbnails();

		console.log(thumbnail, videoThumbnail);
		//FileSaver.saveAs(new Blob([videoThumbnail.buffer]), "new-thumbnail.mp4");

		setThumbnail(thumbnail);
		setVideoThumbnail(videoThumbnail);
		setPrepareCanvas(false);
	};

	const handleCanvasReady = () => {
		handleVideoThumbnailRender();
	};

	const handleModelRender = () => {
		setPrepareCanvas(true);
	};

	return (
		<UploadContext.Provider
			value={{
				model,
				uploadModel: handleModelUpload,
				onCanvasReady: handleCanvasReady,
				renderModel: handleModelRender,
				prepareCanvas,
				color,
				setColor,
			}}
		>
			{children}
		</UploadContext.Provider>
	);
};

const useUpload = () => useContext(UploadContext);

export { UploadContextProvider, useUpload };
