import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux' 
import { ActivityIndicator, Linking, Modal, Text, TextInput, View, StyleSheet, ScrollView, Dimensions } from 'react-native'
import { Button, ListItem } from 'react-native-elements'
import { HeaderBackButton } from 'react-navigation'
import { addMachineCondition, addMachineScore, removeMachineFromLocation } from '../actions/location_actions'
import { formatNumWithCommas } from '../utils/utilityFunctions'
import { RemoveMachine, RemoveMachineModal }  from '../components'
import { EvilIcons } from '@expo/vector-icons'

const moment = require('moment')

let deviceWidth = Dimensions.get('window').width

class MachineDetails extends Component {
    state = {
        showAddConditionModal: false,
        conditionText: '', 
        showAddScoreModal: false,
        score: '',
        showRemoveMachineModal: false,
    }
    
    static navigationOptions = ({ navigation }) => {
        return {
            headerLeft: <HeaderBackButton tintColor="#260204" onPress={() => navigation.goBack(null)} />,
            title: <Text>{`${navigation.getParam('machineName')} @ ${navigation.getParam('locationName')}`}</Text>,
            headerTitleStyle: {width:deviceWidth - 90},
            headerRight: <RemoveMachine />
        }
    }

    cancelAddCondition = () => this.setState({ showAddConditionModal: false, conditionText: '' })

    cancelAddScore = () => this.setState({ showAddScoreModal: false, score: '' })
    
    addCondition = (lmx) => {
        this.props.addMachineCondition(this.state.conditionText, lmx)
        this.setState({ 
            showAddConditionModal: false, 
            conditionText: '',
        })
    }

    addScore = (lmx) => {
        this.props.addMachineScore(this.state.score, lmx)
        this.setState({ showAddScoreModal: false })
    }

    removeLmx = (lmx) => {
        this.props.removeMachineFromLocation(lmx)
        this.setState({ showRemoveMachineModal: false })
    }

    componentDidUpdate(prevProps) {
        if (prevProps.location.curLmx && !this.props.location.curLmx)
            this.props.navigation.goBack()
    }

    render() {
        const { curLmx } = this.props.location   

        if (!curLmx) {
            return (
                <View style={{ flex: 1, padding: 20 }}>
                    <ActivityIndicator />
                </View>
            )   
        }

        const { loggedIn } = this.props.user
        const { ipdb_link } = this.props.machineDetails
        const pintipsUrl = curLmx.machine_group_id ? 
            `http://pintips.net/pinmap/group/${curLmx.machine_group_id}` :
            `http://pintips.net/pinmap/machine/${curLmx.machine_id}`

        const mostRecentComments = curLmx.machine_conditions.length > 0 ? curLmx.machine_conditions.slice(0, 5) : undefined
        const scores = curLmx.machine_score_xrefs.length > 0 ? curLmx.machine_score_xrefs.reverse() : undefined

        return (
            <View>
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.showAddConditionModal}
                >
                    <ScrollView style={{paddingTop: 80}}>
                        <TextInput
                            multiline={true}
                            numberOfLines={4}
                            onChangeText={conditionText => this.setState({ conditionText })}
                            value={this.state.conditionText}
                            style={[{padding:5,height: 100},s.textInput]}
                            placeholder={'Enter machine condition...'}
                        />
                        <Button
                            title={'Add Condition'}
                            disabled={this.state.conditionText.length === 0}
                            onPress={() => this.addCondition(curLmx.id)}
                            raised
                            buttonStyle={s.blueButton}
                            titleStyle={s.titleStyle}
                            style={{borderRadius: 50}}
                            containerStyle={[{borderRadius:50,paddingTop:15},s.margin15]}
                        />
                        <Button
                            title={'Cancel'}
                            onPress={this.cancelAddCondition}
                            raised
                            buttonStyle={s.redButton}
                            titleStyle={{fontSize:18,color:'#f53240'}}
                            style={{borderRadius: 50}}
                            containerStyle={[{borderRadius:50},s.margin15]}
                        />
                    </ScrollView>
                </Modal>
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.showAddScoreModal}
                >
                    <View style={{paddingTop: 100}}>
                        <TextInput 
                            style={[{height: 40,textAlign:'center'},s.textInput]}
                            keyboardType='numeric'
                            onChangeText={score => this.setState({ score })}
                            value={this.state.score}
                            returnKeyType="done"
                            placeholder={'123...'}
                        />
                        <Button 
                            title={'Add Score'}
                            onPress={() => this.addScore(curLmx.id)}
                            raised
                            buttonStyle={s.blueButton}
                            titleStyle={s.titleStyle}
                            style={{borderRadius: 50}}
                            containerStyle={[{borderRadius:50,paddingTop:15},s.margin15]}
                        />
                        <Button 
                            title={'Cancel'}
                            onPress={this.cancelAddScore}
                            raised
                            buttonStyle={s.redButton}
                            titleStyle={{fontSize:18,color:'#f53240'}}
                            style={{borderRadius: 50}}
                            containerStyle={[{borderRadius:50},s.margin15]}
                        />
                    </View>
                </Modal>
                {this.state.showRemoveMachineModal && <RemoveMachineModal closeModal={() => this.setState({showRemoveMachineModal: false})} />}
                <ScrollView>
                    <Text style={{textAlign:'center',marginTop:10}}>{`Added to location: ${moment(curLmx.created_at).format('MMM-DD-YYYY')}`}</Text>
                    
                    <Button
                        title={loggedIn ? 'ADD A NEW CONDITION' : 'Login to add a machine condition'}
                        onPress={loggedIn ? 
                            () => this.setState({ showAddConditionModal: true }) :
                            () => this.props.navigation.navigate('Login')}
                        raised
                        buttonStyle={s.blueButton}
                        titleStyle={s.titleStyle}
                        style={{borderRadius: 50}}
                        containerStyle={[{borderRadius:50},s.margin15]}
                    />
                    <View style={{backgroundColor:'#ffffff',paddingTop:5,paddingBottom:5}}>
                        {mostRecentComments ? 
                            mostRecentComments.map(commentObj => {
                                const { comment, created_at, username } = commentObj
                                return <ListItem
                                    key={commentObj.id}
                                    titleStyle={[{marginLeft:15,marginRight:15},s.conditionText]}
                                    title={`"${comment}"`}
                                    subtitle={`Comment made ${moment(created_at).format('MMM-DD-YYYY')} ${username ? `by ${username}` : ''}`}
                                    subtitleStyle={{marginTop:5,marginLeft:15,marginRight:15}}
                                /> 
                            }) :
                            <Text style={s.noneYet}>No machine condition added yet</Text>
                        }
                    </View>
                    <Button 
                        title={loggedIn ? 'ADD YOUR SCORE' : 'Login to add your high score'}
                        onPress={loggedIn ? 
                            () => this.setState({ showAddScoreModal: true }) :
                            () => this.props.navigation.navigate('Login')
                        }
                        raised
                        buttonStyle={s.blueButton}
                        titleStyle={s.titleStyle}
                        style={{borderRadius: 50}}
                        containerStyle={[{borderRadius:50},s.margin15]}
                    />
                    {scores ? 
                        scores.map(scoreObj => {
                            const {id, score, created_at, username} = scoreObj
        
                            return (
                                <ListItem
                                    containerStyle={{paddingLeft:30}}
                                    key={id}
                                    title={formatNumWithCommas(score)}
                                    subtitle={`Scored on ${moment(created_at).format('MMM-DD-YYYY')} by ${username}`}
                                    titleStyle={{ fontSize: 16, fontWeight: 'bold' }}
                                    subtitleStyle={{ paddingTop:3 }}
                                />)
                        }) : 
                        <Text style={[{paddingTop:5,paddingBottom:5,backgroundColor:'#ffffff'},s.noneYet]}>No scores yet!</Text>
                    }
                    <Button
                        title={'View playing tips on pintips.net'}
                        onPress={() => Linking.openURL(pintipsUrl)}
                        buttonStyle={s.externalLink}
                        titleStyle={{
                            color:"black", 
                            fontSize:16
                        }}
                        iconRight
                        icon={<EvilIcons name='external-link' style={s.externalIcon} />}
                        containerStyle={s.margin15}
                    />
                    <Button
                        title={'View on IPDB'}
                        onPress={() => Linking.openURL(ipdb_link)}
                        buttonStyle={s.externalLink}
                        titleStyle={{
                            color:"black", 
                            fontSize:16
                        }}
                        iconRight
                        icon={<EvilIcons name='external-link' style={s.externalIcon} />}
                        containerStyle={s.margin15}
                    />
                    <Button 
                        title={loggedIn ? 'REMOVE MACHINE' : 'Login to remove machine'}
                        onPress={loggedIn ? 
                            () => this.setState({ showRemoveMachineModal: true }) :
                            () => this.props.navigation.navigate('Login')
                        }
                        raised
                        buttonStyle={s.redButton}
                        titleStyle={{fontSize:18,color:'#f53240'}}
                        style={{borderRadius: 50}}
                        containerStyle={[{borderRadius:50},s.margin15]}
                    />
                </ScrollView>
            </View>
        )
    }
}

const s = StyleSheet.create({
    externalLink: {
        backgroundColor:'rgba(38,2,4,.1)',
        borderWidth: 1,
        borderColor: '#888888',
        borderRadius: 5
    },
    externalIcon: {
        fontSize: 24
    },
    blueButton: {
        backgroundColor:"#D3ECFF",
        borderRadius: 50,
        width: '100%',
        elevation: 0
    },
    redButton: {
        backgroundColor: "#fdd4d7",
        borderRadius: 50,
        width: '100%',
        elevation: 0
    },
    titleStyle: {
        color:"black",
        fontSize:18
    },
    margin15: {
        marginLeft:15,
        marginRight:15,
        marginTop:15,
        marginBottom:15
    },
    italic: {
        fontStyle:'italic'
    },
    conditionText: {
        color: '#555555',
        fontStyle: 'italic',
        fontSize: 16
    },
    noneYet: {
        textAlign:'center',
        paddingLeft:15,
        paddingRight:15,
        fontStyle:'italic',
        color:'#555555'
    },
    textInput: {
        backgroundColor: '#f6f6f6', 
        borderColor: '#888888', 
        borderWidth: 2,
        marginLeft: 20,
        marginRight: 20,
        borderRadius: 5
    },
})

MachineDetails.propTypes = {
    location: PropTypes.object,
    addMachineCondition: PropTypes.func,
    addMachineScore: PropTypes.func,
    navigation: PropTypes.object,
    user: PropTypes.object,
    machineDetails: PropTypes.object,
    removeMachineFromLocation: PropTypes.func,
}

const mapStateToProps = ({ location, user, machines }) => {
    const machineDetails = location.curLmx ? machines.machines.find(m => m.id === location.curLmx.machine_id) : {}
    return ({ location, user, machineDetails })
}
const mapDispatchToProps = (dispatch) => ({
    addMachineCondition: (condition, lmx) => dispatch(addMachineCondition(condition, lmx)),
    addMachineScore: (score, lmx) => dispatch(addMachineScore(score, lmx)),
    removeMachineFromLocation: (lmx) => dispatch(removeMachineFromLocation(lmx))
})
export default connect(mapStateToProps, mapDispatchToProps)(MachineDetails)
