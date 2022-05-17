import { useEffect, useMemo, useRef, useState } from "react";
import { GithubPicker } from "react-color";
import styled, { css } from "styled-components";
import { UploadModelView } from "./StudioPage";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import FileSaver from "file-saver";

const StyledMain = styled.main<{ $isRendering }>`
	width: 95%;
	justify-self: center;
	display: grid;
	position: relative;

	padding-top: 1rem;
	grid-template-rows: 1fr;
	grid-template-columns: minmax(200px, 800px) auto;
	gap: 1rem;

	${({ $isRendering }) =>
		$isRendering &&
		css`
			width: 100%;
			overflow: hidden;
		`}
`;

const RenderCover = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: white;

	display: grid;
	justify-content: center;
	align-items: center;

	z-index: 999;
`;

export const NewItemPage = () => {
	const iframeRef = useRef<HTMLIFrameElement>();
	const [isRendering, setIsRendering] = useState(false);
	const [color, setColor] = useState<number>();
	const [frames, setFrames] = useState<string[]>([]);

	const ffmpeg = useMemo(() => createFFmpeg({ log: true }), []);

	/* 	useEffect(() => {
		if (iframeRef.current) {
			//@ts-ignore
			iframeRef.current.contentWindow.postMessage("hello", "*");
		}
	}, [iframeRef?.current]);

	useEffect(() => {
		//@ts-ignore
		if (iframeRef.current.contentWindow.STUDIO_SET_COLOR) {
			//@ts-ignore
			iframeRef.current.contentWindow.STUDIO_SET_COLOR(color);
		}
	}, [color, iframeRef?.current]); */

	const handleVideoThumbnailRender = () => {
		setIsRendering(true);
		setFrames([]);
	};

	const handleFrameDone = (data: string) => {
		setFrames((frames) => [...frames, data]);
	};

	const handleRenderDone = async () => {
		setIsRendering(false);

		await ffmpeg.load();

		const encoder = new TextEncoder();
		console.log(frames[0]);

		function base64ToArrayBuffer(base64) {
			var binary_string = window.atob(base64);
			var len = binary_string.length;
			var bytes = new Uint8Array(len);
			for (var i = 0; i < len; i++) {
				bytes[i] = binary_string.charCodeAt(i);
			}
			return bytes.buffer;
		}

		const v = base64ToArrayBuffer(frames[0].substring(22));

		FileSaver.saveAs(new Blob([v]), "thumbnail.png");

		await Promise.all(
			Array.from(new Set(frames)).map(async (frame, index) => {
				ffmpeg.FS(
					"writeFile",
					`${String(index).padStart(4, "0")}.png`,
					new Uint8Array(base64ToArrayBuffer(frame.substring(22)))
				);
			})
		);

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

		const thumbnail = ffmpeg.FS("readFile", "out.mp4");
		console.log(thumbnail);

		FileSaver.saveAs(new Blob([thumbnail.buffer]), "thumbnail.mp4");
	};

	return (
		<StyledMain $isRendering={isRendering}>
			{isRendering && <RenderCover>Render in progress...</RenderCover>}
			<UploadModelView
				isRendering={isRendering}
				color={color}
				onFrameDone={handleFrameDone}
				onRenderDone={handleRenderDone}
			/>
			{/* 		<StyledIframe
				title="Studio page"
				src="/studio"
				ref={iframeRef}
				$isRendering={isRendering}
			/> */}
			{frames?.[0] && <img src={frames[0]} />}

			<aside>
				<label>Name: </label>
				<input></input>
				<GithubPicker
					triangle="hide"
					colors={[
						"#B80000",
						"#DB3E00",
						"#FCCB00",
						"#008B02",
						"#006B76",
						"#1273DE",
						"#004DCF",
						"#5300EB",
						"#EB9694",
						"#FAD0C3",
						"#FEF3BD",
						"#C1E1C5",
						"#BEDADC",
						"#C4DEF6",
						"#BED3F3",
						"#D4C4FB",
					]}
					onChangeComplete={({ hex }) =>
						setColor(parseInt(hex.replace("#", "0x")))
					}
				/>
				<button
					//@ts-ignore
					onClick={() => iframeRef.current.contentWindow.STUDIO_UPLOAD_MODEL()}
				>
					Upload model
				</button>
				<button
					//@ts-ignore
					onClick={handleVideoThumbnailRender}
				>
					Render model
				</button>
			</aside>
		</StyledMain>
	);
};
