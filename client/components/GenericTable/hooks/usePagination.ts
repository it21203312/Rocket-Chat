import { useCurrent } from './useCurrent';
import { useItemsPerPage } from './useItemsPerPage';
import { useItemsPerPageLabel } from './useItemsPerPageLabel';
import { useShowingResultsLabel } from './useShowingResultsLabel';

export const usePagination = (): {
	current: ReturnType<typeof useCurrent>[0];
	setCurrent: ReturnType<typeof useCurrent>[1];
	itemsPerPage: ReturnType<typeof useItemsPerPage>[0];
	setItemsPerPage: ReturnType<typeof useItemsPerPage>[1];
	itemsPerPageLabel: ReturnType<typeof useItemsPerPageLabel>;
	showingResultsLabel: ReturnType<typeof useShowingResultsLabel>;
} => {
	const [itemsPerPage, setItemsPerPage] = useItemsPerPage();

	const [current, setCurrent] = useCurrent();

	const itemsPerPageLabel = useItemsPerPageLabel();

	const showingResultsLabel = useItemsPerPageLabel();

	return {
		itemsPerPage,
		setItemsPerPage,
		current,
		setCurrent,
		itemsPerPageLabel,
		showingResultsLabel,
	};
};
