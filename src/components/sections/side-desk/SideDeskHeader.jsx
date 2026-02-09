import { useSettingsContext } from 'providers/SettingsProvider';
import { SET_SIDE_DESK_LOCKED, TOGGLE_SIDE_DESK } from 'reducers/SettingsReducer';
import SideDeskAppBar from './SideDeskAppBar';

const SideDeskHeader = ({ activeView, onViewChange }) => {
  const {
    config: { sideDeskLocked },
    configDispatch,
  } = useSettingsContext();

  const handleLockToggle = (checked) => {
    configDispatch({
      type: SET_SIDE_DESK_LOCKED,
      payload: checked,
    });
  };

  const handleClose = () => {
    configDispatch({
      type: TOGGLE_SIDE_DESK,
    });
  };

  return (
    <SideDeskAppBar
      activeView={activeView}
      onViewChange={onViewChange}
      sideDeskLocked={sideDeskLocked}
      onLockToggle={handleLockToggle}
      onClose={handleClose}
    />
  );
};

export default SideDeskHeader;
