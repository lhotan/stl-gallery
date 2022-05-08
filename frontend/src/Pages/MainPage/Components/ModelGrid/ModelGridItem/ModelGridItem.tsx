type ModelGridItemProps = {
	onClick: () => void;
	isOpen: boolean;
	data: {
		id: string;
		title: string;
		thumbnail: string;
		color: string;
	};
};

export const ModelGridItem: FC<ModelGridItemProps> = ({
	data: { id, title, color, thumbnail },
	onClick,
	isOpen,
}) => {
	const itemRef = useRef<HTMLLIElement>();
	const backgroundRef = useRef<HTMLDivElement>();
	const contentRef = useRef<HTMLDivElement>();
	const thumbnailRef = useRef<HTMLVideoElement>();

	const [openAnimationDone, setOpenAnimationDone] = useState(false);
	const [isHover, setIsHover] = useState(false);

	const [itemCoordinates, setItemCoordinates] = useState<{
		x: number;
		y: number;
	}>({ x: 0, y: 0 });

	const [itemDimensions, setItemDimensions] = useState<{
		width: number;
		height: number;
	}>({ width: 0, height: 0 });

	useEffect(() => {
		thumbnailRef.current.playbackRate = 0.75;
		if (isHover) {
			thumbnailRef.current.play();
		} else {
			thumbnailRef.current.pause();
		}
	}, [isHover]);

	useEffect(() => {
		if (itemRef.current) {
			const { x, y, width, height } = itemRef.current.getBoundingClientRect();
			setItemCoordinates({ x, y });
			setItemDimensions({ width, height });
		}
	}, [itemRef.current]);

	const slideKeyframes = useMemo(
		() => getSlideKeyframes({ itemCoordinates, itemDimensions }),
		[itemCoordinates, itemDimensions]
	);

	const contentKeyframes = useMemo(() => getContentKeyframes(), []);

	useEffect(() => {
		if (isOpen && backgroundRef.current && !openAnimationDone) {
			setOpenAnimationDone(false);
			backgroundRef.current
				.animate(slideKeyframes, {
					fill: "forwards",
					delay: 100,
					duration: 400,
				})
				.addEventListener("finish", () => {
					contentRef.current
						.animate(contentKeyframes, {
							fill: "forwards",
							duration: 400,
						})
						.addEventListener("finish", () => {
							setOpenAnimationDone(true);
						});
				});
		}
	}, [isOpen, backgroundRef.current]);

	const handleContentClose = () => {
		contentRef.current
			.animate(contentKeyframes, {
				direction: "reverse",
				fill: "forwards",
				delay: 100,
				duration: 400,
			})
			.addEventListener("finish", () => {
				backgroundRef.current
					.animate(slideKeyframes, {
						fill: "forwards",
						direction: "reverse",
						duration: 400,
					})
					.addEventListener("finish", () => {
						onClick();
					});
			});
	};

	return (
		<>
			{isOpen && (
				<ContentBackground ref={backgroundRef} onClick={handleContentClose}>
					<GridContent ref={contentRef}>"foo bar baz"</GridContent>
				</ContentBackground>
			)}
			<StyledListItem
				ref={itemRef}
				onClick={onClick}
				$isOpen={isOpen}
				$shadowColor={`#${color.split("0x").pop()}`}
				onPointerEnter={() => setIsHover(true)}
				onPointerLeave={() => setIsHover(false)}
			>
				<ContentTitle>{title}</ContentTitle>
				<GridThumbnail
					ref={thumbnailRef}
					poster={"data:image/png;base64," + thumbnail}
					loop
					disablePictureInPicture
				>
					<source
						src={`http://localhost:4444/thumbnail/${id}`}
						type="video/mp4"
					/>
				</GridThumbnail>
			</StyledListItem>
		</>
	);
};
