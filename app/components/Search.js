import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
//https://www.peterbe.com/plog/how-to-throttle-and-debounce-an-autocomplete-input-in-react
import { debounce } from 'throttle-debounce'
import { Modal, Text, TouchableOpacity, View, Dimensions, StyleSheet, ScrollView } from 'react-native'
import { Input, ListItem } from 'react-native-elements'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { getData } from '../config/request'

let deviceWidth = Dimensions.get('window').width

class Search extends Component {
    constructor(props) {
        super(props)
        this.state={
            q: '',
            foundItems: [],
            searchModalVisible: false
        }

        this.autocompleteSearchDebounced = debounce(500, this.autocompleteSearch)
        this.waitingFor = ''
    }

    changeQuery = q => {
        this.setState({ q }, () => {
            this.autocompleteSearchDebounced(this.state.q)
        })
    }

    autocompleteSearch = q => {
        this._fetch(q)
    }

    _fetch = async (query) => {        
        this.waitingFor = query
        if (query === '') {
            await this.setState({ foundItems: []})
        } else {
            const foundItems = await getData(`/locations/autocomplete?name=${query}`)
            if (query === this.waitingFor) 
                this.setState({ foundItems })
        }
    }

    render(){
        const { q, foundItems, searchModalVisible } = this.state

        return(
            <View>
                <Modal
                    transparent={true}
                    visible={searchModalVisible}
                    onRequestClose={()=>{}}
                >
                    <View style={{flex:1,backgroundColor:'rgba(255,255,255,1.0)'}}>
                        <View style={{paddingTop: 20, display: 'flex', flexDirection: 'row'}}>
                            <MaterialCommunityIcons 
                                onPress={() => {
                                    this.setState({searchModalVisible: false})
                                    this.changeQuery('')
                                }}
                                name='close-circle' 
                                size={30} 
                                style={{color:'#6a7d8a',marginLeft:5,marginRight:10,marginTop:5}}
                            />
                            <Input
                                placeholder='City, Address, Location'
                                leftIcon={<MaterialIcons name='search' size={25} color="#6a7d8a" style={{marginLeft:-10,marginRight:-8}}/>}
                                rightIcon={<MaterialIcons name='clear' size={20} color="#F53240" onPress={() => this.changeQuery('')} />}
                                onChangeText={query => this.changeQuery(query)}
                                value={q}
                                containerStyle={{paddingTop:4}}
                                inputContainerStyle={s.input}
                                autoFocus
                            />
                        </View>
                        <ScrollView>
                            {foundItems ? 
                                foundItems.map(location => 
                                    (<TouchableOpacity 
                                        key={location.id} 
                                        onPress={() => {
                                            this.props.navigate('LocationDetails', {id: location.id, locationName: location.label})
                                            this.changeQuery('')
                                            this.setState({searchModalVisible: false})
                                        }}>
                                        <ListItem
                                            title={location.label}
                                            titleStyle={{color:'#4b5862',marginBottom:-2,marginTop:-2}}
                                            containerStyle={{borderBottomColor:'#97a5af',borderBottomWidth:1}}
                                        /> 
                                    </TouchableOpacity>)
                                ) :
                                <Text>No search results...</Text>
                            }
                        </ScrollView>
                    </View>
                </Modal>
                <TouchableOpacity onPress={() => this.setState({searchModalVisible: true})}>
                    <View style={s.searchMap}>
                        <MaterialIcons name='search' size={25} color="#97a5af" style={s.searchIcon} />
                        <Text></Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }
}

const s = StyleSheet.create({
    searchMap: {
        width: deviceWidth - 115,
        backgroundColor: '#e3e5e8',
        height: 36,
        borderRadius: 5,
        display: 'flex',
        flexDirection: 'row'
    },
    searchIcon: {
        paddingTop: 5,
        paddingLeft: 5
    },
    input: {
        borderWidth: 0,
        borderColor: '#e3e5e8',
        borderRadius: 5,
        width: deviceWidth - 60,
        backgroundColor: '#e3e5e8',
        height: 36,
        display: 'flex',
        flexDirection: 'row',
        paddingLeft:0
    }
})

Search.propTypes = {
    navigate: PropTypes.func,
}

const mapStateToProps = ({ query, user }) => ({ query, user})
export default connect(mapStateToProps, null)(Search)
