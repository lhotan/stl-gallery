const MainPage = () => {
	return (
		<AppContainer>
			<StyledHeader>
				<h1>STL Catalog</h1>
				<div>
					<p>Bob Placeholder</p>
					<img src={profilePicture} />
				</div>
			</StyledHeader>
			<StyledSeparator />
			<StyledMain>
				<ModelGrid />
			</StyledMain>
		</AppContainer>
	);
	
};

export default MainPage;
