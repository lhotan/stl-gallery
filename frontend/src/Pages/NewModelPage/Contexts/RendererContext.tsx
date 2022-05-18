import { createFFmpeg } from "@ffmpeg/ffmpeg";
import {
	createContext,
	FC,
	ReactNode,
	useContext,
	useMemo,
	useRef,
	useState,
} from "react";

type ContextType = {
	onFrameDone: (data: string) => void;
	onRenderDone: () => void;
	renderThumbnails: () => Promise<RenderResolveData>;
	isRendering: boolean;
};

const RendererContext = createContext<ContextType>({
	onFrameDone: undefined,
	onRenderDone: undefined,
	renderThumbnails: undefined,
	isRendering: false,
});

type RendererContextProviderProps = {
	children: ReactNode;
};

type RenderResolveData = {
	thumbnail: Uint8Array;
	videoThumbnail: Uint8Array;
};

type RenderResolve = (data: RenderResolveData) => void;

const RendererContextProvider: FC<RendererContextProviderProps> = ({
	children,
}) => {
	const [frames, setFrames] = useState<string[]>([]);
	const [isRendering, setIsRendering] = useState(false);
	const renderDoneResolve = useRef<RenderResolve>();

	const ffmpeg = useMemo(() => createFFmpeg({ log: true }), []);

	const base64ToArrayBuffer = (base64: string) => {
		const binaryString = window.atob(base64);
		const length = binaryString.length;
		const bytes = new Uint8Array(length);
		for (var i = 0; i < length; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}
		return bytes;
	};

	const handleFrameDone = (data: string) => {
		setFrames((frames) => [...frames, data]);
	};

	const handleRenderDone = async () => {
		await ffmpeg.load();

		// Set doesn't filter unique uin8 values, but it does filter unique strings
		const uniqueFrames = Array.from(new Set(frames));

		uniqueFrames.forEach((frame, index) => {
			const uint8ArrayFrame = base64ToArrayBuffer(frame.substring(22));
			ffmpeg.FS(
				"writeFile",
				`${String(index).padStart(4, "0")}.png`,
				uint8ArrayFrame
			);
		});

		await ffmpeg.run(
			"-framerate",
			"30",
			"-pattern_type",
			"glob",
			"-i",
			"*.png",
			"-c:v",
			"libx264",
			"-crf",
			"15",
			"-pix_fmt",
			"yuv420p",
			"out.mp4"
		);

		const thumbnail = base64ToArrayBuffer(frames[0].substring(22));
		const videoThumbnail = ffmpeg.FS("readFile", "out.mp4");

		setIsRendering(false);
		renderDoneResolve.current({
			thumbnail,
			videoThumbnail,
		});
	};

	const handleRenderThumbnails = async () => {
		setIsRendering(true);
		return new Promise<RenderResolveData>((resolve) => {
			renderDoneResolve.current = resolve;
		});
	};

	return (
		<RendererContext.Provider
			value={{
				onFrameDone: handleFrameDone,
				onRenderDone: handleRenderDone,
				renderThumbnails: handleRenderThumbnails,
				isRendering,
			}}
		>
			{children}
		</RendererContext.Provider>
	);
};

const useRenderer = () => useContext(RendererContext);

export { RendererContextProvider, useRenderer };
