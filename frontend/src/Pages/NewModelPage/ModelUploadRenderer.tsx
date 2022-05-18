import { Bounds, Center } from "@react-three/drei";
import { Canvas, render, useThree } from "@react-three/fiber";
import {
	FC,
	Suspense,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import styled, { css } from "styled-components";
import {
	BufferGeometry,
	Color,
	Mesh,
	PerspectiveCamera,
	Scene,
	WebGLRenderer,
} from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { useRenderer } from "./Contexts/RendererContext";
import { useUpload } from "./Contexts";

type CameraControllerProps = {
	isRendering: boolean;
	onFrameDone: (data: string) => void;
	onRenderDone: () => void;
};

const CameraController: FC<CameraControllerProps> = ({
	onFrameDone,
	isRendering,
	onRenderDone,
}) => {
	const { camera, gl } = useThree();
	const [originalCameraAngle, setOriginalCameraAngle] = useState<number>();
	const [frames, setFrames] = useState<number>(0);

	const controls = useMemo(
		() => new OrbitControls(camera, gl.domElement),
		[camera, gl]
	);

	useEffect(() => {
		if (originalCameraAngle === undefined) {
			setOriginalCameraAngle(() => controls.getAzimuthalAngle());
		}

		controls.enablePan = false;
		controls.enableZoom = false;
		controls.enableRotate = false;
	}, [controls]);

	useEffect(() => {
		// reset frames when rendering done
		if (!isRendering) {
			setFrames(0);
		}

		if (isRendering) {
			handleCameraRotate();
		}
	}, [isRendering, frames]);

	const handleCameraRotate = () => {
		controls.autoRotate = true;
		controls.autoRotateSpeed = 25;

		const rotate = () => {
			if (
				controls.getAzimuthalAngle()?.toFixed(1) ===
					originalCameraAngle?.toFixed(1) &&
				frames > 10
			) {
				onRenderDone();
			} else {
				controls.update();

				setFrames((frames) => frames + 1);

				onFrameDone(gl.domElement.toDataURL());
			}
		};

		rotate();
	};

	return null;
};

type SceneProps = {
	model: BufferGeometry;
	color: number;
};

const ModelScene: FC<SceneProps> = ({ model, color }) => {
	const mesh = useRef<Mesh>();

	return (
		<Bounds fit clip damping={6} margin={1.2}>
			<Center>
				<ambientLight intensity={0.2} />
				<directionalLight />
				<mesh geometry={model} ref={mesh}>
					<meshStandardMaterial color={color} />
				</mesh>
			</Center>
		</Bounds>
	);
};

type ColorArray = [r: number, g: number, b: number];

type ModelViewProps = {
	model: BufferGeometry;
	color: number;
	onFrameDone: (data: string) => void;
	onRenderDone: () => void;
	isRendering: boolean;
};

const ModelView: FC<ModelViewProps> = ({
	model,
	color,
	onFrameDone,
	onRenderDone,
	isRendering,
}) => {
	const backgroundColor = useMemo(() => {
		const bgColor = new Color(color);
		const tintColor = new Color(0xeeeeee);

		return new Color().addColors(bgColor, tintColor).toArray() as ColorArray;
	}, [color]);

	return (
		<Canvas
			camera={{
				fov: 75,
				position: [5, 5, 5],
			}}
			gl={{ preserveDrawingBuffer: true /* make screenshots work */ }}
		>
			<Suspense fallback={null}>
				<color attach="background" args={backgroundColor} />
				<ModelScene model={model} color={color} />
				<CameraController
					onFrameDone={onFrameDone}
					isRendering={isRendering}
					onRenderDone={onRenderDone}
				/>
			</Suspense>
		</Canvas>
	);
};

const UploadModelViewContainer = styled.div<{ $isRendering }>`
	border: 1px solid black;
	width: 100%;
	min-height: 600px;

	${({ $isRendering }) =>
		$isRendering &&
		css`
			width: 800px;
			height: 600px;
		`}
`;

const UploadModelButton = styled.button`
	width: 100%;
	height: 100%;
`;

export const NewModelRenderer: FC = () => {
	const { isRendering, onFrameDone, onRenderDone } = useRenderer();
	const { model, uploadModel, onCanvasReady, prepareCanvas, color } =
		useUpload();
	const containerRef = useRef<HTMLDivElement>();

	useEffect(() => {
		// canvas has to be resized before rendering can begin, otherwise the image is stretched
		if (prepareCanvas && containerRef.current) {
			const canvasObserver = new ResizeObserver((event) => {
				const element = event[0];
				const { width, height } = element.contentRect;
				if (width === 800 && height === 600) {
					// add timeout to make the interaction more smooth
					setTimeout(() => {
						onCanvasReady();
					}, 500);
				}
			});

			canvasObserver.observe(containerRef.current);

			return () => {
				canvasObserver.disconnect();
			};
		}
	}, [containerRef.current, prepareCanvas]);

	return (
		<UploadModelViewContainer $isRendering={prepareCanvas} ref={containerRef}>
			{!model ? (
				<UploadModelButton onClick={uploadModel}>
					Click here to upload model
				</UploadModelButton>
			) : (
				<ModelView
					model={model}
					color={color}
					onFrameDone={onFrameDone}
					isRendering={isRendering}
					onRenderDone={onRenderDone}
				/>
			)}
		</UploadModelViewContainer>
	);
};

export default NewModelRenderer;
