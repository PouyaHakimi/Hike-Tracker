import React, { useState, useEffect } from "react";
import { Button, Stack } from "react-bootstrap";
import { getHikes } from "../api/hikes";
import HikeCard from "../components/HikeCard";
import ModalMap from "../components/ModalMap";
import Loading from "../components/Loading";
import NoData from "../components/NoData";
import { CgOptions } from "react-icons/cg";
import HikeFilters from "../components/HikeFilters";
import PositionFilterModal from "../components/PositionFilterModal";
import Paginator from "../components/Paginator";

const Hikes = () => {
	// ** State
	const [hikes, setHikes] = useState([]);
	const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, pageSize: 25 });
	const [loading, setLoading] = useState(true);
	const [openFilters, setOpenFilters] = useState(false);
	const [filters, setFilters] = useState({});
	const [showPositionFilter, setShowPositionFilter] = useState(false);
	const [currentHike, setCurrentHike] = useState(null);

	// ** Fetch hikes from API
	useEffect(() => {
		setLoading(true);
		const fetchHikes = async () => {
			const hikes = await getHikes({
				...filters,
				page: pagination.currentPage,
				pageSize: pagination.pageSize,
			});
			if (hikes.error) {
				setHikes(-1);
				setLoading(false);
				return;
			}
			setHikes(hikes.data);
			setPagination(
				(old) =>
					hikes.metadata.find((m) => m.type === "pagination") || {
						...old,
						currentPage: 1,
						totalPages: 0,
					}
			);
			setLoading(false);
		};
		fetchHikes();
	}, [filters, pagination.currentPage, pagination.pageSize]);

	return (
		<div className="w-100">
			<Stack direction="horizontal" className="justify-content-between align-items-center">
				<h1>Hikes</h1>
				<Button
					variant={openFilters ? "success" : "outline-success"}
					style={{ borderRadius: 20 }}
					onClick={() => {
						setOpenFilters(!openFilters);
						if (openFilters) {
							setFilters({}); // Clear filters
						}
					}}
				>
					<CgOptions style={{ marginRight: ".4rem" }} />
					Filters
				</Button>
			</Stack>
			{/* Filters */}
			{openFilters && (
				<HikeFilters
					filters={filters}
					setFilters={setFilters}
					openModal={() => setShowPositionFilter(true)}
				/>
			)}
			{loading && <Loading />}
			{hikes.length <= 0 && !loading && <NoData message={"No hikes found."} />}
			{hikes === -1 && !loading && (
				<NoData message={"Something went wrong during the request. Try again later."} />
			)}
			{hikes.length > 0 &&
				!loading &&
				hikes.map((hike) => <HikeCard key={hike._id} hike={hike} showDetails={setCurrentHike} />)}
			<PositionFilterModal
				show={showPositionFilter}
				setShow={setShowPositionFilter}
				onCancel={() => setShowPositionFilter(false)}
				onOk={(coordinates, radius) => {
					setShowPositionFilter(false);
					setFilters({
						...filters,
						locationCoordinatesLat: coordinates[0],
						locationCoordinatesLng: coordinates[1],
						locationRadius: radius * 1000,
					});
				}}
				onRemoveFilter={() => {
					setShowPositionFilter(false);
					const { locationCoordinatesLat, locationCoordinatesLng, locationRadius, ...f } = filters;
					setFilters(f);
				}}
			></PositionFilterModal>
			<ModalMap handleClose={() => setCurrentHike(null)} hike={currentHike}></ModalMap>
			<Paginator
				setPage={(page) => setPagination({ ...pagination, currentPage: page })}
				setPageSize={(pageSize) => setPagination({ ...pagination, pageSize: pageSize })}
				{...pagination}
			/>
		</div>
	);
};

export default Hikes;
