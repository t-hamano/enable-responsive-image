/**
 * WordPress dependencies
 */
import { createReduxStore, register } from '@wordpress/data';

const DEFAULT_STATE = {
	isPreview: false,
};

export const store = createReduxStore( 'enable-responsive-image', {
	reducer: ( state = DEFAULT_STATE, action ) => {
		if ( action.type === 'UPDATE_IS_PREVIEW' ) {
			return {
				...state,
				isPreview: ! state.isPreview,
			};
		}

		return state;
	},
	selectors: {
		getIsPreview( state: { isPreview: boolean } ) {
			return state.isPreview;
		},
	},
	actions: {
		setIsPreview( value ) {
			return {
				type: 'UPDATE_IS_PREVIEW',
				value,
			};
		},
	},
} );

register( store );
