import { FC, FormEvent, InputHTMLAttributes, useRef } from "react";
import { GithubPicker } from "react-color";
import styled, { css } from "styled-components";
import NewModelRenderer from "./ModelUploadRenderer";
import {
	RendererContextProvider,
	UploadContextProvider,
	useRenderer,
	useUpload,
} from "./Contexts";

const colors = [
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
];

const StyledMain = styled.main<{ $isRendering }>`
	width: 95%;
	justify-self: center;
	display: grid;
	position: relative;

	padding-top: 1rem;
	grid-template-rows: min-content 600px;
	grid-template-columns: 100%;
	gap: 2rem;

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

const StyledForm = styled.form`
	display: grid;
	grid-auto-flow: column;
	justify-content: space-between;
`;

const FormInputContainer = styled.span`
	display: grid;
	gap: 1rem;
`;

const NewModelPage: FC = () => {
	const { isRendering } = useRenderer();
	const { renderModel, prepareCanvas, setColor, model } = useUpload();
	const titleRef = useRef<HTMLInputElement>();

	const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		console.log(titleRef.current.value);

		renderModel();
	};

	return (
		<StyledMain $isRendering={isRendering}>
			{/* 	{prepareCanvas && <RenderCover>Render in progress...</RenderCover>} */}
			<StyledForm onSubmit={handleFormSubmit}>
				<FormInputContainer>
					<span>
						<label>Name: </label>
						<input ref={titleRef} required minLength={3} maxLength={20} />
					</span>
					<GithubPicker
						triangle="hide"
						colors={colors}
						onChangeComplete={({ hex }) =>
							setColor(parseInt(hex.replace("#", "0x")))
						}
					/>
				</FormInputContainer>
				<button type="submit" disabled={!model}>
					Upload new model
				</button>
			</StyledForm>
			<NewModelRenderer />
		</StyledMain>
	);
};

export const PageWrapper = () => (
	<RendererContextProvider>
		<UploadContextProvider>
			<NewModelPage />
		</UploadContextProvider>
	</RendererContextProvider>
);
