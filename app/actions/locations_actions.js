import Geocode from 'react-geocode'
import { GOOGLE_MAPS_KEY } from '../config/keys'
import {
    FETCHING_LOCATION_TYPES,
    FETCHING_LOCATION_TYPES_SUCCESS,
    FETCHING_LOCATION_TYPES_FAILURE,
    FETCHING_LOCATIONS,
    FETCHING_LOCATIONS_SUCCESS,
    FETCHING_LOCATIONS_FAILURE,
    SELECT_LOCATION_LIST_FILTER_BY,
    DISPLAY_ERROR
} from './types'
import { getData } from '../config/request'

Geocode.setApiKey(GOOGLE_MAPS_KEY)

export const fetchLocationTypes = (url) => dispatch => {
    dispatch({type: FETCHING_LOCATION_TYPES})

    return getData(url)
        .then(data => dispatch(getLocationTypeSuccess(data)))
        .catch(err => dispatch(getLocationTypeFailure(err)))
}
  
export const getLocationTypeSuccess = (data) => {
    return {
        type: FETCHING_LOCATION_TYPES_SUCCESS,
        locationTypes: data.location_types,
    }
}
  
export const getLocationTypeFailure = () => ({ type: FETCHING_LOCATION_TYPES_FAILURE })

export const getLocations = (lat = '', lon = '', distance = global.STANDARD_DISTANCE) => (dispatch, getState) => {
    dispatch({type: FETCHING_LOCATIONS})

    const { machineId, locationType, numMachines, selectedOperator, curLat, curLon } = getState().query
    const machineQueryString = machineId ? `by_machine_id=${machineId};` : ''
    const locationTypeQueryString = locationType ? `by_type_id=${locationType};` : ''
    const numMachinesQueryString = numMachines ? `by_at_least_n_machines_type=${numMachines};` : ''
    const byOperator = selectedOperator ? `by_operator_id=${selectedOperator};` : ''
    const url = `/locations/closest_by_lat_lon.json?lat=${lat ? lat : curLat};lon=${lon ? lon : curLon};${machineQueryString}${locationTypeQueryString}${numMachinesQueryString}${byOperator}max_distance=${distance};send_all_within_distance=1`

    return getData(url)
        .then(data => dispatch(getLocationsSuccess(data)))
        .catch(err => dispatch(getLocationsFailure(err)))
}
  
export const getLocationsSuccess = (data) => {
    return {
        type: FETCHING_LOCATIONS_SUCCESS,
        locations: data.locations ? data.locations : [],
    }
}
  
export const getLocationsFailure = () => dispatch => {
    dispatch({ type: FETCHING_LOCATIONS_FAILURE })
    dispatch({ type: DISPLAY_ERROR, err: 'Unable to get locations. Please try again later.'})
}

export const selectLocationListFilterBy = idx => {
    return {
        type: SELECT_LOCATION_LIST_FILTER_BY,
        idx,
    }
}
