import { FC } from "react";
import styled from "styled-components";

const LoadingWrapper = styled.div`
	padding: 1rem 1.25rem;

	width: 10rem;
	height: 5rem;

	display: grid;
	justify-content: center;
	align-items: center;
	gap: 0.5rem;
`;

const ProgressWrapper = styled.div`
	display: grid;
	gap: 0.25rem;

	& label {
		font-weight: 300;
	}
`;

const LengthWrapper = styled.div`
	font-weight: 200;
	text-align: center;
`;

type LoadingProps = {
	currentLength: number;
	totalLength: number;
};

const Loading: FC<LoadingProps> = ({ currentLength, totalLength }) => {
	if (!totalLength) {
		return <LoadingWrapper>Initializing...</LoadingWrapper>;
	}

	return (
		<LoadingWrapper>
			<ProgressWrapper>
				<label htmlFor="file">Downloading model</label>
				<progress id="file" value={currentLength} max={totalLength}>
					0%
				</progress>
			</ProgressWrapper>
			<LengthWrapper>
				{currentLength}/{totalLength}
			</LengthWrapper>
		</LoadingWrapper>
	);
};

export default Loading;
