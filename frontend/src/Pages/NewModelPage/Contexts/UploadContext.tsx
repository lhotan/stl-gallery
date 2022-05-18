import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { BufferGeometry } from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { BACKEND_URL } from "../../../config";
import { useRenderer } from "./RendererContext";

type UploadStage =
	| "none"
	| "resize-canvas"
	| "render-video"
	| "done-rendering"
	| "uploading"
	| "done-uploading";

type ContextType = {
	model: BufferGeometry;
	uploadModel: () => void;
	prepareCanvas: boolean;
	onCanvasReady: () => void;
	renderModel: () => void;
	color: number;
	setColor: (color: number) => void;
	title: string;
	setTitle: (title: string) => void;
	uploadStage: UploadStage;
};

const UploadContext = createContext<ContextType>({
	model: undefined,
	uploadModel: undefined,
	onCanvasReady: undefined,
	prepareCanvas: undefined,
	renderModel: undefined,
	color: undefined,
	setColor: undefined,
	title: undefined,
	setTitle: undefined,
	uploadStage: undefined,
});

type FetchBody = {
	title: string;
	color: string;
	model: ArrayBuffer;
	thumbnail: Uint8Array;
	videoThumbnail: Uint8Array;
};

const UploadContextProvider = ({ children }) => {
	const [stage, setStage] = useState<UploadStage>("none");
	const [thumbnail, setThumbnail] = useState<Uint8Array>();
	const [videoThumbnail, setVideoThumbnail] = useState<Uint8Array>();
	const [title, setTitle] = useState<string>();
	const [color, setColor] = useState<number>(0xffffff);
	const [model, setModel] = useState<BufferGeometry>();
	const [stlFile, setStlFile] = useState<ArrayBuffer>();
	const [prepareCanvas, setPrepareCanvas] = useState(false);

	const { renderThumbnails } = useRenderer();

	const handleModelUpload = () => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".stl";

		input.onchange = (event: Event) => {
			const file = (event.target as HTMLInputElement).files[0];

			file.arrayBuffer().then((fileArray) => setStlFile(fileArray));

			const loader = new STLLoader();
			const filePath = URL.createObjectURL(file);

			loader.load(filePath, (model) => {
				setModel(model);
			});
		};

		input.click();
	};

	const handleVideoThumbnailRender = async () => {
		setStage("render-video");
		const { thumbnail, videoThumbnail } = await renderThumbnails();

		console.log(thumbnail, videoThumbnail);

		setStage("done-rendering");

		await uploadModel(thumbnail, videoThumbnail);

		setStage("done-uploading");
	};

	const uploadModel = useCallback(
		(thumbnail: Uint8Array, videoThumbnail: Uint8Array) => {
			setStage("uploading");

			const formData = new FormData();
			formData.append("title", title);
			formData.append("color", color.toString(16));
			formData.append("model", new Blob([stlFile]));
			formData.append("thumbnail", new Blob([thumbnail]));
			formData.append("videoThumbnail", new Blob([videoThumbnail]));

			return fetch(`${BACKEND_URL}/model`, {
				method: "POST",
				headers: {},
				body: formData,
			});
		},
		[title, color, stlFile]
	);

	const handleCanvasReady = () => {
		handleVideoThumbnailRender();
	};

	const handleModelRender = () => {
		setStage("resize-canvas");
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
				title,
				setTitle: setTitle,
				uploadStage: stage,
			}}
		>
			{children}
		</UploadContext.Provider>
	);
};

const useUpload = () => useContext(UploadContext);

export { UploadContextProvider, useUpload };
