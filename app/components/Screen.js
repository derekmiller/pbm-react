import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { 
    ScrollView,
} from 'react-native'
import { ThemeContext } from 'react-native-elements'

const Screen = (props) => {
    const { theme } = useContext(ThemeContext)
    
    return (
        <ScrollView {...props} style={{ flex: 1,backgroundColor: theme.backgroundColor }}>
            {props.children}
        </ScrollView>
    )
}

Screen.propTypes = {
    children: PropTypes.node,
}

export default Screen
